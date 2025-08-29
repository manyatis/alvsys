import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Starting complete SaaS idea discovery process...');
    const results = {
      scraping: null,
      embeddings: null,
      categorization: null,
      businessIdeas: null
    };

    // Step 1: Scrape data
    console.log('Step 1: Scraping data...');
    const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/find-saas-ideas/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (!scrapeResponse.ok) {
      throw new Error('Scraping failed');
    }
    
    results.scraping = await scrapeResponse.json();
    
    if (!results.scraping.success) {
      throw new Error(`Scraping failed: ${results.scraping.message}`);
    }

    // Step 2: Generate embeddings
    console.log('Step 2: Generating embeddings...');
    const embeddingsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/find-saas-ideas/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!embeddingsResponse.ok) {
      throw new Error('Embeddings generation failed');
    }
    
    results.embeddings = await embeddingsResponse.json();
    
    if (!results.embeddings.success) {
      throw new Error(`Embeddings failed: ${results.embeddings.error}`);
    }

    // Step 3: Categorize complaints
    console.log('Step 3: Categorizing complaints...');
    const categorizeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/find-saas-ideas/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!categorizeResponse.ok) {
      throw new Error('Categorization failed');
    }
    
    results.categorization = await categorizeResponse.json();
    
    if (!results.categorization.success) {
      throw new Error(`Categorization failed: ${results.categorization.error}`);
    }

    // Step 4: Generate business ideas for new categories
    console.log('Step 4: Generating business ideas...');
    if (results.categorization.categories && results.categorization.categories.length > 0) {
      const businessIdeasResults = [];
      
      for (const category of results.categorization.categories) {
        try {
          const businessIdeasResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/find-saas-ideas/business-ideas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId: category.id })
          });
          
          if (businessIdeasResponse.ok) {
            const businessIdeasData = await businessIdeasResponse.json();
            if (businessIdeasData.success) {
              businessIdeasResults.push({
                categoryId: category.id,
                categoryName: category.name,
                success: true,
                businessIdeas: businessIdeasData.businessIdeas
              });
            }
          }
          
          // Small delay between API calls
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to generate ideas for category ${category.id}:`, error);
          businessIdeasResults.push({
            categoryId: category.id,
            categoryName: category.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      results.businessIdeas = businessIdeasResults;
    }

    return NextResponse.json({
      success: true,
      message: `✅ Complete pipeline finished! Scraped ${results.scraping.totalScraped} posts, found ${results.scraping.newComplaints} new complaints, processed ${results.embeddings.processed} embeddings, created ${results.categorization.categories?.length || 0} categories`,
      results,
      summary: {
        totalScraped: results.scraping.totalScraped,
        newComplaints: results.scraping.newComplaints,
        embeddingsProcessed: results.embeddings.processed,
        categoriesCreated: results.categorization.categories?.length || 0,
        businessIdeasGenerated: results.businessIdeas?.filter(r => r.success).length || 0
      }
    });
  } catch (error) {
    console.error('Error in complete pipeline:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Pipeline failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}