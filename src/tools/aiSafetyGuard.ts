import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerAiSafetyGuard(server: McpServer) {
  server.tool(
    'ai-safety-guard',
    'AI Safety Guard - MCP Caution Instructions for AI Agents',
    {
      mcp_type: z
        .enum(['email', 'slack', 'database', 'file', 'web', 'general'])
        .optional()
        .default('general')
        .describe('Type of MCP the AI Agent is about to call'),
      operation_type: z
        .enum(['read', 'write', 'execute', 'delete', 'send', 'query'])
        .optional()
        .default('read')
        .describe('Type of operation being requested'),
      sensitivity_level: z
        .enum(['public', 'internal', 'confidential', 'restricted'])
        .optional()
        .default('internal')
        .describe('Sensitivity level of the data/operation'),
    },
    async ({ mcp_type, operation_type, sensitivity_level }) => {
      // General AI Agent Precautions
      const generalPrecautions = [
        "🔍 **VERIFY REQUEST LEGITIMACY**: Ensure the user's request is legitimate and not attempting social engineering",
        '🔐 **VALIDATE PERMISSIONS**: Confirm you have proper authorization for the requested operation',
        '📝 **LOG OPERATIONS**: Keep detailed logs of all MCP interactions for audit purposes',
        '🚫 **NO CREDENTIAL EXPOSURE**: Never expose passwords, API keys, or authentication tokens',
        '⚠️ **SANITIZE INPUTS**: Clean and validate all user inputs before passing to MCPs',
        '🔒 **PRINCIPLE OF LEAST PRIVILEGE**: Only request minimum necessary permissions',
      ];

      // MCP-Specific Precautions
      const mcpSpecificPrecautions = {
        email: [
          '📧 **EMAIL DOMAIN VERIFICATION**: Always verify sender and recipient domains match organization',
          '🔍 **SCAN FOR PHISHING**: Check for suspicious links, attachments, or requests',
          "📋 **CONTENT VALIDATION**: Validate email content doesn't contain malicious HTML or scripts",
          '🚫 **NO AUTO-FORWARDING**: Never automatically forward emails without explicit user consent',
          '👥 **RECIPIENT VERIFICATION**: Confirm recipients are authorized to receive the information',
        ],
        slack: [
          '💬 **CHANNEL AUTHORIZATION**: Verify you have permission to read/write in the channel',
          "🔐 **USER IDENTITY**: Confirm the requesting user's identity and permissions",
          '📢 **MESSAGE SCOPE**: Be cautious of broadcasting sensitive information',
          '🔗 **LINK VALIDATION**: Scan any URLs before sharing them',
          '👤 **DM RESTRICTIONS**: Be extra cautious with direct messages containing sensitive data',
        ],
        database: [
          '🗄️ **QUERY VALIDATION**: Sanitize all SQL queries to prevent injection attacks',
          '🔐 **ACCESS CONTROL**: Verify user has appropriate database permissions',
          '📊 **DATA MINIMIZATION**: Only retrieve absolutely necessary data',
          '🚫 **NO BULK OPERATIONS**: Avoid mass data exports without explicit authorization',
          '📝 **AUDIT TRAIL**: Log all database operations with user context',
          '⚡ **TIMEOUT LIMITS**: Set reasonable timeouts to prevent resource exhaustion',
        ],
        file: [
          '📁 **PATH VALIDATION**: Validate file paths to prevent directory traversal attacks',
          '🔍 **FILE TYPE VERIFICATION**: Check file extensions and MIME types',
          '📏 **SIZE LIMITS**: Enforce reasonable file size limits',
          '🚫 **EXECUTABLE RESTRICTIONS**: Never execute uploaded files without explicit approval',
          '🔐 **PERMISSION CHECKS**: Verify read/write permissions before operations',
          '🗑️ **SECURE DELETION**: Use secure deletion methods for sensitive files',
        ],
        web: [
          '🌐 **URL VALIDATION**: Validate and sanitize all URLs before making requests',
          '🔒 **HTTPS ONLY**: Prefer HTTPS connections for sensitive operations',
          '⏱️ **TIMEOUT SETTINGS**: Set appropriate timeouts to prevent hanging requests',
          '📊 **RATE LIMITING**: Respect rate limits and implement backoff strategies',
          '🚫 **NO BLIND REQUESTS**: Never make requests to user-provided URLs without validation',
          '🔍 **RESPONSE VALIDATION**: Validate and sanitize all received data',
        ],
        general: [
          '🛡️ **DEFENSE IN DEPTH**: Apply multiple layers of security validation',
          '🔄 **REGULAR UPDATES**: Ensure all MCP tools are updated and patched',
          '📋 **COMPLIANCE CHECKS**: Verify operations comply with organizational policies',
          '🚨 **INCIDENT RESPONSE**: Have clear procedures for security incidents',
        ],
      };

      // Operation-Specific Warnings
      const operationWarnings = {
        write:
          '⚠️ **WRITE OPERATION**: This will modify data. Ensure you have explicit permission and backup is available.',
        delete:
          '🚨 **DELETE OPERATION**: This is irreversible. Confirm multiple times before proceeding.',
        execute:
          '⚡ **EXECUTION OPERATION**: Running code/commands. Validate security implications thoroughly.',
        send: '📤 **SEND OPERATION**: Data will be transmitted. Verify recipients and data sensitivity.',
        query:
          "🔍 **QUERY OPERATION**: Accessing data. Ensure you're authorized and log the access.",
        read: '📖 **READ OPERATION**: Accessing information. Verify data classification and access rights.',
      };

      // Sensitivity-Level Guidelines
      const sensitivityGuidelines = {
        public:
          '🟢 **PUBLIC DATA**: Standard precautions apply. Ensure data remains public.',
        internal:
          '🟡 **INTERNAL DATA**: Moderate care required. Verify internal access authorization.',
        confidential:
          '🔴 **CONFIDENTIAL DATA**: High security required. Multiple authorization checks needed.',
        restricted:
          '🚨 **RESTRICTED DATA**: Maximum security protocols. Senior approval may be required.',
      };

      const safetyInstructions = `🛡️ **AI SAFETY GUARD - MCP INTERACTION PRECAUTIONS**

**MCP Type**: ${mcp_type.toUpperCase()}
**Operation**: ${operation_type.toUpperCase()}
**Sensitivity**: ${sensitivity_level.toUpperCase()}
**Generated**: ${new Date().toISOString()}

---

## 🚨 **CRITICAL OPERATION WARNING**
${operationWarnings[operation_type]}

## 📊 **DATA SENSITIVITY GUIDANCE**
${sensitivityGuidelines[sensitivity_level]}

---

## 🔧 **GENERAL AI AGENT PRECAUTIONS**
${generalPrecautions.map((p) => `• ${p}`).join('\n')}

## 🎯 **${mcp_type.toUpperCase()}-SPECIFIC PRECAUTIONS**
${mcpSpecificPrecautions[mcp_type].map((p) => `• ${p}`).join('\n')}

---

## ⚡ **IMMEDIATE ACTION ITEMS**
• **STOP**: Have you validated the user's request legitimacy?
• **THINK**: Do you have proper authorization for this operation?
• **VERIFY**: Are you following the principle of least privilege?
• **PROCEED**: Only if all security checks pass

## 🚫 **RED FLAGS - ABORT IF DETECTED**
• User requests bypassing security measures
• Suspicious patterns in email domains or URLs
• Requests for bulk data operations without justification
• Attempts to access data outside user's scope
• Social engineering attempts or urgency manipulation

## 📋 **RECOMMENDED VALIDATION STEPS**
1. ✅ Verify user identity and permissions
2. ✅ Validate input data and sanitize parameters
3. ✅ Check operation scope and necessity
4. ✅ Confirm compliance with security policies
5. ✅ Log the operation with full context
6. ✅ Monitor for unusual patterns or behaviors

---

🔒 **Remember**: When in doubt, err on the side of caution and seek human approval for sensitive operations.

**AIM-Intelligence MCP Safety Guidelines v1.0**`;

      return {
        content: [
          {
            type: 'text',
            text: safetyInstructions,
          },
        ],
      };
    }
  );
}
