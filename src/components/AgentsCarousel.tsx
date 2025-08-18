"use client";

import React from "react";
import "./carousel.css";

type Agent = {
  id: string;
  name: string;
  logo: React.ReactNode;
  verified: boolean;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  description?: string;
};

const ClaudeCodeLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-[#CC785C] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
      <path d="M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
    </svg>
  </div>
);

const OpenAILogo = () => (
  <div className="w-8 h-8 rounded-lg bg-[#10a37f] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
      <path d="M12.006 2C13.106 2.279 14.065 2.885 14.74 3.726C15.414 4.567 15.765 5.594 15.74 6.64C16.894 6.89 17.929 7.532 18.679 8.456C19.429 9.38 19.845 10.534 19.86 11.73C19.58 12.83 18.974 13.789 18.133 14.464C17.292 15.138 16.265 15.489 15.22 15.464C14.97 16.618 14.328 17.653 13.404 18.403C12.48 19.153 11.326 19.569 10.13 19.584C9.03 19.305 8.071 18.699 7.396 17.858C6.722 17.017 6.371 15.99 6.396 14.944C5.242 14.694 4.207 14.052 3.457 13.128C2.707 12.204 2.291 11.05 2.276 9.854C2.556 8.754 3.162 7.795 4.003 7.12C4.844 6.446 5.871 6.095 6.917 6.12C7.167 4.966 7.809 3.931 8.733 3.181C9.657 2.431 10.811 2.015 12.007 2H12.006ZM12.006 3.2C11.206 3.183 10.423 3.427 9.777 3.896C9.131 4.365 8.658 5.031 8.426 5.794C8.194 6.557 8.217 7.374 8.491 8.123C8.765 8.871 9.275 9.513 9.946 9.944C10.617 10.375 11.412 10.572 12.206 10.506C13 10.44 13.747 10.115 14.339 9.582C14.931 9.049 15.334 8.338 15.489 7.554C15.644 6.77 15.542 5.957 15.201 5.236C14.859 4.515 14.295 3.925 13.586 3.549C12.877 3.173 12.06 3.031 11.266 3.143C11.513 3.162 11.757 3.177 12.006 3.2Z"/>
    </svg>
  </div>
);

const CursorLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-[#007ACC] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
      <path d="M0,0L24,12L0,24L6,12L0,0Z"/>
    </svg>
  </div>
);

const GitHubCopilotLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-[#24292e] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2Z"/>
    </svg>
  </div>
);

const ReplitLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-[#F26207] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
      <path d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17L12 12L2 17Z"/>
    </svg>
  </div>
);

const V0Logo = () => (
  <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
    <span className="text-white text-xs font-mono font-bold">v0</span>
  </div>
);

const GeminiLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
    </svg>
  </div>
);

const DevinLogo = () => (
  <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
      <path d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17L12 12L2 17Z"/>
    </svg>
  </div>
);

const agents: Agent[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    logo: <ClaudeCodeLogo />,
    verified: true,
    verificationStatus: 'verified',
  },
  {
    id: "openai-codex",
    name: "OpenAI Codex",
    logo: <OpenAILogo />,
    verified: true,
    verificationStatus: 'verified',
  },
  {
    id: "cursor",
    name: "Cursor AI",
    logo: <CursorLogo />,
    verified: false,
    verificationStatus: 'pending',
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    logo: <GitHubCopilotLogo />,
    verified: false,
    verificationStatus: 'pending',
  },
  {
    id: "replit-ai",
    name: "Replit AI",
    logo: <ReplitLogo />,
    verified: false,
    verificationStatus: 'pending',
  },
  {
    id: "v0",
    name: "Vercel v0",
    logo: <V0Logo />,
    verified: false,
    verificationStatus: 'pending',
  },
  {
    id: "gemini",
    name: "Google Gemini",
    logo: <GeminiLogo />,
    verified: false,
    verificationStatus: 'pending',
  },
  {
    id: "devin",
    name: "Devin AI",
    logo: <DevinLogo />,
    verified: false,
    verificationStatus: 'pending',
  },
];

export default function AgentsCarousel() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-3 py-4 max-w-4xl mx-auto">
      {agents.map((agent) => {
        const isPending = agent.verificationStatus === 'pending';
        
        return (
          <div
            key={agent.id}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-sm border transition-all ${
              isPending 
                ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 opacity-60' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className={isPending ? 'opacity-60' : ''}>
              {agent.logo}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-medium ${
                isPending 
                  ? 'text-gray-600 dark:text-gray-400' 
                  : 'text-slate-900 dark:text-white'
              }`}>
                {agent.name}
              </span>
              {agent.verificationStatus === 'verified' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-emerald-500"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {agent.verificationStatus === 'pending' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-yellow-500"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}