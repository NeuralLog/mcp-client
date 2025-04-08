#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

/**
 * AI-MCP-Logger MCP Client
 *
 * This client implements the Model Context Protocol (MCP) for the AI-MCP-Logger system.
 * It provides tools for retrieving and searching logs from the AI-MCP-Logger server.
 */

// Configuration
const webServerUrl = process.env.WEB_SERVER_URL || "http://localhost:3030";

// Create an MCP server
const server = new McpServer({
  name: "AI-MCP-Logger",
  version: "0.1.0"
});

// Add get_logs tool
server.tool(
  "get_logs",
  { limit: z.number().optional().describe("Maximum number of log names to return (default: 1000)") },
  async (args) => {
    try {
      // Forward to Web Server
      const response = await axios.get(`${webServerUrl}/logs`, {
        params: { limit: args.limit || 1000 }
      });

      // Return the data directly without additional formatting
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error getting logs: ${error.message || String(error)}`
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add get_log_by_name tool
server.tool(
  "get_log_by_name",
  {
    log_name: z.string().describe("Name of the log to retrieve"),
    limit: z.number().optional().describe("Maximum number of log entries to return (default: 100)")
  },
  async (args) => {
    try {
      // Forward to Web Server
      const response = await axios.get(`${webServerUrl}/logs/${args.log_name}`, {
        params: { limit: args.limit || 100 }
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error getting log '${args.log_name}': ${error.message || String(error)}`
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add search tool
server.tool(
  "search",
  {
    query: z.string().optional().describe("Text to search for across all logs"),
    log_name: z.string().optional().describe("Specific log to search (if omitted, searches all logs)"),
    start_time: z.string().optional().describe("Filter entries after this timestamp (ISO format)"),
    end_time: z.string().optional().describe("Filter entries before this timestamp (ISO format)"),
    field_filters: z.record(z.any()).optional().describe("Filter by specific field values, e.g. {\"level\": \"error\"}"),
    limit: z.number().optional().describe("Maximum number of entries to return (default: 100)")
  },
  async (args) => {
    try {
      // Prepare search parameters
      const params: Record<string, any> = {};

      // Add basic search parameters
      if (args.query) params.query = args.query;
      if (args.log_name) params.log_name = args.log_name;
      if (args.limit) params.limit = args.limit;
      if (args.start_time) params.start_time = args.start_time;
      if (args.end_time) params.end_time = args.end_time;

      // Add field filters with field_ prefix
      if (args.field_filters) {
        for (const [field, value] of Object.entries(args.field_filters)) {
          params[`field_${field}`] = value;
        }
      }

      // Call the server-side search endpoint
      const response = await axios.get(`${webServerUrl}/search`, { params });

      // Return the results as JSON (default format for AI consumption)
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error searching logs: ${error.message || String(error)}`
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add append_to_log tool
server.tool(
  "append_to_log",
  {
    log_name: z.string().describe("Name of the log to append to"),
    data: z.any().describe("Data to append to the log")
  },
  async (args) => {
    try {
      // Forward to Web Server
      const response = await axios.post(`${webServerUrl}/logs/${args.log_name}`, args.data);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error appending to log '${args.log_name}': ${error.message || String(error)}`
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Add clear_log tool
server.tool(
  "clear_log",
  {
    log_name: z.string().describe("Name of the log to clear")
  },
  async (args) => {
    try {
      // Forward to Web Server
      const response = await axios.delete(`${webServerUrl}/logs/${args.log_name}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error clearing log '${args.log_name}': ${error.message || String(error)}`
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
