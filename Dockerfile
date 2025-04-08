FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Create a directory for logs
RUN mkdir -p /var/log/ailogger

# Set environment variables
ENV NODE_ENV=production
ENV WEB_SERVER_URL=http://localhost:3030
ENV LOG_DIR=/var/log/ailogger

# Set the entry point to the MCP client
# Using ENTRYPOINT instead of CMD ensures that the process receives signals properly
ENTRYPOINT ["node", "src/index.js"]
