#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as pkg from '../package.json';
import { registerAllTools } from './tools/index.js';
import { registerResourceHandlers } from './resources/index.js';
import { registerPromptHandlers } from './prompts/index.js';

function createServerInstance() {
  const server = new McpServer({
    name: 'AIM-Intelligence AI Guard MCP',
    description: 'AI guard MCP',
    version: (pkg as any).version,
  });

  // Register capabilities BEFORE registering handlers
  server.server.registerCapabilities({
    resources: {},
    tools: {},
    prompts: {},
  });

  // Register all tools
  registerAllTools(server);

  // Register resource handlers
  registerResourceHandlers(server);

  // Register prompt handlers
  registerPromptHandlers(server);

  return server;
}

async function main() {
  const server = createServerInstance();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.warn('AIM-Intelligence MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

export { createServerInstance, main };
