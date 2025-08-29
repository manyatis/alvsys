import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const REDDIT_SUBREDDITS = [
  'vibecoding',
  'claudecode', 
  'codex',
  'saas'
];

async function fetchRedditPosts(subreddit: string) {
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
      
      // Add the main post
      complaints.push({
        source: 'reddit',
        sourceUrl: `https://reddit.com${postData.permalink}`,
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
    const allComplaints = [];
    
    // Fetch from all subreddits
    for (const subreddit of REDDIT_SUBREDDITS) {
      console.log(`Fetching from r/${subreddit}...`);
      const complaints = await fetchRedditPosts(subreddit);
      allComplaints.push(...complaints);
      
      // Small delay to be respectful to Reddit's servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Store unique complaints in database
    const stored = [];
    for (const complaint of allComplaints) {
      try {
        // Check if this complaint already exists
        const existing = await prisma.userComplaint.findFirst({
          where: {
            sourceUrl: complaint.sourceUrl
          }
        });

        if (!existing) {
          const created = await prisma.userComplaint.create({
            data: complaint
          });
          stored.push(created);
        }
      } catch (error) {
        console.error('Error storing complaint:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scraped ${allComplaints.length} posts/comments, stored ${stored.length} new complaints`,
      newComplaints: stored.length,
      totalScraped: allComplaints.length
    });
  } catch (error) {
    console.error('Error in scrape-reddit:', error);
    return NextResponse.json(
      { error: 'Failed to scrape Reddit' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all complaints from database
    const complaints = await prisma.userComplaint.findMany({
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