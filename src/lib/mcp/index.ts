#!/usr/bin/env node

/**
 * VibeHero MCP Server Entry Point
 * 
 * This file serves as the main entry point for the MCP server.
 * It can be run as a standalone Node.js process or imported as a module.
 */

import VibeHeroMCPServer from './server.js';

async function main() {
  try {
    const server = new VibeHeroMCPServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { default as VibeHeroMCPServer } from './server.js';
export { MCPAuthHandler, getMCPAuth } from './auth.js';
export type { MCPUser } from './auth.js';