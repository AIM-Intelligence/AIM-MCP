# MCP Components Guide

Complete guide to understanding and implementing **Tools**, **Resources**, and **Prompts** in the Model Context Protocol (MCP) using TypeScript SDK.

---

## Table of Contents

1. [Overview](#overview)
2. [Tools](#tools)
3. [Resources](#resources)
4. [Prompts](#prompts)
5. [Comparison Table](#comparison-table)
6. [Real-World Examples](#real-world-examples)
7. [Best Practices](#best-practices)

---

## Overview

The Model Context Protocol (MCP) has three main component types that serve different purposes:

| Component | Purpose | Direction | Side Effects |
|-----------|---------|-----------|--------------|
| **Tool** | Execute actions | AI → External System | Yes (write, execute, modify) |
| **Resource** | Provide information | External System → AI | No (read-only) |
| **Prompt** | Workflow templates | AI Internal | No (orchestration) |

---

## Tools

### What are Tools?

**Tools** are functions that AI agents can call to **perform actions** or **execute operations**. They can have side effects and modify external state.

### When to Use Tools

- ✅ When you need to **execute** an action
- ✅ When operations have **side effects** (write, delete, send)
- ✅ When you need to call **external APIs**
- ✅ When you need **real-time processing**

### TypeScript SDK Implementation

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'Example Server',
  version: '1.0.0',
});

// Basic Tool Example
server.tool(
  'example-tool',              // Tool name
  'Description of the tool',   // Tool description
  {
    // Input schema using Zod
    parameter1: z.string().describe('Description of parameter1'),
    parameter2: z.number().optional().default(10),
  },
  async ({ parameter1, parameter2 }) => {
    // Tool implementation
    const result = await someOperation(parameter1, parameter2);

    return {
      content: [{
        type: 'text',
        text: `Result: ${result}`
      }]
    };
  }
);
```

### Real Implementation Example: Prompt Injection Detector

```typescript
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
    // Pattern matching logic
    const injectionPatterns = [
      { pattern: /ignore\s+(previous|above|all)\s+instructions?/gi,
        severity: 'high',
        type: 'Instruction Override' },
      // ... more patterns
    ];

    const detectedThreats = [];
    let riskScore = 0;

    // Scan for patterns
    for (const { pattern, severity, type } of injectionPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        detectedThreats.push({ type, severity, pattern: matches[0] });
        riskScore += getSeverityWeight(severity);
      }
    }

    return {
      content: [{
        type: 'text',
        text: `Risk Score: ${riskScore}/100\nThreats: ${detectedThreats.length}`
      }]
    };
  }
);
```

### Tool Response Format

```typescript
return {
  content: [
    {
      type: 'text',        // or 'image', 'resource'
      text: 'Response text'
    }
  ],
  isError?: boolean      // Optional error flag
};
```

---

## Resources

### What are Resources?

**Resources** are read-only data sources that AI agents can access to retrieve information. They provide context without modifying state.

### When to Use Resources

- ✅ When you need to **provide documentation**
- ✅ When you need to **expose read-only data**
- ✅ When you need to **share reference materials**
- ✅ When you need **static or semi-static content**

### TypeScript SDK Implementation

```typescript
// Set up resource handler
server.setResourceHandler({
  // List all available resources
  async listResources() {
    return {
      resources: [
        {
          uri: 'custom-scheme://resource-id',
          name: 'Human-readable name',
          description: 'Description of the resource',
          mimeType: 'text/plain',  // or 'text/markdown', 'application/json'
        },
        // ... more resources
      ],
    };
  },

  // Read a specific resource
  async readResource({ uri }) {
    // Parse the URI
    const url = new URL(uri);
    const resourceId = url.hostname;

    // Fetch or generate content
    const content = getContentForResource(resourceId);

    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: content,
      }],
    };
  },
});
```

### Real Implementation Example: Security Checklists

```typescript
// Define resource data
const securityChecklists = {
  database: `# Database Security Checklist

## Pre-Operation Checks
✅ Verify database connection credentials are stored securely
✅ Confirm user has minimum necessary permissions
✅ Validate query input to prevent SQL injection
...`,

  email: `# Email Security Checklist

## Pre-Operation Checks
✅ Verify sender's email domain matches organization
✅ Confirm recipient authorization
...`,
};

