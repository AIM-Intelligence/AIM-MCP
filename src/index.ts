#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// 입력 검증 스키마
const DetectTextSchema = z.object({
  text: z.string().min(1).max(10000), // 최대 10,000자 제한
});

// AIM Copilot Guard API 클라이언트
class AIMCopilotGuardAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://api.aim-intelligence.com/copilot-guard";
  }

  async detectText(text: string): Promise<{
    safe: boolean;
    description: string;
  }> {
    try {
      // 입력 데이터 정화
      const sanitizedText = this.sanitizeInput(text);

      // FormData 생성
      const formData = new FormData();
      formData.append("text", sanitizedText);

      const response = await fetch(`${this.baseUrl}/detect`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "User-Agent": "AIM-MCP-Server/1.0.0",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      // 응답 데이터 검증
      if (
        typeof result.safe !== "boolean" ||
        typeof result.description !== "string"
      ) {
        throw new Error("Invalid API response format");
      }

      return {
        safe: result.safe,
        description: this.sanitizeOutput(result.description),
      };
    } catch (error) {
      console.error("AIM Copilot Guard API Error:", error);
      throw new Error(
        `Text detection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // 입력 데이터 정화
  private sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // HTML 태그 제거
      .replace(/javascript:/gi, "") // JavaScript 프로토콜 제거
      .replace(/data:/gi, "") // Data URL 제거
      .trim()
      .substring(0, 10000); // 최대 길이 제한
  }

  // 출력 데이터 정화
  private sanitizeOutput(output: string): string {
    return output
      .replace(/``````/g, "[CODE_BLOCK_REMOVED]") // 코드 블록 제거
      .replace(/\[INST\]|\[\/INST\]/g, "") // 명령어 태그 제거
      .replace(/\{\{.*?\}\}/g, "[TEMPLATE_REMOVED]") // 템플릿 제거
      .trim();
  }
}

// MCP 서버 생성
const server = new Server(
  {
    name: "AIM-Copilot-Guard-MCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// API 클라이언트 초기화
const aimAPI = new AIMCopilotGuardAPI();

// 도구 목록 제공
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "detect_text_safety",
        description:
          "AIM Copilot Guard API를 사용하여 텍스트의 안전성을 검사합니다",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "안전성을 검사할 텍스트",
              minLength: 1,
              maxLength: 10000,
            },
          },
          required: ["text"],
          additionalProperties: false,
        },
      },
      {
        name: "get_current_time",
        description: "현재 시간을 반환합니다 (응답 확인용)",
        inputSchema: {
          type: "object",
          properties: {
            format: {
              type: "string",
              enum: ["iso", "korean", "unix"],
              description: "시간 형식 (기본값: korean)",
              default: "korean",
            },
            timezone: {
              type: "string",
              description: "타임존 (기본값: Asia/Seoul)",
              default: "Asia/Seoul",
            },
          },
          additionalProperties: false,
        },
      },
    ],
  };
});

// 도구 실행 처리
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "detect_text_safety") {
      // 입력 검증
      const validatedArgs = DetectTextSchema.parse(args);

      // API 호출
      const result = await aimAPI.detectText(validatedArgs.text);

      // 결과 포맷팅
      const safetyStatus = result.safe ? "✅ 안전" : "⚠️ 위험";
      const safetyIcon = result.safe ? "🟢" : "🔴";

      return {
        content: [
          {
            type: "text",
            text:
              `# ${safetyIcon} AIM Copilot Guard 검사 결과\n\n` +
              `**상태**: ${safetyStatus}\n` +
              `**설명**: ${result.description}\n\n` +
              `## 📝 검사된 텍스트\n` +
              `\`\`\`\n${validatedArgs.text.substring(0, 200)}${
                validatedArgs.text.length > 200 ? "..." : ""
              }\n\`\`\`\n\n` +
              `## 📊 검사 정보\n` +
              `- **검사 시간**: ${new Date().toLocaleString("ko-KR", {
                timeZone: "Asia/Seoul",
              })}\n` +
              `- **텍스트 길이**: ${validatedArgs.text.length}자\n` +
              `- **안전 여부**: ${result.safe ? "Safe" : "Unsafe"}\n` +
              `- **제공**: AIM-Intelligence Copilot Guard API`,
          },
        ],
      };
    } else if (name === "get_current_time") {
      const format = (args?.format as string) || "korean";
      const timezone = (args?.timezone as string) || "Asia/Seoul";

      const now = new Date();
      let formattedTime: string;

      switch (format) {
        case "iso":
          formattedTime = now.toISOString();
          break;
        case "unix":
          formattedTime = Math.floor(now.getTime() / 1000).toString();
          break;
        case "korean":
        default:
          formattedTime = now.toLocaleString("ko-KR", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            weekday: "long",
          });
          break;
      }

      return {
        content: [
          {
            type: "text",
            text:
              `# 🕐 현재 시간\n\n` +
              `**시간**: ${formattedTime}\n` +
              `**형식**: ${format}\n` +
              `**타임존**: ${timezone}\n\n` +
              `## 📅 추가 정보\n` +
              `- **ISO 형식**: ${now.toISOString()}\n` +
              `- **Unix 타임스탬프**: ${Math.floor(now.getTime() / 1000)}\n` +
              `- **밀리초**: ${now.getTime()}\n` +
              `- **UTC 오프셋**: ${now.getTimezoneOffset() / -60}시간\n\n` +
              `**상태**: MCP 서버가 정상적으로 작동 중입니다 ✅`,
          },
        ],
      };
    }

    throw new Error(`알 수 없는 도구: ${name}`);
  } catch (error) {
    console.error(`Tool execution error for ${name}:`, error);

    return {
      content: [
        {
          type: "text",
          text:
            `❌ **오류 발생**\n\n` +
            `도구 실행 중 오류가 발생했습니다.\n\n` +
            `**오류 내용**: ${
              error instanceof Error ? error.message : "알 수 없는 오류"
            }\n` +
            `**도구명**: ${name}\n` +
            `**시간**: ${new Date().toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
            })}\n\n` +
            `## 🔧 해결 방법\n` +
            `1. 입력 데이터를 확인해주세요\n` +
            `2. 네트워크 연결을 확인해주세요\n` +
            `3. API 서비스 상태를 확인해주세요`,
        },
      ],
      isError: true,
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIM Copilot Guard MCP Server is running");
}

main().catch((error) => {
  console.error("Server startup error:", error);
  process.exit(1);
});
