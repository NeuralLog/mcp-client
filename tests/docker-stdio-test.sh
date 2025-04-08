#!/bin/bash

# This script tests the MCP client's STDIO communication using Docker
# It builds the Docker image, runs the container with test input, and verifies the output

# Build the Docker image
echo "Building Docker image..."
docker build -t ai-mcp-logger-mcp-client .

# Create test input
TEST_INPUT='{
  "type": "function_call",
  "name": "get_logs",
  "arguments": {}
}'

# Run the Docker container with test input
echo "Running Docker container with test input..."
OUTPUT=$(echo "$TEST_INPUT" | docker run -i -e WEB_SERVER_URL=http://localhost:3030 ai-mcp-logger-mcp-client)

# Print the output
echo "Output from MCP client:"
echo "$OUTPUT"

# Verify the output structure
if echo "$OUTPUT" | grep -q "function_result"; then
  echo "Test passed! Output contains 'function_result'"
  exit 0
else
  echo "Test failed! Output does not contain 'function_result'"
  exit 1
fi