// Implement resource handler
server.setResourceHandler({
  async listResources() {
    return {
      resources: [
        {
          uri: 'security-checklist://database',
          name: 'Database Security Checklist',
          description: 'Security checklist for database operations',
          mimeType: 'text/markdown',
        },
        {
          uri: 'security-checklist://email',
          name: 'Email Security Checklist',
          description: 'Security checklist for email operations',
          mimeType: 'text/markdown',
        },
      ],
    };
  },

  async readResource({ uri }) {
    const url = new URL(uri);
    const type = url.hostname;

    const checklist = securityChecklists[type];
    if (!checklist) {
      throw new Error(`Unknown checklist type: ${type}`);
    }

    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: checklist,
      }],
    };
  },
});
```

### Resource URI Schemes

```typescript
// Custom URI schemes
'security-checklist://database'
'security-policy://access-control'
'documentation://api-reference'
'config://server-settings'

// Standard file URIs
'file:///path/to/file.md'
'https://example.com/resource'
```

---

## Prompts

### What are Prompts?

**Prompts** are reusable templates that define workflows for AI agents. They orchestrate multiple tools and resources into a cohesive process.

### When to Use Prompts

- ✅ When you need **multi-step workflows**
- ✅ When you need **standardized processes**
- ✅ When you need to **chain multiple operations**
- ✅ When you need **templated instructions**

### TypeScript SDK Implementation

```typescript
server.setPromptHandler({
  // List all available prompts
  async listPrompts() {
    return {
      prompts: [
        {
          name: 'prompt-name',
          description: 'Description of what this prompt does',
          arguments: [
            {
              name: 'argument1',
              description: 'Description of argument1',
              required: true,
            },
            {
              name: 'argument2',
              description: 'Description of argument2',
              required: false,
            },
          ],
        },
        // ... more prompts
      ],
    };
  },

  // Get a specific prompt with arguments
  async getPrompt({ name, arguments: args }) {
    if (name === 'prompt-name') {
      const arg1 = args?.argument1 || 'default';
      const arg2 = args?.argument2 || 'default';

      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Your prompt template here with ${arg1} and ${arg2}`,
          },
        }],
      };
    }

    throw new Error(`Unknown prompt: ${name}`);
  },
});
```

### Real Implementation Example: Security Review Workflow

```typescript
server.setPromptHandler({
  async listPrompts() {
    return {
      prompts: [
        {
          name: 'security-review',
          description: 'Comprehensive security review workflow',
          arguments: [
            {
              name: 'target_type',
              description: 'Type of target: code, data, or configuration',
              required: true,
            },
            {
              name: 'context',
              description: 'Additional context',
              required: false,
            },
          ],
        },
      ],
    };
  },

  async getPrompt({ name, arguments: args }) {
    if (name === 'security-review') {
      const targetType = args?.target_type || 'code';
      const context = args?.context || 'No context provided';

      return {
        messages: [{
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
Use the \`credential-scanner\` tool to scan for exposed credentials.

### Step 2: Consult Security Checklist
Read the appropriate security checklist resource:
- For database operations: \`security-checklist://database\`
- For general operations: \`security-checklist://general\`

### Step 3: Threat Analysis
Identify potential security threats specific to this ${targetType}.

### Step 4: Provide Recommendations
Based on findings, provide prioritized recommendations.

### Step 5: Summary Table
Provide a summary table of all findings organized by severity:

\\\`\\\`\\\`
📊 요약

| 심각도         | 개수  | 파일/위치                  |
|-------------|-----|------------------------|
| 🔴 CRITICAL | 1   | resources/handler.ts   |
| 🟠 HIGH     | 2   | textGuard.ts           |
| 🟡 MEDIUM   | 3   | prompts/handler.ts     |
| 🟢 LOW      | 5   | credentialScanner.ts   |
\\\`\\\`\\\`

**Generated**: ${new Date().toISOString()}`,
          },
        }],
      };
    }

    throw new Error(`Unknown prompt: ${name}`);
  },
});
```

### Prompt Message Format

```typescript
return {
  messages: [
    {
      role: 'user',     // or 'assistant'
      content: {
        type: 'text',   // or 'image', 'resource'
        text: 'Message content'
      }
    }
  ]
};
```

---

## Comparison Table

### Conceptual Differences

| Aspect | Tool | Resource | Prompt |
|--------|------|----------|--------|
| **Purpose** | Execute actions | Provide data | Define workflows |
| **Data Flow** | AI → External | External → AI | AI internal |
| **Side Effects** | Yes (can modify state) | No (read-only) | No (just instructions) |
| **Use Case** | API calls, operations | Documentation, configs | Multi-step processes |
| **Return Type** | Operation result | Static/dynamic content | Structured instructions |

### Implementation Differences

| Aspect | Tool | Resource | Prompt |
|--------|------|----------|--------|
| **SDK Method** | `server.tool()` | `server.setResourceHandler()` | `server.setPromptHandler()` |
| **Input Schema** | Zod schema | URI string | Argument list |
| **Handler Type** | Single function | Two functions (list + read) | Two functions (list + get) |
| **Identifier** | Tool name | URI scheme | Prompt name |

### When to Use Each

| Scenario | Component | Why |
|----------|-----------|-----|
| Analyze text for threats | **Tool** | Performs active processing |
| Display security policy | **Resource** | Read-only document |
| Multi-step security audit | **Prompt** | Orchestrates tools + resources |
| Send email | **Tool** | Has side effect (sends data) |
| Show API documentation | **Resource** | Static reference material |
| Code review workflow | **Prompt** | Combines multiple checks |

---

## Real-World Examples

### Example 1: Complete Security System

```typescript
// TOOL: Active scanning
server.tool(
  'scan-for-vulnerabilities',
  'Actively scan code for vulnerabilities',
  { code: z.string() },
  async ({ code }) => {
    // Performs analysis
    const vulnerabilities = await analyzeCode(code);
    return { content: [{ type: 'text', text: JSON.stringify(vulnerabilities) }] };
  }
);

