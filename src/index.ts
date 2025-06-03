import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

function createServerInstance() {
  const server = new McpServer({
    name: "AIM-Intelligence AI Guard MCP",
    description: "AI guard MCP",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Register simple hello world tool
  server.tool(
    "aim-hello-world",
    `AIM-Intelligence MCP`,
    {
      name: z.string().describe("user name"),
    },
    async ({ name }) => {
      const greeting = name ? `Hello, ${name}!` : "Hello, World!";

      return {
        content: [
          {
            type: "text",
            text: `🌍 ${greeting}

This is a simple MCP tool example that demonstrates basic functionality.
Current timestamp: ${new Date().toISOString()}

Thank you for using this tool!`,
          },
        ],
      };
    }
  );

  server.tool(
    "aim-text-guard",
    `AIM-Intelligence Text Guard Tool`,
    {
      text: z.string().describe("Text to analyze for harmful content"),
    },
    async ({ text }) => {
      try {
        const formData = new FormData();
        formData.append("text", text);

        const response = await fetch(
          "https://api.aim-intelligence.com/copilot-guard/detect",
          {
            method: "POST",
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
              type: "text",
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
              type: "text",
              text: `❌ Error analyzing text: ${
                error instanceof Error ? error.message : "Unknown error"
              }

    Input Text: "${text}"
    Timestamp: ${new Date().toISOString()}`,
            },
          ],
        };
      }
    }
  );

  return server;
}

async function main() {
  const server = createServerInstance();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // console.warn("AIM-Intelligence MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

export { createServerInstance, main };
