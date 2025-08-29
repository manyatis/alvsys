'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, TrendingUp, Brain, AlertTriangle, Database, Search, BarChart3 } from 'lucide-react';

interface Complaint {
  id: string;
  title: string | null;
  content: string;
  source: string;
  sourceUrl: string;
  author: string | null;
  subreddit: string | null;
  createdAt: string;
  scrapedAt: string;
}

interface ComplaintCategory {
  id: string;
  name: string;
  description: string;
  complaintCount: number;
  viabilityScore?: number;
  complaints?: Complaint[];
  businessIdeas?: {
    targetProduct?: string;
    productCategory?: string;
    coreProblems: string[];
    marketAnalysis: string;
    ideas: Array<{
      name: string;
      description: string;
      solution: string;
      targetMarket: string;
      monetization: string;
      challenges: string[];
      viabilityScore: number;
      reasoning: string;
    }>;
    overallViability: number;
    recommendation: 'PURSUE' | 'MAYBE' | 'AVOID';
    criticalNotes: string;
  };
}

export default function FindSaaSIdeasPage() {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scrapingLoader, setScrapingLoader] = useState(false);
  const [embeddingLoader, setEmbeddingLoader] = useState(false);
  const [categorizingLoader, setCategorizingLoader] = useState(false);
  const [businessIdeasLoader, setBusinessIdeasLoader] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const [embeddingStatus, setEmbeddingStatus] = useState<{total: number, withEmbeddings: number, remaining: number, progress: number} | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/find-saas-ideas/categorize');
      const data = await response.json();
      if (data.success) {
        // Sort categories by priority: PURSUE > MAYBE > AVOID > no analysis, then by viability score
        interface Category {
          recommendation?: string;
          analysis?: { viabilityScore?: number };
          businessIdeas?: { recommendation?: string };
          viabilityScore?: number;
          complaintCount?: number;
          [key: string]: unknown;
        }
        const sortedCategories = (data.categories || []).sort((a: Category, b: Category) => {
          // First, sort by recommendation priority
          const getRecommendationPriority = (rec: string | undefined) => {
            switch (rec) {
              case 'PURSUE': return 3;
              case 'MAYBE': return 2;
              case 'AVOID': return 1;
              default: return 0; // No analysis yet
            }
          };
          
          const aPriority = getRecommendationPriority(a.businessIdeas?.recommendation);
          const bPriority = getRecommendationPriority(b.businessIdeas?.recommendation);
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority; // Higher priority first
          }
          
          // If same recommendation, sort by viability score (higher first)
          const aViability = a.viabilityScore || 0;
          const bViability = b.viabilityScore || 0;
          
          if (aViability !== bViability) {
            return bViability - aViability;
          }
          
          // Finally, sort by complaint count (more complaints first)
          return (b.complaintCount || 0) - (a.complaintCount || 0);
        });
        
        setCategories(sortedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmbeddingStatus = async () => {
    try {
      const response = await fetch('/api/find-saas-ideas/embeddings');
      const data = await response.json();
      if (data.success) {
        setEmbeddingStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching embedding status:', error);
    }
  };

  const runScraping = async () => {
    setScrapingLoader(true);
    setMessage('');
    try {
      const response = await fetch('/api/find-saas-ideas/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Scraping complete! Found ${data.newComplaints} new complaints from ${data.totalScraped} posts.`);
        await fetchEmbeddingStatus(); // Refresh embedding status
      } else {
        setMessage(`❌ Scraping failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in scraping:', error);
      setMessage(`❌ Scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setScrapingLoader(false);
    }
  };

  const runEmbeddings = async () => {
    setEmbeddingLoader(true);
    setMessage('');
    try {
      const response = await fetch('/api/find-saas-ideas/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Embeddings complete! Processed ${data.processed} complaints, ${data.errors} errors.`);
        await fetchEmbeddingStatus(); // Refresh embedding status
      } else {
        setMessage(`❌ Embeddings failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in embeddings:', error);
      setMessage(`❌ Embeddings error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEmbeddingLoader(false);
    }
  };

  const runCategorization = async () => {
    setCategorizingLoader(true);
    setMessage('');
    try {
      const response = await fetch('/api/find-saas-ideas/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Categorization complete! Created ${data.categories?.length || 0} new categories.`);
        await fetchCategories(); // Refresh categories
      } else {
        setMessage(`❌ Categorization failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in categorization:', error);
      setMessage(`❌ Categorization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCategorizingLoader(false);
    }
  };

  const runBusinessIdeas = async () => {
    setBusinessIdeasLoader(true);
    setMessage('');
    
    try {
      setCurrentStep('Generating business ideas for categories...');
      
      // Get categories without business ideas
      const categoriesWithoutIdeas = categories.filter(c => !c.businessIdeas);
      
      if (categoriesWithoutIdeas.length === 0) {
        setMessage('✅ All categories already have business ideas');
        setCurrentStep('');
        setBusinessIdeasLoader(false);
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const category of categoriesWithoutIdeas) {
        try {
          setCurrentStep(`Generating ideas for: ${category.name}...`);
          const response = await fetch('/api/find-saas-ideas/business-ideas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId: category.id })
          });
          
          const data = await response.json();
          if (data.success) {
            successCount++;
            // Update the category in state and re-sort
            setCategories(prev => {
              const updated = prev.map(c => 
                c.id === category.id 
                  ? { ...c, businessIdeas: data.businessIdeas, viabilityScore: data.businessIdeas.overallViability }
                  : c
              );
              
              // Re-sort after updating
              return updated.sort((a, b) => {
                const getRecommendationPriority = (rec: string | undefined) => {
                  switch (rec) {
                    case 'PURSUE': return 3;
                    case 'MAYBE': return 2;
                    case 'AVOID': return 1;
                    default: return 0;
                  }
                };
                
                const aPriority = getRecommendationPriority(a.businessIdeas?.recommendation);
                const bPriority = getRecommendationPriority(b.businessIdeas?.recommendation);
                
                if (aPriority !== bPriority) {
                  return bPriority - aPriority;
                }
                
                const aViability = a.viabilityScore || 0;
                const bViability = b.viabilityScore || 0;
                
                if (aViability !== bViability) {
                  return bViability - aViability;
                }
                
                return b.complaintCount - a.complaintCount;
              });
            });
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error generating ideas for category ${category.id}:`, error);
          errorCount++;
        }
      }
      
      setMessage(`✅ Business ideas generation complete: ${successCount} succeeded, ${errorCount} failed`);
      setCurrentStep('');
    } catch (error) {
      console.error('Error in business ideas generation:', error);
      setMessage(`❌ Business ideas error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setCurrentStep('');
    } finally {
      setBusinessIdeasLoader(false);
    }
  };

  const findSaaSIdeas = async () => {
    setProcessing(true);
    setMessage('');
    
    try {
      setCurrentStep('Running complete SaaS idea discovery pipeline...');
      const response = await fetch('/api/find-saas-ideas/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        await fetchCategories(); // Refresh categories
        await fetchEmbeddingStatus(); // Refresh embedding status
      } else {
        setMessage(`❌ Pipeline failed: ${data.message || data.error || 'Unknown error'}`);
      }
      
      setCurrentStep('');
    } catch (error) {
      console.error('Error in complete pipeline:', error);
      setMessage(`❌ Pipeline error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setCurrentStep('');
    } finally {
      setProcessing(false);
    }
  };

  const handleCategoryClick = async (category: ComplaintCategory) => {
    try {
      // First, fetch the category with its complaints if we don't have them
      let categoryWithComplaints = category;
      if (!category.complaints) {
        const response = await fetch(`/api/find-saas-ideas/categorize?categoryId=${category.id}`);
        const data = await response.json();
        if (data.success) {
          categoryWithComplaints = data.category;
        }
      }

      // Generate business ideas if not present
      if (!categoryWithComplaints.businessIdeas) {
        const response = await fetch('/api/find-saas-ideas/business-ideas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ categoryId: category.id })
        });
        const data = await response.json();
        if (data.success) {
          categoryWithComplaints = { 
            ...categoryWithComplaints, 
            businessIdeas: data.businessIdeas, 
            viabilityScore: data.businessIdeas.overallViability 
          };
          // Update categories list and maintain sorting
          setCategories(prev => {
            const updated = prev.map(c => c.id === category.id ? categoryWithComplaints : c);
            
            // Re-sort after updating
            return updated.sort((a, b) => {
              const getRecommendationPriority = (rec: string | undefined) => {
                switch (rec) {
                  case 'PURSUE': return 3;
                  case 'MAYBE': return 2;
                  case 'AVOID': return 1;
                  default: return 0;
                }
              };
              
              const aPriority = getRecommendationPriority(a.businessIdeas?.recommendation);
              const bPriority = getRecommendationPriority(b.businessIdeas?.recommendation);
              
              if (aPriority !== bPriority) {
                return bPriority - aPriority;
              }
              
              const aViability = a.viabilityScore || 0;
              const bViability = b.viabilityScore || 0;
              
              if (aViability !== bViability) {
                return bViability - aViability;
              }
              
              return b.complaintCount - a.complaintCount;
            });
          });
        }
      }

      setSelectedCategory(categoryWithComplaints);
    } catch (error) {
      console.error('Error loading category details:', error);
      setMessage('Failed to load category details');
    }
  };

  const getRecommendationColor = (recommendation?: string) => {
    switch (recommendation) {
      case 'PURSUE': return 'text-green-600 bg-green-50';
      case 'MAYBE': return 'text-yellow-600 bg-yellow-50';
      case 'AVOID': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getViabilityColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    fetchCategories();
    fetchEmbeddingStatus();
  }, []);

  if (selectedCategory) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Categories
          </button>
          <h1 className="text-3xl font-bold mb-2">{selectedCategory.name}</h1>
          <p className="text-gray-600 mb-4">{selectedCategory.description}</p>
          <div className="text-sm text-gray-500">
            {selectedCategory.complaintCount} complaints in this category
          </div>
        </div>

        {selectedCategory.businessIdeas && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Business Analysis</h2>
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${getRecommendationColor(selectedCategory.businessIdeas.recommendation)}`}>
                  {selectedCategory.businessIdeas.recommendation}
                </span>
              </div>

              {/* Target Product Section */}
              {(selectedCategory.businessIdeas.targetProduct || selectedCategory.businessIdeas.productCategory) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Target Analysis</h3>
                  <div className="text-sm text-blue-800">
                    {selectedCategory.businessIdeas.targetProduct && (
                      <p><span className="font-medium">Primary Target:</span> {selectedCategory.businessIdeas.targetProduct}</p>
                    )}
                    {selectedCategory.businessIdeas.productCategory && (
                      <p><span className="font-medium">Category:</span> {selectedCategory.businessIdeas.productCategory}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Core Problems</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {selectedCategory.businessIdeas.coreProblems.map((problem, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                        {problem}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Market Analysis</h3>
                  <p className="text-sm text-gray-700">{selectedCategory.businessIdeas.marketAnalysis}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Overall Viability:</span>
                  <span className={`font-medium ${getViabilityColor(selectedCategory.businessIdeas.overallViability)}`}>
                    {Math.round(selectedCategory.businessIdeas.overallViability * 100)}%
                  </span>
                </div>
              </div>

              {selectedCategory.businessIdeas.criticalNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Critical Notes</h4>
                      <p className="text-sm text-yellow-700">{selectedCategory.businessIdeas.criticalNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedCategory.businessIdeas.ideas.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Business Ideas</h2>
                <div className="grid gap-4">
                  {selectedCategory.businessIdeas.ideas.map((idea, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{idea.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getViabilityColor(idea.viabilityScore)}`}>
                          {Math.round(idea.viabilityScore * 100)}%
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{idea.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Solution</h4>
                          <p className="text-gray-700">{idea.solution}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Target Market</h4>
                          <p className="text-gray-700">{idea.targetMarket}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Monetization</h4>
                          <p className="text-gray-700">{idea.monetization}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Challenges</h4>
                          <ul className="text-gray-700">
                            {idea.challenges.map((challenge, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 mb-1">AI Reasoning</h4>
                        <p className="text-sm text-gray-700">{idea.reasoning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Complaints Section */}
            {selectedCategory.complaints && selectedCategory.complaints.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  Customer Complaints
                  <span className="text-sm text-gray-500 font-normal">({selectedCategory.complaints.length})</span>
                </h2>
                
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {selectedCategory.complaints.map((complaint) => (
                    <div key={complaint.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded">{complaint.source}</span>
                          {complaint.subreddit && <span>r/{complaint.subreddit}</span>}
                          {complaint.author && <span>by {complaint.author}</span>}
                          <span>{new Date(complaint.scrapedAt).toLocaleDateString()}</span>
                        </div>
                        {complaint.sourceUrl && (
                          <a
                            href={complaint.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      
                      {complaint.title && (
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">{complaint.title}</h4>
                      )}
                      
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {complaint.content.length > 300 
                          ? `${complaint.content.substring(0, 300)}...` 
                          : complaint.content
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find SaaS Ideas</h1>
        <p className="text-gray-600">
          Monitor Reddit for customer complaints and identify business opportunities
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={findSaaSIdeas} 
            disabled={processing || scrapingLoader || embeddingLoader || categorizingLoader}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg"
          >
            <Brain className={`h-5 w-5 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Finding SaaS Ideas...' : 'Run All Steps'}
          </button>

        </div>

        {/* Individual Step Buttons */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Or run individual steps:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: Scraping */}
            <button
              onClick={runScraping}
              disabled={scrapingLoader || processing}
              className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all shadow-sm"
            >
              <Search className={`h-4 w-4 text-blue-600 ${scrapingLoader ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="font-medium text-sm">1. Scrape Data</div>
                <div className="text-xs text-gray-500">Fetch complaints from Reddit</div>
              </div>
            </button>

            {/* Step 2: Embeddings */}
            <button
              onClick={runEmbeddings}
              disabled={embeddingLoader || processing}
              className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all shadow-sm"
            >
              <Database className={`h-4 w-4 text-green-600 ${embeddingLoader ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="font-medium text-sm">2. Generate Embeddings</div>
                <div className="text-xs text-gray-500">
                  {embeddingStatus ? `${embeddingStatus.remaining} remaining` : 'Process complaints'}
                </div>
              </div>
            </button>

            {/* Step 3: Categorization */}
            <button
              onClick={runCategorization}
              disabled={categorizingLoader || processing}
              className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all shadow-sm"
            >
              <BarChart3 className={`h-4 w-4 text-purple-600 ${categorizingLoader ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="font-medium text-sm">3. Categorize</div>
                <div className="text-xs text-gray-500">Group similar complaints</div>
              </div>
            </button>

            {/* Step 4: Business Ideas */}
            <button
              onClick={runBusinessIdeas}
              disabled={businessIdeasLoader || processing}
              className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all shadow-sm"
            >
              <Brain className={`h-4 w-4 text-orange-600 ${businessIdeasLoader ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="font-medium text-sm">4. Generate Ideas</div>
                <div className="text-xs text-gray-500">AI business analysis</div>
              </div>
            </button>
          </div>

          {/* Progress indicator for embeddings */}
          {embeddingStatus && embeddingStatus.total > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Embedding Progress</span>
                <span>{embeddingStatus.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{width: `${embeddingStatus.progress}%`}}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {embeddingStatus.withEmbeddings} / {embeddingStatus.total} complaints processed
              </div>
            </div>
          )}
        </div>

        {currentStep && (
          <div className="flex items-center gap-3 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {currentStep}
          </div>
        )}

        {message && (
          <div className={`text-sm font-medium px-4 py-2 rounded-lg ${
            message.startsWith('✅') ? 'text-green-700 bg-green-50' : 
            message.startsWith('❌') ? 'text-red-700 bg-red-50' : 
            'text-blue-700 bg-blue-50'
          }`}>
            {message}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="py-12 text-center">
                <p className="text-gray-500 mb-4">No SaaS ideas found yet.</p>
                <p className="text-sm text-gray-400">Click &quot;Find SaaS Ideas&quot; to discover business opportunities from customer complaints</p>
              </div>
            </div>
          ) : (
            categories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                    </div>
                    {category.viabilityScore !== undefined && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm font-medium ${getViabilityColor(category.viabilityScore)}`}>
                          {Math.round(category.viabilityScore * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {category.complaintCount} complaints
                      </span>
                      {category.businessIdeas && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRecommendationColor(category.businessIdeas.recommendation)}`}>
                          {category.businessIdeas.recommendation}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}