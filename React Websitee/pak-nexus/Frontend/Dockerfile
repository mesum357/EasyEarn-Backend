# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install necessary build tools
RUN apk add --no-cache python3 make g++ curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Install serve globally for static file serving
RUN npm install -g serve

# Print build info for debugging
RUN echo "=== Build Complete ===" && \
    echo "Node version: $(node --version)" && \
    echo "NPM version: $(npm --version)" && \
    echo "Working directory: $(pwd)" && \
    echo "Files in dist: $(ls -la dist/)" && \
    echo "======================"

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start the application
CMD ["serve", "dist", "-p", "8080", "-l", "0.0.0.0"]
