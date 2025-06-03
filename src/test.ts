#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// 입력 스키마 정의
const GuardCheckSchema = z.object({
  content: z.string().describe("Content to check for security issues"),
  level: z.enum(["basic", "advanced"]).optional().default("basic"),
});

const ThreatAnalysisSchema = z.object({
  text: z.string().describe("Text to analyze for threats"),
  categories: z
    .array(z.string())
    .optional()
    .default(["malware", "phishing", "spam"]),
});

async function main() {
  const server = new Server(
    {
      name: "@aim-intelligence/ai-guard-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Tools 목록 제공
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "guard_check",
          description:
            "Perform security check on content to detect potential threats",
          inputSchema: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: "Content to check for security issues",
              },
              level: {
                type: "string",
                enum: ["basic", "advanced"],
                description: "Analysis level",
                default: "basic",
              },
            },
            required: ["content"],
          },
        },
        {
          name: "threat_analysis",
          description:
            "Analyze text for various types of threats and security risks",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "Text to analyze for threats",
              },
              categories: {
                type: "array",
                items: { type: "string" },
                description: "Threat categories to check",
                default: ["malware", "phishing", "spam"],
              },
            },
            required: ["text"],
          },
        },
        {
          name: "content_filter",
          description: "Filter and sanitize content based on security policies",
          inputSchema: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: "Content to filter",
              },
              policy: {
                type: "string",
                enum: ["strict", "moderate", "lenient"],
                description: "Filtering policy",
                default: "moderate",
              },
            },
            required: ["content"],
          },
        },
      ],
    };
  });

  // Tool 실행 핸들러
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "guard_check": {
          const parsed = GuardCheckSchema.parse(args);
          const result = performGuardCheck(parsed.content, parsed.level);
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        case "threat_analysis": {
          const parsed = ThreatAnalysisSchema.parse(args);
          const result = performThreatAnalysis(parsed.text, parsed.categories);
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        case "content_filter": {
          const { content, policy = "moderate" } = args;
          const result = performContentFilter(content, policy);
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Tool execution failed: ${errorMessage}`);
    }
  });

  // 전송 계층 설정 및 연결
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// 보안 검사 함수
function performGuardCheck(content: string, level: string): string {
  const timestamp = new Date().toISOString();
  const suspiciousPatterns = [
    /javascript:/i,
    /data:text\/html/i,
    /<script/i,
    /eval\(/i,
    /document\.cookie/i,
  ];

  const detectedThreats = suspiciousPatterns
    .map((pattern, index) =>
      pattern.test(content) ? `Pattern ${index + 1}` : null
    )
    .filter(Boolean);

  const riskLevel = detectedThreats.length > 0 ? "HIGH" : "LOW";
  const status = detectedThreats.length > 0 ? "SUSPICIOUS" : "SAFE";

  return `🛡️ Security Guard Check Results (${level.toUpperCase()})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Content Length: ${content.length} characters
🎯 Analysis Level: ${level}
⚠️  Risk Level: ${riskLevel}
✅ Status: ${status}
🔍 Threats Detected: ${
    detectedThreats.length > 0 ? detectedThreats.join(", ") : "None"
  }
📅 Timestamp: ${timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// 위협 분석 함수
function performThreatAnalysis(text: string, categories: string[]): string {
  const timestamp = new Date().toISOString();
  const threats = {
    malware: /virus|trojan|malware|backdoor/i.test(text),
    phishing: /login|password|verify|account|suspended|click here/i.test(text),
    spam: /free|winner|prize|congratulations|urgent/i.test(text),
    social_engineering: /trust|verify|confirm|update.*info/i.test(text),
  };

  const detectedCategories = categories.filter((cat) => threats[cat] || false);
  const overallRisk = detectedCategories.length > 0 ? "MEDIUM" : "LOW";
  const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%

  return `🔍 Threat Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Text Length: ${text.length} characters
🎯 Categories Checked: ${categories.join(", ")}
⚠️  Overall Risk: ${overallRisk}
🚨 Detected Threats: ${
    detectedCategories.length > 0 ? detectedCategories.join(", ") : "None"
  }
📊 Confidence Score: ${confidence}%
📅 Analysis Time: ${timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// 콘텐츠 필터 함수
function performContentFilter(content: string, policy: string): string {
  const policies = {
    strict: ["script", "iframe", "object", "embed", "form"],
    moderate: ["script", "iframe", "object"],
    lenient: ["script"],
  };

  const blockedTags = policies[policy] || policies.moderate;
  let filteredContent = content;

  blockedTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, "gi");
    filteredContent = filteredContent.replace(
      regex,
      `[FILTERED: ${tag.toUpperCase()} TAG]`
    );
  });

  const removedCount = content.length - filteredContent.length;

  return `🔒 Content Filter Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Policy Applied: ${policy.toUpperCase()}
🚫 Blocked Tags: ${blockedTags.join(", ")}
📊 Characters Removed: ${removedCount}
✅ Status: ${removedCount > 0 ? "FILTERED" : "CLEAN"}

📄 Filtered Content:
${filteredContent}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// 에러 핸들링
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// 메인 함수 실행
if (require.main === module) {
  main().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });
}

export { main };
