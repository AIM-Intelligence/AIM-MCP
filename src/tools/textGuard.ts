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

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(
          'https://api.aim-intelligence.com/copilot-guard/detect',
          {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Validate API response structure
        if (typeof result !== 'object' || result === null) {
          throw new Error('Invalid API response format');
        }

        // Extract only safe fields to prevent malicious response
        const resultData = result as any;
        const safeResult = {
          status: resultData.status || 'unknown',
          risk_level: resultData.risk_level || 'unknown',
          threats_detected: resultData.threats_detected || 0,
        };

        return {
          content: [
            {
              type: 'text',
              text: `[🛡️ Text Guard Analysis Result]
Analysis result:
${JSON.stringify(safeResult, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        // Don't expose sensitive input in error messages
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isTimeout = errorMessage.includes('aborted');

        return {
          content: [
            {
              type: 'text',
              text: `❌ Error analyzing text: ${isTimeout ? 'Request timeout (30s exceeded)' : errorMessage}

    Input length: ${text.length} characters
    Timestamp: ${new Date().toISOString()}`,
            },
          ],
        };
      }
    }
  );
}
