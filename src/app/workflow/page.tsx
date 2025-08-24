import React from 'react';
import WorkflowContent from './workflow-content';

export const metadata = {
  title: 'Workflow - VibeHero',
  description: 'Discover how Vibe combines coding with project management through GitHub integration, AI agents, and visual boards.',
  keywords: 'workflow, project management, github integration, AI agents, dev mode, kanban boards',
  openGraph: {
    title: 'Workflow - VibeHero',
    description: 'Vibe Coding meets Project Management - A seamless workflow that combines AI agents with visual project management.',
    type: 'website',
  },
};

export default function WorkflowPage() {
  return <WorkflowContent />;
}