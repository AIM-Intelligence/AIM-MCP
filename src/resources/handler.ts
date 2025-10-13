import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to read markdown files
function readMarkdownFile(category: string, filename: string): string {
  // In CommonJS, __dirname is available
  const filePath = path.join(__dirname, category, `${filename}.md`);
  return fs.readFileSync(filePath, 'utf-8');
}

export function registerResourceHandlers(server: McpServer) {
  // Handle resources/list requests
  server.server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'security-checklist://database',
          name: 'Database Security Checklist',
          description: 'Security checklist for database operations',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-checklist://email',
          name: 'Email Security Checklist',
          description: 'Security checklist for email operations',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-checklist://slack',
          name: 'Slack/Chat Security Checklist',
          description: 'Security checklist for chat/messaging operations',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-checklist://file',
          name: 'File Operations Security Checklist',
          description: 'Security checklist for file operations',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-checklist://web',
          name: 'Web Request Security Checklist',
          description: 'Security checklist for web requests',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-checklist://general',
          name: 'General MCP Security Checklist',
          description: 'General security checklist for all MCP operations',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-policy://data-classification',
          name: 'Data Classification Policy',
          description: 'Policy for classifying and handling data by sensitivity level',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-policy://access-control',
          name: 'Access Control Policy',
          description: 'Policy for managing user access and permissions',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-policy://incident-response',
          name: 'Incident Response Procedure',
          description: 'Procedure for responding to security incidents',
          mimeType: 'text/markdown',
        },
      ],
    };
  });

  // Handle resources/read requests
  server.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params?.uri;
    if (!uri) {
      throw new Error('URI parameter is required');
    }

    // Parse the URI
    const url = new URL(uri);
    const scheme = url.protocol.replace(':', '');
    const type = url.hostname;

    try {
      let content: string;

      if (scheme === 'security-checklist') {
        content = readMarkdownFile('checklists', type);
      } else if (scheme === 'security-policy') {
        content = readMarkdownFile('policies', type);
      } else {
        throw new Error(`Unknown resource scheme: ${scheme}`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: content,
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read resource: ${error.message}`);
      }
      throw new Error('Failed to read resource: Unknown error');
    }
  });
}
