import React from 'react';
import FeaturesContent from './features-content';

// Static metadata for better SEO and social sharing
export const metadata = {
  title: 'Features - Agent Workspace Automation Platform',
  description: 'Empower AI agents with structured task queues, institutional knowledge, and automated work sessions. A workspace designed for agent efficiency and cleaner project management.',
  keywords: 'agent workspace, task automation, institutional knowledge, work sessions, agent efficiency, project management, AI collaboration',
  openGraph: {
    title: 'Features - Agent Workspace Automation Platform',
    description: 'Empower AI agents with structured task queues, institutional knowledge, and automated work sessions. A workspace designed for agent efficiency and cleaner project management.',
    type: 'website',
  },
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}