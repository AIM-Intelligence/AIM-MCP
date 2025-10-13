import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerTextGuard(server: McpServer) {
  server.tool(
    'aim-text-guard',
    `AIM-Intelligence Text Guard Tool`,
    {
      text: z.string().describe('Text to analyze for harmful content'),
    },
    async ({ text }) => {
      try {
        const formData = new FormData();
        formData.append('text', text);

        const response = await fetch(
          'https://api.aim-intelligence.com/copilot-guard/detect',
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        return {
          content: [
            {
              type: 'text',
              text: `[🛡️ Text Guard Analysis Result]
Analysis result:
${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error analyzing text: ${
                error instanceof Error ? error.message : 'Unknown error'
              }

    Input Text: "${text}"
    Timestamp: ${new Date().toISOString()}`,
            },
          ],
        };
      }
    }
  );
}
