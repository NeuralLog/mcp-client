# NeuralLog MCP Client

Model Context Protocol (MCP) client for NeuralLog integration with AI assistants like Claude, enabling them to directly access and manage logs through the NeuralLog system.

## Overview

The NeuralLog MCP Client is a key component of the NeuralLog ecosystem, providing a bridge between AI assistants and the NeuralLog logging system. It implements the Model Context Protocol (MCP) to allow AI models to interact with logs through standardized tools.

## Installation

```bash
npm install -g @neurallog/mcp-client
```

## Usage with Claude Desktop

1. Edit the Claude Desktop configuration file:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "neurallog": {
      "command": "neurallog-mcp-client"
    }
  }
}
```

2. Restart Claude Desktop to load the NeuralLog MCP client
3. Claude will now have direct access to logs through the NeuralLog MCP tools

## Running with Docker

The MCP client is designed to be run with Docker in interactive mode, which allows STDIO to be piped through to Claude or other AI assistants.

### Building the Docker Image

```bash
# Using npm script
npm run docker:build

# Or directly with Docker
docker build -t neurallog-mcp-client .
```

### Running with Docker

```bash
# Run with a local server
npm run docker:run

# Run with a remote server (customize the URL in package.json)
npm run docker:run:remote
```

You can also run the Docker container directly with custom settings:

```bash
# Run with a local server
docker run -i --network host -e WEB_SERVER_URL=http://localhost:3030 neurallog-mcp-client

# Run with a remote server
docker run -i -e WEB_SERVER_URL=http://your-server-address:3030 neurallog-mcp-client
```

### Important Docker Flags

- The `-i` flag is crucial as it keeps STDIN open, allowing JSON-RPC requests to be piped to the MCP client
- The `--network host` flag allows the container to access services running on the host machine (like the server)

### Docker Networking with Server

When running both the server and MCP client with Docker, you have two options for networking:

1. **Host Network** (Simplest):
   ```bash
   # Run the server
   cd ../server
   docker-compose up -d

   # Run the MCP client with host networking
   docker run -i --network host -e WEB_SERVER_URL=http://localhost:3030 neurallog-mcp-client
   ```

2. **Docker Network** (More isolated):
   ```bash
   # Create a Docker network
   docker network create neurallog-network

   # Run the server connected to the network
   cd ../server
   docker-compose up -d

   # Run the MCP client connected to the network
   docker run -i --network neurallog-network -e WEB_SERVER_URL=http://neurallog-server:3030 neurallog-mcp-client
   ```

### Testing with Docker

To test the MCP client with Docker, pipe JSON-RPC requests to the container:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_logs","arguments":{}}}' | docker run -i --network host -e WEB_SERVER_URL=http://localhost:3030 neurallog-mcp-client
```

## Available MCP Tools

- `get_logs` - Retrieve all log names (with optional limit)
- `get_log_by_name` - Retrieve entries for a specific log
- `append_to_log` - Append data to a log
- `clear_log` - Clear all entries from a log
- `search` - Search logs with various criteria (server-side search)

### Tool Usage Examples

#### get_logs
```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_logs","arguments":{}}}
```

#### get_log_by_name
```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_log_by_name","arguments":{"log_name":"test-log"}}}
```

#### append_to_log
```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"append_to_log","arguments":{"log_name":"test-log","data":{"message":"Test message","level":"info"}}}}
```

#### clear_log
```json
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"clear_log","arguments":{"log_name":"test-log"}}}
```

#### search
```json
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"search","arguments":{"query":"Test"}}}
```

Search with field filters:
```json
{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"search","arguments":{"field_filters":{"data.level":"info"}}}}
```

## Data Handling Notes

When sending data to the MCP client, be aware of the following:

1. **JSON Objects**: Send JSON objects directly:
   ```json
   {"data":{"message":"Test message","level":"info"}}
   ```

2. **Primitive Values**: Wrap primitive values in a JSON object with a `data` field:
   ```json
   {"data":{"data":"This is a test string"}}
   ```

   Instead of:
   ```json
   {"data":"This is a test string"}
   ```

This ensures that all data is stored as JSON objects in a consistent format.

## End-to-End Testing

To test the entire system end-to-end:

1. Start the server using Docker Compose:
   ```bash
   cd ../server
   docker-compose up -d
   ```

2. Build the MCP client Docker image:
   ```bash
   npm run docker:build
   ```

3. Test the MCP client with Docker:
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_logs","arguments":{}}}' | docker run -i --network host -e WEB_SERVER_URL=http://localhost:3030 ai-mcp-logger-mcp-client
   ```

4. Test appending and retrieving data:
   ```bash
   # Append to a log
   echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"append_to_log","arguments":{"log_name":"test-log","data":{"message":"Test message","level":"info"}}}}' | docker run -i --network host -e WEB_SERVER_URL=http://localhost:3030 neurallog-mcp-client

   # Retrieve the log
   echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_log_by_name","arguments":{"log_name":"test-log"}}}' | docker run -i --network host -e WEB_SERVER_URL=http://localhost:3030 neurallog-mcp-client
   ```

## Configuration

The MCP client can be configured using environment variables:

- `WEB_SERVER_URL` - URL of the NeuralLog server (default: http://localhost:3030)
- `LOG_DIR` - Directory to store log files (default: C:\NeuralLog\Logs on Windows, /var/log/neurallog on Unix)

## NeuralLog Ecosystem

This package is part of the NeuralLog ecosystem:

- [Specifications](https://github.com/NeuralLog/specs) - Technical specifications for the NeuralLog system
- [Server](https://github.com/NeuralLog/server) - Central logging server
- [MCP Client](https://github.com/NeuralLog/mcp-client) - Claude integration via MCP (this package)
- [TypeScript Client](https://github.com/NeuralLog/typescript) - TypeScript client
- [Unity Client](https://github.com/NeuralLog/unity) - Unity client
- [Python Client](https://github.com/NeuralLog/python) - Python client
- [Java Client](https://github.com/NeuralLog/java) - Java client

## Architecture

The MCP client is a key component in the NeuralLog architecture, serving as the bridge between AI assistants and the NeuralLog system:

```
┌─────────────────────────────────────────────────────────────┐
│                     NeuralLog System                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────┐  │
│  │ NeuralLog   │  │ MCP Server          │  │ NeuralLog   │  │
│  │ Core        │◄─┤                     │◄─┤ MCP Clients │  │
│  │ Services    │  │ • Tool Registry     │  │             │  │
│  │             │  │ • Connection Mgmt   │  │ • TypeScript│  │
│  │ • Logging   │  │ • Authentication    │  │ • Unity     │  │
│  │ • Analysis  │  │ • Transport Layer   │  │ • Python    │  │
│  │ • Actions   │  │ • Request Handling  │  │ • Others    │  │
│  └─────────────┘  └─────────────────────┘  └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Future Development

The NeuralLog MCP Client is under active development with the following features planned:

- Enhanced authentication and security
- Support for more advanced logging features
- Integration with NeuralLog's rule and action systems
- Improved error handling and diagnostics
- Additional MCP tools for advanced log analysis

## Documentation

Detailed documentation is available in the [docs](./docs) directory:

- [API Reference](./docs/api.md)
- [Configuration](./docs/configuration.md)
- [Architecture](./docs/architecture.md)
- [Examples](./docs/examples)

For integration guides and tutorials, visit the [NeuralLog Documentation Site](https://neurallog.github.io/docs/).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

MIT
