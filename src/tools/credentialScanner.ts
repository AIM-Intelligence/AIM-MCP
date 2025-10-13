import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerCredentialScanner(server: McpServer) {
  server.tool(
    'credential-scanner',
    'Scan text for exposed credentials (API keys, passwords, tokens, SSH keys)',
    {
      text: z.string().describe('Text to scan for credentials'),
      mask_findings: z
        .boolean()
        .optional()
        .default(true)
        .describe('Mask detected credentials in output'),
    },
    async ({ text, mask_findings = true }) => {
      // Comprehensive credential patterns
      const credentialPatterns = [
        // Generic secrets
        { name: 'Generic API Key', pattern: /(?:api[_-]?key|apikey)["\s:=]+([a-zA-Z0-9_\-]{16,64})/gi, severity: 'high' },
        { name: 'Generic Secret', pattern: /(?:secret|password|passwd|pwd)["\s:=]+([^\s"']{8,})/gi, severity: 'high' },
        { name: 'Generic Token', pattern: /(?:token|auth)["\s:=]+([a-zA-Z0-9_\-\.]{20,})/gi, severity: 'high' },

        // AWS
        { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g, severity: 'critical' },
        { name: 'AWS Secret Key', pattern: /(?:aws_secret_access_key|aws_secret)["\s:=]+([a-zA-Z0-9/+=]{40})/gi, severity: 'critical' },

        // GitHub
        { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/g, severity: 'critical' },
        { name: 'GitHub Classic Token', pattern: /ghp_[a-zA-Z0-9]{36}/g, severity: 'critical' },

        // Google
        { name: 'Google API Key', pattern: /AIza[0-9A-Za-z_\-]{35}/g, severity: 'critical' },
        { name: 'Google OAuth', pattern: /[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com/g, severity: 'high' },

        // Slack
        { name: 'Slack Token', pattern: /xox[baprs]-[0-9a-zA-Z\-]{10,72}/g, severity: 'high' },
        { name: 'Slack Webhook', pattern: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]+\/B[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+/g, severity: 'high' },

        // OpenAI
        { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{48}/g, severity: 'critical' },

        // Stripe
        { name: 'Stripe API Key', pattern: /(?:sk|pk)_(?:live|test)_[0-9a-zA-Z]{24,}/g, severity: 'critical' },

        // JWT
        { name: 'JWT Token', pattern: /eyJ[a-zA-Z0-9_\-]*\.eyJ[a-zA-Z0-9_\-]*\.[a-zA-Z0-9_\-]*/g, severity: 'medium' },

        // SSH
        { name: 'SSH Private Key', pattern: /-----BEGIN (?:RSA|OPENSSH|DSA|EC) PRIVATE KEY-----/g, severity: 'critical' },

        // Database
        { name: 'Connection String', pattern: /(?:mongodb|mysql|postgresql|postgres):\/\/[^\s"']+/gi, severity: 'high' },

        // Email/Password combos
        { name: 'Basic Auth', pattern: /(?:https?:\/\/)[a-zA-Z0-9]+:[a-zA-Z0-9]+@[^\s"']+/g, severity: 'high' },

        // Private Keys
        { name: 'Private Key', pattern: /-----BEGIN PRIVATE KEY-----[^-]+-----END PRIVATE KEY-----/gs, severity: 'critical' },
      ];

      const findings: Array<{
        type: string;
        severity: string;
        value: string;
        position: number;
        masked: string;
      }> = [];

      let totalRiskScore = 0;
      const severityWeights = { low: 1, medium: 3, high: 7, critical: 10 };

      // Scan for credentials
      for (const { name, pattern, severity } of credentialPatterns) {
        const matches = [...text.matchAll(pattern)];
        for (const match of matches) {
          const value = match[1] || match[0];
          const position = match.index || 0;

          // Mask the credential
          const masked = mask_findings
            ? value.substring(0, 4) + '*'.repeat(Math.max(0, value.length - 8)) + value.substring(Math.max(4, value.length - 4))
            : value;

          findings.push({
            type: name,
            severity,
            value: mask_findings ? masked : value,
            position,
            masked,
          });

          totalRiskScore += severityWeights[severity as keyof typeof severityWeights];
        }
      }

      const riskLevel = totalRiskScore === 0 ? 'SAFE' :
                       totalRiskScore < 5 ? 'LOW' :
                       totalRiskScore < 15 ? 'MEDIUM' :
                       totalRiskScore < 30 ? 'HIGH' : 'CRITICAL';

      return {
        content: [
          {
            type: 'text',
            text: `🔐 **Credential Scanner Report**

**Risk Level**: ${riskLevel}
**Total Findings**: ${findings.length}
**Risk Score**: ${totalRiskScore}
**Text Length**: ${text.length} characters

${findings.length > 0 ? `
🚨 **DETECTED CREDENTIALS**:
${findings.map((finding, idx) => `
${idx + 1}. **${finding.type}** (${finding.severity.toUpperCase()})
   - Value: ${finding.value}
   - Position: Character ${finding.position}`).join('\n')}

⚠️ **URGENT SECURITY ACTIONS REQUIRED**:
1. 🔴 IMMEDIATE: Rotate/revoke all detected credentials
2. 🔍 INVESTIGATE: Check if credentials were exposed publicly
3. 📋 AUDIT: Review access logs for unauthorized usage
4. 🔒 PREVENT: Implement secret scanning in CI/CD pipeline
5. 📝 DOCUMENT: Log this incident for security review

🛡️ **Prevention Best Practices**:
- Use environment variables for secrets
- Implement secret management solutions (AWS Secrets Manager, HashiCorp Vault)
- Enable secret scanning in git repositories
- Use .gitignore to exclude sensitive files
- Implement pre-commit hooks for credential detection
` : `
✅ **No credentials detected**

The scanned text appears safe from exposed credentials.

💡 **Best Practices**:
- Continue using environment variables for secrets
- Regularly rotate credentials and API keys
- Enable secret scanning in your development pipeline
`}

**Scan Details**:
- Patterns checked: ${credentialPatterns.length}
- Masking enabled: ${mask_findings ? 'Yes' : 'No'}
- Timestamp: ${new Date().toISOString()}

**Powered by**: AIM-Intelligence Credential Scanner`,
          },
        ],
      };
    }
  );
}
