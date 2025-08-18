"use client";

import React from "react";

type Agent = {
  id: string;
  name: string;
  logo: React.ReactNode;
  verified: boolean;
  description?: string;
};

const ClaudeLogo = () => (
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
    C
  </div>
);

const CodexLogo = () => (
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
    CX
  </div>
);

const agents: Agent[] = [
  {
    id: "claude-code",
    name: "Claude Clode",
    logo: <ClaudeLogo />,
    verified: true,
    description: "Verified to interact with your project board.",
  },
  {
    id: "codex-cli",
    name: "Codex CLI",
    logo: <CodexLogo />,
    verified: true,
    description: "Verified to interact with your project board.",
  },
];

export default function AgentsCarousel() {
  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Verified Agents
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Agents verified to work with your VibeHero project board.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory px-1"
               aria-label="Verified agents carousel">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="min-w-[280px] max-w-sm snap-center shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-5 backdrop-blur-sm"
                role="group"
                aria-roledescription="slide"
                aria-label={agent.name}
              >
                <div className="flex items-center gap-4 mb-4">
                  {agent.logo}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {agent.name}
                      </h3>
                      {agent.verified && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3.5 h-3.5"
                            aria-hidden
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    {agent.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {agent.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reserved for future per-agent actions */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
