import React from 'react';
import FeatureViewer from './feature-viewer';

// Static metadata for better SEO and social sharing
export const metadata = {
  title: 'Features - VibeHero',
  description: 'Discover VibeHero\'s powerful features: Kanban boards, GitHub integration, AI automation, and dev mode for autonomous development.',
  keywords: 'project management, kanban boards, github integration, AI automation, development tools',
  openGraph: {
    title: 'Features - VibeHero',
    description: 'Discover VibeHero\'s powerful features: Kanban boards, GitHub integration, AI automation, and dev mode for autonomous development.',
    type: 'website',
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful <span className="text-purple-600">Features</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              VibeHero combines the best of project management, GitHub integration, and AI automation 
              to create the ultimate development workflow.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 pb-20">
        <FeatureViewer />
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience VibeHero?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Start managing your projects with the power of AI automation and seamless GitHub integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Free
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}