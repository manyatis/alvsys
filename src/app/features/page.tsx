import React from 'react';
import FeaturesContent from './features-content';

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
  return <FeaturesContent />;
}