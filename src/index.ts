#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Silent logging function - does nothing
function log(level: string, message: string) {
  // No-op - completely silent
}

// Get the web server URL from environment variables or use default
const webServerUrl = process.env.WEB_SERVER_URL || 'http://localhost:3030';

// Create an MCP server
const server = new McpServer({
  name: "AI-MCP-Logger",
  version: "0.1.0"
});

// Add get_logs_ai-logger tool
server.tool("get_logs_ai-logger",
  { limit: z.number().optional() },
  async (args) => {
    try {
      const { limit = 10 } = args;
      log('info', `Getting logs with limit: ${limit}`);

      // Forward to Web Server
      const response = await axios.get(`${webServerUrl}/logs`, {
        params: { limit }
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      log('error', `Error getting logs: ${error}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error.message || String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Add get_log_by_name_ai-logger tool
server.tool("get_log_by_name_ai-logger",
  {
    log_name: z.string(),
    limit: z.number().optional()
  },
  async (args) => {
    try {
      const { log_name, limit = 10 } = args;
      log('info', `Getting log by name: ${log_name}, limit: ${limit}`);

      // Forward to Web Server
      const response = await axios.get(`${webServerUrl}/logs/${log_name}`, {
        params: { limit }
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      log('error', `Error getting log by name: ${error}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error.message || String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Add append_to_log_ai-logger tool
server.tool("append_to_log_ai-logger",
  {
    log_name: z.string(),
    data: z.any()
  },
  async (args) => {
    try {
      const { log_name, data } = args;
      log('info', `Appending to log: ${log_name}`);

      // Forward to Web Server
      const response = await axios.post(`${webServerUrl}/logs/${log_name}`, data);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      log('error', `Error appending to log: ${error}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error.message || String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Add clear_log_ai-logger tool
server.tool("clear_log_ai-logger",
  {
    log_name: z.string()
  },
  async (args) => {
    try {
      const { log_name } = args;
      log('info', `Clearing log: ${log_name}`);

      // Forward to Web Server
      const response = await axios.delete(`${webServerUrl}/logs/${log_name}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      log('error', `Error clearing log: ${error}`);
      return {
        content: [{
          type: "text",
          text: `Error: ${error.message || String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
log('info', "AI-MCP-Logger STDIO client starting...");

// Connect the server to the transport
server.connect(transport).catch((error: any) => {
  log('error', `Error connecting to transport: ${error}`);
  process.exit(1);
});

log('info', "AI-MCP-Logger STDIO client started");

// Handle process exit
process.on('exit', () => {
  log('info', "AI-MCP-Logger STDIO client shutting down");
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  log('error', `Uncaught exception: ${error}`);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any) => {
  log('error', `Unhandled rejection: ${reason}`);
  process.exit(1);
});
