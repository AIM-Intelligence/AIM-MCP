import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerUrlSecurityValidator(server: McpServer) {
  server.tool(
    'url-security-validator',
    'Validate URL safety (phishing, malware, HTTPS enforcement)',
    {
      url: z.string().describe('URL to validate for security'),
      strict_mode: z
        .boolean()
        .optional()
        .default(false)
        .describe('Enable strict security checks'),
    },
    async ({ url, strict_mode = false }) => {
      const issues: Array<{ severity: string; issue: string; recommendation: string }> = [];
      let riskScore = 0;

      try {
        // Parse URL
        const parsedUrl = new URL(url);

        // Check 1: Protocol Security
        if (parsedUrl.protocol !== 'https:') {
          issues.push({
            severity: strict_mode ? 'critical' : 'high',
            issue: `Insecure protocol: ${parsedUrl.protocol}`,
            recommendation: 'Use HTTPS instead of HTTP for secure communication',
          });
          riskScore += strict_mode ? 40 : 25;
        }

        // Check 2: Suspicious TLDs (common in phishing)
        const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click', '.link', '.pw'];
        const tld = parsedUrl.hostname.substring(parsedUrl.hostname.lastIndexOf('.'));
        if (suspiciousTlds.includes(tld.toLowerCase())) {
          issues.push({
            severity: 'medium',
            issue: `Suspicious TLD: ${tld}`,
            recommendation: 'This TLD is commonly associated with spam/phishing. Verify source carefully.',
          });
          riskScore += 15;
        }

        // Check 3: IP Address URLs (often malicious)
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipPattern.test(parsedUrl.hostname)) {
          issues.push({
            severity: 'high',
            issue: 'URL uses raw IP address instead of domain name',
            recommendation: 'IP-based URLs are often used in phishing. Verify legitimacy.',
          });
          riskScore += 30;
        }

        // Check 4: Suspicious subdomains (homograph attacks)
        const suspiciousPatterns = [
          /paypal/i, /amazon/i, /google/i, /microsoft/i, /apple/i,
          /bank/i, /secure/i, /login/i, /verify/i, /account/i,
          /update/i, /confirm/i, /support/i
        ];
        const hostname = parsedUrl.hostname.toLowerCase();
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(hostname) && !hostname.includes('.com') && !hostname.includes('.net')) {
            issues.push({
              severity: 'high',
              issue: `Potential phishing domain: ${parsedUrl.hostname}`,
              recommendation: 'Domain contains brand keywords but unusual TLD. Verify authenticity.',
            });
            riskScore += 35;
            break;
          }
        }

        // Check 5: Long URLs (often obfuscated)
        if (url.length > 200) {
          issues.push({
            severity: 'medium',
            issue: `Unusually long URL (${url.length} characters)`,
            recommendation: 'Long URLs may be used to hide malicious domains. Inspect carefully.',
          });
          riskScore += 10;
        }

        // Check 6: Multiple redirects (suspicious pattern)
        const redirectPatterns = url.match(/http/gi);
        if (redirectPatterns && redirectPatterns.length > 1) {
          issues.push({
            severity: 'medium',
            issue: 'URL appears to contain embedded redirect',
            recommendation: 'Multiple URLs detected. May indicate redirect chain used in phishing.',
          });
          riskScore += 15;
        }

        // Check 7: Special characters (punycode, homograph attacks)
        if (/[^\x00-\x7F]/.test(parsedUrl.hostname)) {
          issues.push({
            severity: 'high',
            issue: 'URL contains non-ASCII characters (potential homograph attack)',
            recommendation: 'International characters can be used to create lookalike domains.',
          });
          riskScore += 25;
        }

        // Check 8: Suspicious query parameters
        const sensitiveParams = ['password', 'pwd', 'token', 'api_key', 'apikey', 'secret', 'auth'];
        const queryParams = parsedUrl.searchParams;
        for (const param of sensitiveParams) {
          if (queryParams.has(param)) {
            issues.push({
              severity: 'critical',
              issue: `Sensitive parameter in URL: ${param}`,
              recommendation: 'Never send credentials via URL parameters. Use POST body or headers.',
            });
            riskScore += 40;
          }
        }

        // Check 9: Port numbers (unusual ports can be suspicious)
        if (parsedUrl.port && parsedUrl.port !== '80' && parsedUrl.port !== '443') {
          issues.push({
            severity: 'medium',
            issue: `Non-standard port: ${parsedUrl.port}`,
            recommendation: 'Unusual port numbers may indicate malicious service.',
          });
          riskScore += 10;
        }

        // Check 10: URL shorteners (hide real destination)
        const shortenerDomains = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'buff.ly', 'is.gd'];
        if (shortenerDomains.some(domain => parsedUrl.hostname.includes(domain))) {
          issues.push({
            severity: 'medium',
            issue: 'URL shortener detected',
            recommendation: 'Shortened URLs hide the real destination. Expand before clicking.',
          });
          riskScore += 12;
        }

      } catch (error) {
        issues.push({
          severity: 'critical',
          issue: 'Invalid URL format',
          recommendation: 'URL cannot be parsed. May be malformed or malicious.',
        });
        riskScore = 100;
      }

      // Normalize risk score
      riskScore = Math.min(100, riskScore);

      const assessment = riskScore === 0 ? 'SAFE' :
                        riskScore < 20 ? 'LOW RISK' :
                        riskScore < 50 ? 'MEDIUM RISK' :
                        riskScore < 80 ? 'HIGH RISK' : 'CRITICAL';

      const shouldBlock = strict_mode ? riskScore > 20 : riskScore > 50;

      return {
        content: [
          {
            type: 'text',
            text: `🌐 **URL Security Validation Report**

**URL**: ${url}

**Overall Assessment**: ${assessment}
**Risk Score**: ${riskScore}/100
**Mode**: ${strict_mode ? 'STRICT' : 'STANDARD'}
**Recommendation**: ${shouldBlock ? '🚫 BLOCK - Do not access this URL' : issues.length === 0 ? '✅ SAFE - URL passed all security checks' : '⚠️ CAUTION - Review issues before accessing'}

${issues.length > 0 ? `
**Security Issues Detected**: ${issues.length}
${issues.map((issue, idx) => `
${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.issue}
   💡 ${issue.recommendation}`).join('\n')}
` : '✅ No security issues detected.'}

${riskScore > 0 ? `
🛡️ **Security Recommendations**:
1. Verify the URL sender's identity
2. Check for typos in domain names
3. Hover over links before clicking
4. Use browser security extensions
5. Enable anti-phishing protection
6. ${strict_mode ? 'STRICT MODE: Block this URL' : 'Exercise caution before proceeding'}
` : ''}

**Validation Details**:
- Protocol: ${url.startsWith('https') ? '🔒 HTTPS (Secure)' : '⚠️ HTTP (Insecure)'}
- Checks performed: 10
- Strict mode: ${strict_mode ? 'Enabled' : 'Disabled'}
- Timestamp: ${new Date().toISOString()}

**Powered by**: AIM-Intelligence URL Validator`,
          },
        ],
      };
    }
  );
}
