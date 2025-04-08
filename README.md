# AI-MCP-Logger MCP Client

Model Context Protocol client for AI-MCP-Logger integration with Claude, enabling AI assistants to directly access logs.

## Installation

```bash
npm install -g @ai-mcp-logger/mcp-client
```

## Usage with Claude Desktop

1. Edit the Claude Desktop configuration file:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-logger": {
      "command": "ai-mcp-logger-client"
    }
  }
}
```

2. Restart Claude Desktop to load the AI-MCP-Logger MCP client
3. Claude will now have direct access to logs through the MCP tools

## Available MCP Tools

- `get_logs_ai-logger` - Retrieve all logs (with optional limit)
- `get_log_by_name_ai-logger` - Retrieve logs with a specific name
- `append_to_log_ai-logger` - Add a new entry to a log
- `clear_log_ai-logger` - Clear all entries from a log

## Configuration

The MCP client can be configured using environment variables:

- `WEB_SERVER_URL` - URL of the AILogger server (default: http://localhost:3030)
- `LOG_DIR` - Directory to store log files (default: C:\AILogger-Logs on Windows, /var/log/ailogger on Unix)

## AI-MCP-Logger Ecosystem

This package is part of the [AI-MCP-Logger](https://github.com/AI-MCP-Logger) ecosystem:

- [Server](https://github.com/AI-MCP-Logger/server) - Central logging server
- [MCP Client](https://github.com/AI-MCP-Logger/mcp-client) - Claude integration via MCP (this package)
- [TypeScript Client](https://github.com/AI-MCP-Logger/typescript) - TypeScript client
- [Python Client](https://github.com/AI-MCP-Logger/python) - Python client
- [C# Client](https://github.com/AI-MCP-Logger/csharp) - C# client
- [Java Client](https://github.com/AI-MCP-Logger/java) - Java client

## License

MIT
