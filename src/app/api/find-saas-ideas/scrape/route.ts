import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ScrapedContent {
  source: string;
  sourceUrl: string;
  dataSourceId?: string;
  subreddit?: string;
  author?: string;
  title?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

async function filterComplaints(posts: ScrapedContent[]): Promise<string[]> {
  if (posts.length === 0) return [];
  
  const prompt = `You are analyzing social media posts to identify genuine customer complaints or frustrations about products, services, or experiences.

RETURN ONLY a JSON array of sourceUrl strings for posts that ARE complaints.

A complaint is:
- Someone expressing frustration, dissatisfaction, or problems with a product/service
- Reporting bugs, issues, or poor experiences
- Asking for help because something isn't working
- Expressing anger or disappointment about a company/product

NOT a complaint:
- General questions or discussions
- Positive feedback or praise  
- Technical tutorials or tips
- Announcements or news
- Memes or jokes
- General conversations

Posts to analyze:
${JSON.stringify(posts.map(p => ({ sourceUrl: p.sourceUrl, title: p.title, content: p.content })), null, 2)}

Return format: ["url1", "url2", "url3"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) return [];
    
    return JSON.parse(result);
  } catch (error) {
    console.error('OpenAI filtering error:', error);
    return posts.map(p => p.sourceUrl); // Return all if filtering fails
  }
}

async function fetchRedditPosts(subreddit: string, dataSourceId?: string, lastScrapedAt?: Date): Promise<ScrapedContent[]> {
  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}.json?limit=25`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SaaSIdeaFinder/1.0)'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch r/${subreddit}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const posts = data.data.children || [];
    
    const complaints = [];
    
    for (const post of posts) {
      const postData = post.data;
      const postCreated = new Date(postData.created_utc * 1000);
      
      // Skip if post is older than last scrape
      if (lastScrapedAt && postCreated <= lastScrapedAt) {
        continue;
      }
      
      // Add the main post
      complaints.push({
        source: 'reddit',
        sourceUrl: `https://reddit.com${postData.permalink}`,
        dataSourceId,
        subreddit: postData.subreddit,
        author: postData.author,
        title: postData.title,
        content: postData.selftext || postData.title,
        metadata: {
          score: postData.score,
          numComments: postData.num_comments,
          created: new Date(postData.created_utc * 1000).toISOString(),
          postId: postData.id
        }
      });

      // Fetch comments for each post
      if (postData.num_comments > 0) {
        try {
          const commentsResponse = await fetch(
            `https://www.reddit.com/r/${subreddit}/comments/${postData.id}.json?limit=10`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SaaSIdeaFinder/1.0)'
              }
            }
          );

          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            if (commentsData[1] && commentsData[1].data && commentsData[1].data.children) {
              for (const comment of commentsData[1].data.children) {
                if (comment.kind === 't1' && comment.data.body) {
                  complaints.push({
                    source: 'reddit',
                    sourceUrl: `https://reddit.com${postData.permalink}${comment.data.id}`,
                    dataSourceId,
                    subreddit: comment.data.subreddit,
                    author: comment.data.author,
                    title: `Re: ${postData.title}`,
                    content: comment.data.body,
                    metadata: {
                      score: comment.data.score,
                      created: new Date(comment.data.created_utc * 1000).toISOString(),
                      commentId: comment.data.id,
                      parentPostId: postData.id,
                      isComment: true
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching comments for post ${postData.id}:`, error);
        }
      }
    }
    
    return complaints;
  } catch (error) {
    console.error(`Error fetching subreddit r/${subreddit}:`, error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataSourceIds } = body; // Allow scraping specific data sources

    // Get active data sources
    const dataSources = dataSourceIds 
      ? await prisma.dataSource.findMany({
          where: {
            id: { in: dataSourceIds },
            isActive: true
          }
        })
      : await prisma.dataSource.findMany({
          where: {
            isActive: true,
            type: 'reddit' // For now, only support Reddit
          }
        });

    if (dataSources.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active data sources found'
      });
    }

    const allComplaints: ScrapedContent[] = [];
    
    // Scrape from all data sources
    for (const dataSource of dataSources) {
      console.log(`Scraping from ${dataSource.name}...`);
      
      if (dataSource.type === 'reddit') {
        const subreddit = (dataSource.config as {subreddit?: string})?.subreddit || dataSource.url.replace('https://reddit.com/r/', '');
        const complaints = await fetchRedditPosts(subreddit, dataSource.id, dataSource.lastScrapedAt || undefined);
        allComplaints.push(...complaints);
      }
      
      // Update last scraped time
      await prisma.dataSource.update({
        where: { id: dataSource.id },
        data: { lastScrapedAt: new Date() }
      });
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Filter posts to only keep actual complaints using OpenAI
    console.log(`Filtering ${allComplaints.length} posts through OpenAI...`);
    const complaintUrls: string[] = [];
    
    // Process in batches of 20 to stay within token limits
    for (let i = 0; i < allComplaints.length; i += 20) {
      const batch = allComplaints.slice(i, i + 20);
      const batchComplaintUrls = await filterComplaints(batch);
      complaintUrls.push(...batchComplaintUrls);
      
      // Small delay between batches
      if (i + 20 < allComplaints.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Filter to only keep actual complaints
    const filteredComplaints = allComplaints.filter(complaint => 
      complaintUrls.includes(complaint.sourceUrl)
    );
    
    console.log(`OpenAI filtered ${allComplaints.length} posts down to ${filteredComplaints.length} complaints`);

    // Store unique complaints in database
    const stored = [];
    for (const complaint of filteredComplaints) {
      try {
        // Check if this complaint already exists
        const existing = await prisma.userComplaint.findFirst({
          where: {
            sourceUrl: complaint.sourceUrl
          }
        });

        if (!existing) {
          const created = await prisma.userComplaint.create({
            data: {
              source: complaint.source,
              sourceUrl: complaint.sourceUrl,
              content: complaint.content,
              title: complaint.title,
              author: complaint.author,
              subreddit: complaint.subreddit,
              metadata: complaint.metadata ? JSON.parse(JSON.stringify(complaint.metadata)) : undefined,
              dataSourceId: complaint.dataSourceId || null
            }
          });
          stored.push(created);
        }
      } catch (error) {
        console.error('Error storing complaint:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scraped ${allComplaints.length} posts/comments, filtered to ${filteredComplaints.length} complaints, stored ${stored.length} new complaints`,
      newComplaints: stored.length,
      totalScraped: allComplaints.length,
      totalFiltered: filteredComplaints.length,
      dataSources: dataSources.map(ds => ({ id: ds.id, name: ds.name }))
    });
  } catch (error) {
    console.error('Error in scrape:', error);
    return NextResponse.json(
      { error: 'Failed to scrape data sources' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all complaints with data source information
    const complaints = await prisma.userComplaint.findMany({
      include: {
        dataSource: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to most recent 100
    });

    return NextResponse.json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}