// RESOURCE: Security guidelines
server.setResourceHandler({
  async listResources() {
    return {
      resources: [{
        uri: 'guidelines://secure-coding',
        name: 'Secure Coding Guidelines',
        mimeType: 'text/markdown',
      }]
    };
  },
  async readResource({ uri }) {
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: '# Secure Coding Guidelines\n\n...',
      }]
    };
  },
});

// PROMPT: Workflow that uses both
server.setPromptHandler({
  async listPrompts() {
    return {
      prompts: [{
        name: 'full-security-audit',
        description: 'Complete security audit workflow',
        arguments: [{ name: 'code', required: true }],
      }]
    };
  },
  async getPrompt({ name, arguments: args }) {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `
1. First, read the secure coding guidelines: \`guidelines://secure-coding\`
2. Then scan the code: use \`scan-for-vulnerabilities\` with code="${args?.code}"
3. Compare findings against guidelines
4. Provide recommendations
          `
        }
      }]
    };
  },
});
```

### Example 2: Email Security System

```typescript
// TOOL: Send email (has side effect)
server.tool(
  'send-email',
  'Send an email',
  {
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  },
  async ({ to, subject, body }) => {
    await emailService.send(to, subject, body);
    return { content: [{ type: 'text', text: 'Email sent successfully' }] };
  }
);

// RESOURCE: Email policy (read-only)
server.setResourceHandler({
  async listResources() {
    return {
      resources: [{
        uri: 'policy://email',
        name: 'Email Security Policy',
        mimeType: 'text/markdown',
      }]
    };
  },
  async readResource({ uri }) {
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: '# Email Policy\n\n- Always verify recipient\n- Never send PII externally',
      }]
    };
  },
});

