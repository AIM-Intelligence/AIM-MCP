# AIM Guard MCP

🛡️ **AIM MCP Server :: Guard and Protect your MCPs & AI Chatting**

A Model Context Protocol (MCP) server that provides security tools for content analysis, threat detection, and content filtering.

## Features

- 🔍 **Security Guard Check**: Analyze content for potential security threats
- 🚨 **Threat Analysis**: Detect malware, phishing, spam, and social engineering attempts
- 🔒 **Content Filter**: Sanitize content based on configurable security policies
- ⚡ **Fast & Lightweight**: Built with TypeScript and Zod validation
- 🔧 **Easy Integration**: Works with any MCP-compatible AI assistant

## Installation

### NPX (Recommended)

```bash
npx aim-guard-mcp
```

### Global Installation

```bash
npm install -g aim-guard-mcp
aim-guard-mcp
```

### Local Installation

```bash
npm install aim-guard-mcp
```

## Usage

### As MCP Server

Add to your MCP client configuration:

```json
{
  "servers": {
    "aim-guard": {
      "command": "npx",
      "args": ["aim-guard-mcp"]
    }
  }
}
```

### Available Tools

#### 1. `guard_check`

Perform security analysis on content to detect potential threats.

```json
{
  "name": "guard_check",
  "arguments": {
    "content": "Your content to analyze",
    "level": "basic" // or "advanced"
  }
}
```

#### 2. `threat_analysis`

Analyze text for various types of security threats.

```json
{
  "name": "threat_analysis",
  "arguments": {
    "text": "Text to analyze",
    "categories": ["malware", "phishing", "spam"]
  }
}
```

#### 3. `content_filter`

Filter and sanitize content based on security policies.

```json
{
  "name": "content_filter",
  "arguments": {
    "content": "Content to filter",
    "policy": "moderate" // "strict", "moderate", or "lenient"
  }
}
```

## Development

```bash
# Clone the repository
git clone https://github.com/AIM-Intelligence/AIM-MCP.git
cd AIM-MCP

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run in development mode
pnpm run dev

# Run tests
pnpm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@aim-intelligence.com
- 🐛 Issues: [GitHub Issues](https://github.com/AIM-Intelligence/AIM-MCP/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/AIM-Intelligence/AIM-MCP/wiki)

---

Made with ❤️ by [AIM Intelligence](https://github.com/AIM-Intelligence)
