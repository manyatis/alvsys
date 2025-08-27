import React from 'react';
import WorkflowContent from './workflow-content';

export const metadata = {
  title: 'Workflow - MemoLab | Turn GitHub Issues Into AI Memory',
  description: 'The semantic layer workflow that transforms GitHub issues into vectorized memory banks for AI agents. Growing project intelligence.',
  keywords: 'semantic layer, GitHub vectorization, AI memory bank, project intelligence, vector workflow, AI agents memory',
  openGraph: {
    title: 'Workflow - MemoLab | Turn GitHub Issues Into AI Memory',
    description: 'The semantic layer workflow that transforms GitHub issues into vectorized memory banks for AI agents. Growing project intelligence.',
    type: 'website',
  },
};

export default function WorkflowPage() {
  return <WorkflowContent />;
}