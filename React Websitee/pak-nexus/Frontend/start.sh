#!/bin/sh

# Set default port if not provided
export PORT=${PORT:-8080}

# Start the application
echo "Starting application on port $PORT..."
npm start
