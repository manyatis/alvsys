import React from 'react';
import FeaturesContent from './features-content';

// Static metadata for better SEO and social sharing
export const metadata = {
  title: 'Features - MemoLab | The Semantic Layer for AI Project Memory',
  description: 'Turn GitHub issues into vectorized AI memory. The semantic layer between AI agents and project management tools that makes agents smarter over time.',
  keywords: 'semantic layer, vector database, GitHub issues, AI memory, project intelligence, vectorized memory bank, AI agents',
  openGraph: {
    title: 'Features - MemoLab | The Semantic Layer for AI Project Memory',
    description: 'Turn GitHub issues into vectorized AI memory. The semantic layer between AI agents and project management tools that makes agents smarter over time.',
    type: 'website',
  },
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}