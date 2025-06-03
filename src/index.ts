import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

function createServerInstance() {
  const server = new McpServer({
    name: "AIM-Intelligence MCP",
    description: "MCP guard MCP",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Register simple hello world tool
  server.tool(
    "hello-world",
    `AIM-Intelligence MCP`,
    {
      name: z.string().describe("AIM-Intelligence MCP"),
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

  return server;
}

async function main() {
  const server = createServerInstance();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIM-Intelligence MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

export { createServerInstance, main };
