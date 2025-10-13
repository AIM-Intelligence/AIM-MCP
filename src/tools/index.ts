import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAiSafetyGuard } from './aiSafetyGuard.js';
import { registerTextGuard } from './textGuard.js';
import { registerSecurityPromptTool } from './securityPromptTool.js';
import { registerPromptInjectionDetector } from './promptInjectionDetector.js';
import { registerCredentialScanner } from './credentialScanner.js';
import { registerUrlSecurityValidator } from './urlSecurityValidator.js';

export function registerAllTools(server: McpServer) {
  registerAiSafetyGuard(server);
  registerTextGuard(server);
  registerSecurityPromptTool(server);
  registerPromptInjectionDetector(server);
  registerCredentialScanner(server);
  registerUrlSecurityValidator(server);
}

export {
  registerAiSafetyGuard,
  registerTextGuard,
  registerSecurityPromptTool,
  registerPromptInjectionDetector,
  registerCredentialScanner,
  registerUrlSecurityValidator,
};
