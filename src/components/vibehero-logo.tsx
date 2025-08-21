import React from 'react';

interface VibeHeroLogoProps {
  className?: string;
  gradientId?: string;
}

export default function VibeHeroLogo({ className = "w-8 h-8", gradientId = "gradient" }: VibeHeroLogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 256 256" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="128" cy="128" r="120" fill={`url(#${gradientId})`} />
      
      {/* Clear V shape */}
      <path d="M 70 80 L 128 180 L 186 80" 
            stroke="white" 
            strokeWidth="16" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" />
      
      {/* Agent nodes at strategic points */}
      <circle cx="70" cy="80" r="10" fill="white" />
      <circle cx="186" cy="80" r="10" fill="white" />
      <circle cx="128" cy="180" r="12" fill="#FFE66D" />
      
      {/* Additional agent nodes along the V */}
      <circle cx="99" cy="130" r="6" fill="white" opacity="0.8" />
      <circle cx="157" cy="130" r="6" fill="white" opacity="0.8" />
      
      {/* Network connections between agents */}
      <line x1="70" y1="80" x2="186" y2="80" stroke="white" strokeWidth="2" opacity="0.3" strokeDasharray="4,4" />
      <line x1="99" y1="130" x2="157" y2="130" stroke="white" strokeWidth="2" opacity="0.3" strokeDasharray="4,4" />
      
      {/* Energy/speed lines emanating from the V */}
      <path d="M 50 100 L 30 100" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M 206 100 L 226 100" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M 128 200 L 128 220" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#6366F1" }} />
          <stop offset="100%" style={{ stopColor: "#8B5CF6" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}