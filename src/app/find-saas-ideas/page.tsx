'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, TrendingUp, Brain, AlertTriangle } from 'lucide-react';

interface ComplaintCategory {
  id: string;
  name: string;
  description: string;
  complaintCount: number;
  viabilityScore?: number;
  businessIdeas?: {
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
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | null>(null);
  const [currentStep, setCurrentStep] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/find-saas-ideas/categorize');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const findSaaSIdeas = async () => {
    setProcessing(true);
    setMessage('');
    
    try {
      // Step 1: Scrape Reddit
      setCurrentStep('Scraping Reddit for complaints...');
      const scrapeResponse = await fetch('/api/find-saas-ideas/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const scrapeData = await scrapeResponse.json();
      
      if (!scrapeData.success) {
        throw new Error(scrapeData.message || 'Failed to scrape data');
      }
      
      // Step 2: Categorize complaints
      setCurrentStep('Categorizing similar complaints...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
      
      const categorizeResponse = await fetch('/api/find-saas-ideas/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const categorizeData = await categorizeResponse.json();
      
      if (!categorizeData.success) {
        throw new Error(categorizeData.message || 'Failed to categorize complaints');
      }
      
      // Step 3: Generate business ideas for categories
      setCurrentStep('Generating business ideas with AI...');
      await fetchCategories(); // Refresh categories
      
      // Get categories without business ideas and generate them
      const categoriesResponse = await fetch('/api/find-saas-ideas/categorize');
      const categoriesData = await categoriesResponse.json();
      
      if (categoriesData.success && categoriesData.categories) {
        const categoriesNeedingIdeas = categoriesData.categories.filter(
          (cat: ComplaintCategory) => !cat.businessIdeas && cat.complaintCount >= 2
        );
        
        for (const category of categoriesNeedingIdeas) {
          try {
            await fetch('/api/find-saas-ideas/business-ideas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ categoryId: category.id })
            });
            // Small delay between API calls
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Failed to generate ideas for category ${category.id}:`, error);
          }
        }
      }
      
      // Final refresh
      await fetchCategories();
      
      setMessage(`✅ Complete! Scraped ${scrapeData.totalScraped} posts, found ${scrapeData.newComplaints} new complaints, created ${categorizeData.categories?.length || 0} categories`);
      setCurrentStep('');
      
    } catch (error) {
      console.error('Error in SaaS idea generation:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setCurrentStep('');
    } finally {
      setProcessing(false);
    }
  };

  const handleCategoryClick = async (category: ComplaintCategory) => {
    if (category.businessIdeas) {
      setSelectedCategory(category);
      return;
    }

    // Generate business ideas for this category
    try {
      const response = await fetch('/api/find-saas-ideas/business-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryId: category.id })
      });
      const data = await response.json();
      if (data.success) {
        const updatedCategory = { ...category, businessIdeas: data.businessIdeas, viabilityScore: data.businessIdeas.overallViability };
        setSelectedCategory(updatedCategory);
        // Update categories list
        setCategories(prev => prev.map(c => c.id === category.id ? updatedCategory : c));
      }
    } catch (error) {
      console.error('Error generating business ideas:', error);
      setMessage('Failed to generate business ideas');
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
            disabled={processing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg"
          >
            <Brain className={`h-5 w-5 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Finding SaaS Ideas...' : 'Find SaaS Ideas'}
          </button>

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