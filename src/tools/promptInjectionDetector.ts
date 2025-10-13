import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPromptInjectionDetector(server: McpServer) {
  server.tool(
    'prompt-injection-detector',
    'Detect prompt injection attempts based on OWASP LLM01:2025 patterns',
    {
      text: z.string().describe('Text to analyze for prompt injection patterns'),
      sensitivity: z
        .enum(['low', 'medium', 'high'])
        .optional()
        .default('medium')
        .describe('Detection sensitivity level'),
    },
    async ({ text, sensitivity = 'medium' }) => {
      // Prompt injection patterns based on OWASP LLM01:2025
      const injectionPatterns = [
        // Direct instruction override
        { pattern: /ignore\s+(previous|above|all)\s+instructions?/gi, severity: 'high', type: 'Instruction Override' },
        { pattern: /forget\s+(everything|all|previous)/gi, severity: 'high', type: 'Memory Manipulation' },
        { pattern: /disregard\s+(the|all|any)\s+(above|previous|prior)/gi, severity: 'high', type: 'Instruction Override' },

        // Role manipulation
        { pattern: /you\s+are\s+now\s+(a|an)\s+\w+/gi, severity: 'high', type: 'Role Manipulation' },
        { pattern: /act\s+as\s+(a|an)\s+\w+/gi, severity: 'medium', type: 'Role Manipulation' },
        { pattern: /pretend\s+(you\s+are|to\s+be)/gi, severity: 'medium', type: 'Role Manipulation' },

        // System prompt extraction
        { pattern: /show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions)/gi, severity: 'critical', type: 'Prompt Extraction' },
        { pattern: /what\s+(is|are)\s+your\s+(initial|original|system)\s+instructions?/gi, severity: 'critical', type: 'Prompt Extraction' },
        { pattern: /repeat\s+(your|the)\s+(instructions|prompt)/gi, severity: 'critical', type: 'Prompt Extraction' },

        // Delimiter injection
        { pattern: /\[SYSTEM\]|\[\/SYSTEM\]/gi, severity: 'high', type: 'Delimiter Injection' },
        { pattern: /\[INST\]|\[\/INST\]/gi, severity: 'high', type: 'Delimiter Injection' },
        { pattern: /<\|im_start\|>|<\|im_end\|>/gi, severity: 'high', type: 'Delimiter Injection' },

        // Context manipulation
        { pattern: /new\s+conversation|start\s+over/gi, severity: 'medium', type: 'Context Reset' },
        { pattern: /end\s+of\s+(conversation|context)/gi, severity: 'medium', type: 'Context Manipulation' },

        // Jailbreak attempts
        { pattern: /DAN\s+mode|developer\s+mode/gi, severity: 'critical', type: 'Jailbreak Attempt' },
        { pattern: /bypass\s+(safety|security|filter)/gi, severity: 'critical', type: 'Jailbreak Attempt' },
        { pattern: /without\s+any\s+(restrictions|limitations|filters)/gi, severity: 'high', type: 'Jailbreak Attempt' },
      ];

      const detectedThreats: Array<{
        type: string;
        severity: string;
        pattern: string;
        position: number;
      }> = [];

      let riskScore = 0;
      const severityWeights = { low: 10, medium: 25, high: 50, critical: 100 };
      const sensitivityThresholds = { low: 50, medium: 30, high: 10 };

      // Scan for patterns
      for (const { pattern, severity, type } of injectionPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) {
            const position = text.indexOf(match);
            detectedThreats.push({
              type,
              severity,
              pattern: match,
              position,
            });
            riskScore += severityWeights[severity as keyof typeof severityWeights];
          }
        }
      }

      // Normalize risk score (0-100)
      riskScore = Math.min(100, riskScore);

      // Determine if text should be blocked based on sensitivity
      const shouldBlock = riskScore >= sensitivityThresholds[sensitivity];

      const assessment = riskScore === 0 ? 'SAFE' :
                        riskScore < 30 ? 'LOW RISK' :
                        riskScore < 60 ? 'MEDIUM RISK' :
                        riskScore < 90 ? 'HIGH RISK' : 'CRITICAL';

      return {
        content: [
          {
            type: 'text',
            text: `🔍 **Prompt Injection Detection Report**

**Overall Assessment**: ${assessment}
**Risk Score**: ${riskScore}/100
**Sensitivity Level**: ${sensitivity.toUpperCase()}
**Recommendation**: ${shouldBlock ? '🚫 BLOCK - Potential injection detected' : '✅ ALLOW - No significant threats'}

**Detected Threats**: ${detectedThreats.length}
${detectedThreats.length > 0 ?
  detectedThreats.map((threat, idx) => `
${idx + 1}. **${threat.type}** (${threat.severity.toUpperCase()})
   - Pattern: "${threat.pattern}"
   - Position: Character ${threat.position}`).join('\n') :
  '\nNo injection patterns detected.'}

**Analysis Details**:
- Total characters analyzed: ${text.length}
- Detection patterns checked: ${injectionPatterns.length}
- Timestamp: ${new Date().toISOString()}

${riskScore > 0 ? `
⚠️ **Security Recommendations**:
1. Review the detected patterns carefully
2. Consider rejecting or sanitizing the input
3. Log this attempt for security monitoring
4. If legitimate, consider adding to allowlist
` : ''}
**Powered by**: AIM-Intelligence Guard (OWASP LLM01:2025 compliant)`,
          },
        ],
      };
    }
  );
}