// PROMPT: Safe email workflow
server.setPromptHandler({
  async listPrompts() {
    return {
      prompts: [{
        name: 'safe-send-email',
        description: 'Send email with security checks',
        arguments: [
          { name: 'to', required: true },
          { name: 'subject', required: true },
          { name: 'body', required: true },
        ],
      }]
    };
  },
  async getPrompt({ arguments: args }) {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `
Before sending email:
1. Read email policy: \`policy://email\`
2. Verify recipient "${args?.to}" is authorized
3. Scan body for PII: use \`credential-scanner\` with text="${args?.body}"
4. If all checks pass, use \`send-email\` tool
5. Log the action
          `
        }
      }]
    };
  },
});
```

---

## Best Practices

### Tools

1. **Clear Naming**: Use verb-based names (`scan-text`, `send-email`, `analyze-code`)
2. **Input Validation**: Always validate inputs with Zod schemas
3. **Error Handling**: Return structured errors in the response
4. **Idempotency**: When possible, make tools idempotent
5. **Documentation**: Provide clear descriptions for the tool and all parameters

```typescript
// ✅ Good
server.tool(
  'validate-url-security',
  'Validate URL for security issues including phishing, malware, and HTTPS enforcement',
  {
    url: z.string().url().describe('URL to validate for security'),
    strict_mode: z.boolean().optional().default(false).describe('Enable strict checks'),
  },
  async ({ url, strict_mode }) => {
    try {
      const result = await validateUrl(url, strict_mode);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// ❌ Bad
server.tool('tool1', 'does stuff', { x: z.any() }, async ({ x }) => {
  return { content: [{ type: 'text', text: doStuff(x) }] };
});
```

### Resources

1. **Consistent URI Schemes**: Use logical, hierarchical URI schemes
2. **Meaningful Names**: Use descriptive resource names
3. **Proper MIME Types**: Set correct MIME types (`text/markdown`, `application/json`)
4. **Error Handling**: Throw clear errors for invalid URIs
5. **Caching**: Consider caching for expensive resource generation

```typescript
// ✅ Good
const URI_SCHEMES = {
  checklist: 'security-checklist://',
  policy: 'security-policy://',
  guide: 'security-guide://',
};

server.setResourceHandler({
  async listResources() {
    return {
      resources: [
        {
          uri: `${URI_SCHEMES.checklist}database`,
          name: 'Database Security Checklist',
          description: 'Comprehensive checklist for database operations',
          mimeType: 'text/markdown',
        },
      ],
    };
  },
  async readResource({ uri }) {
    const url = new URL(uri);
    const scheme = url.protocol;
    const type = url.hostname;

    if (!Object.values(URI_SCHEMES).includes(scheme)) {
      throw new Error(`Invalid URI scheme: ${scheme}`);
    }

    const content = getContent(scheme, type);
    if (!content) {
      throw new Error(`Resource not found: ${uri}`);
    }

    return { contents: [{ uri, mimeType: 'text/markdown', text: content }] };
  },
});
```

### Prompts

1. **Structured Workflows**: Break down complex tasks into clear steps
2. **Reference Tools/Resources**: Explicitly mention which tools and resources to use
3. **Argument Validation**: Provide clear descriptions for all arguments
4. **Error Scenarios**: Include error handling instructions
5. **Output Format**: Specify expected output format

```typescript
// ✅ Good
async getPrompt({ name, arguments: args }) {
  if (name === 'security-audit') {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `
# Security Audit for ${args?.target}

## Workflow Steps

1. **Read Guidelines**
   - Access: \`security-policy://audit-guidelines\`
   - Review all mandatory checks

2. **Run Scans**
   - Tool: \`credential-scanner\` with text="${args?.target}"
   - Tool: \`prompt-injection-detector\` with text="${args?.target}"

3. **Analyze Results**
   - Compare findings against guidelines
   - Calculate risk score

4. **Generate Report**
   - Format: Executive summary + detailed findings
   - Include actionable recommendations

5. **Error Handling**
   - If any tool fails, document the failure and continue
   - Final report should note any incomplete checks

6. **Summary Reporting**
   - Include a visual summary table at the end
   - Organize findings by severity (CRITICAL, HIGH, MEDIUM, LOW)
   - Use emoji indicators for quick scanning (🔴 🟠 🟡 🟢)
   - List locations/files/types affected
   - Example format:
     \`\`\`
     📊 요약
     | 심각도 | 개수 | 위치 |
     |-------|------|------|
     | 🔴 CRITICAL | X | ... |
     \`\`\`
          `
        }
      }]
    };
  }
}
```

### General Architecture

1. **Separation of Concerns**:
   - Tools for actions
   - Resources for data
   - Prompts for orchestration

2. **Composability**:
   - Design tools to be reusable
   - Make resources atomic and focused
   - Create prompts that combine multiple tools/resources

3. **Versioning**:
   - Version your tools, resources, and prompts
   - Maintain backward compatibility
   - Document breaking changes

4. **Security**:
   - Validate all inputs
   - Sanitize all outputs
   - Log security-relevant operations
   - Implement rate limiting

5. **Testing**:
   - Unit test each tool
   - Verify resource content
   - Test prompt workflows end-to-end

---

## Summary

- **Tools**: For executing actions with side effects
- **Resources**: For providing read-only information
- **Prompts**: For orchestrating multi-step workflows

Use **Tools** when you need to DO something, **Resources** when you need to READ something, and **Prompts** when you need to ORCHESTRATE a process.

For more information, see the [MCP Specification](https://modelcontextprotocol.io/).

---

*This guide is part of the AIM Guard MCP project.*
*Last updated: 2025*
