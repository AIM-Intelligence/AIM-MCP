import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

export function registerPromptHandlers(server: McpServer) {
  // Handle prompts/list requests
  server.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'security-review',
            description: 'Comprehensive security review workflow for code, data, or configuration',
            arguments: [
              {
                name: 'target_type',
                description: 'Type of target to review: code, data, or configuration',
                required: true,
              },
              {
                name: 'context',
                description: 'Additional context about what needs to be reviewed',
                required: false,
              },
            ],
          },
          {
            name: 'threat-analysis',
            description: 'Analyze potential security threats and risks for a given scenario',
            arguments: [
              {
                name: 'scenario',
                description: 'The security scenario or operation to analyze',
                required: true,
              },
              {
                name: 'sensitivity_level',
                description: 'Data sensitivity level: public, internal, confidential, or restricted',
                required: false,
              },
            ],
          },
        ],
      };
  });

  // Handle prompts/get requests
  server.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const name = request.params?.name;
    const args = request.params?.arguments;

    if (!name) {
      throw new Error('Prompt name is required');
    }

    if (name === 'security-review') {
        const targetType = args?.target_type || 'code';
        const context = args?.context || 'No additional context provided';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `# Security Review Request

## Target Information
- **Type**: ${targetType}
- **Context**: ${context}

## Review Workflow

Please perform a comprehensive security review following these steps:

### Step 1: Credential Scanning
Use the \`credential-scanner\` tool to scan the ${targetType} for any exposed credentials, API keys, tokens, or secrets.

### Step 2: Prompt Injection Detection (if applicable)
If reviewing user-facing inputs or prompts, use the \`prompt-injection-detector\` tool to check for injection attempts.

### Step 3: Consult Security Checklist
Read the appropriate security checklist resource based on the operation type:
- For database operations: \`security-checklist://database\`
- For file operations: \`security-checklist://file\`
- For web requests: \`security-checklist://web\`
- For general operations: \`security-checklist://general\`

### Step 4: Review Against Security Policies
Check the ${targetType} against relevant security policies:
- Data handling: \`security-policy://data-classification\`
- Access controls: \`security-policy://access-control\`

### Step 5: Threat Analysis
Identify potential security threats specific to this ${targetType}:
- What could go wrong?
- What are the attack vectors?
- What is the blast radius if compromised?

### Step 6: Provide Recommendations
Based on the findings, provide:
1. **Critical Issues**: Must be fixed immediately
2. **High Priority**: Should be fixed before deployment
3. **Medium Priority**: Should be addressed in next iteration
4. **Best Practices**: Suggestions for improvement

### Step 7: Risk Assessment
Provide an overall risk score (0-100) and recommendation:
- 0-25: Low risk - Proceed with caution
- 26-50: Medium risk - Address issues before proceeding
- 51-75: High risk - Significant remediation required
- 76-100: Critical risk - Do not proceed until fixed

## Expected Output Format

Please structure your response as:
1. Executive Summary
2. Findings by Category
3. Detailed Analysis
4. Recommendations
5. Risk Score and Final Verdict

**Generated**: ${new Date().toISOString()}
**Review Type**: Security Review - ${targetType}`,
              },
            },
          ],
        };
      }

      if (name === 'threat-analysis') {
        const scenario = args?.scenario || 'No scenario provided';
        const sensitivityLevel = args?.sensitivity_level || 'internal';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `# Threat Analysis Request

## Scenario
${scenario}

## Data Sensitivity Level
${sensitivityLevel.toUpperCase()}

## Analysis Framework

Please analyze this scenario for security threats using the following framework:

### 1. Asset Identification
- What assets are involved? (data, systems, credentials)
- What is their value and criticality?
- Who has access to these assets?

### 2. Threat Modeling
Identify potential threats using STRIDE methodology:
- **S**poofing: Can identities be faked?
- **T**ampering: Can data be modified?
- **R**epudiation: Can actions be denied?
- **I**nformation Disclosure: Can data be exposed?
- **D**enial of Service: Can services be disrupted?
- **E**levation of Privilege: Can permissions be escalated?

### 3. Risk Assessment
For each identified threat, evaluate:
- **Likelihood**: How likely is this threat? (Low/Medium/High)
- **Impact**: What's the damage if it occurs? (Low/Medium/High/Critical)
- **Risk Level**: Likelihood × Impact

### 4. Attack Vectors
Identify possible attack vectors:
- External attackers
- Insider threats
- Supply chain attacks
- Social engineering
- Technical vulnerabilities

### 5. Existing Controls
Review current security controls:
- Read \`security-policy://access-control\` for access control policies
- Read \`security-policy://data-classification\` for data handling requirements
- Check relevant security checklists

### 6. Control Gaps
Identify missing or inadequate security controls:
- What protections are missing?
- Where are the weakest points?
- What should be prioritized?

### 7. Mitigation Strategies
Provide specific recommendations:
- **Preventive Controls**: Stop threats before they occur
- **Detective Controls**: Identify threats in progress
- **Corrective Controls**: Respond to and recover from threats
- **Compensating Controls**: Alternative protections

### 8. Compliance Considerations
Based on sensitivity level "${sensitivityLevel}", ensure compliance with:
${sensitivityLevel === 'restricted' || sensitivityLevel === 'confidential' ?
  '- Encryption requirements\n- Access logging and monitoring\n- Multi-factor authentication\n- Regular access reviews' :
  '- Standard security practices\n- Basic access controls'}

### 9. Incident Response
If this threat materializes:
- What is the severity level? (Reference: \`security-policy://incident-response\`)
- What is the response timeline?
- Who should be notified?
- What are the containment steps?

### 10. Risk Score and Recommendation
Provide:
- Overall risk score (0-100)
- Risk level (Low/Medium/High/Critical)
- Go/No-Go recommendation
- Required security improvements

**Generated**: ${new Date().toISOString()}
**Analysis Type**: Threat Analysis
**Sensitivity Level**: ${sensitivityLevel.toUpperCase()}`,
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${name}`);
  });
}
