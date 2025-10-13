#!/bin/bash
# Run E2E tests with automatic or manual port detection

# Check if port is provided as argument
if [ -n "$1" ]; then
  PORT=$1
  echo "✓ Using port $PORT from command line argument"
else
  # Try to detect from running dev server output
  # Check common ports
  for port in 3000 3001 3002 3003 3004 3005; do
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
      PORT=$port
      echo "✓ Detected dev server on port $PORT"
      break
    fi
  done

  # If still not found, use default
  if [ -z "$PORT" ]; then
    PORT=3000
    echo "⚠ No running dev server detected, using default port $PORT"
    echo "  Make sure to start the dev server with: npm run dev"
  fi
fi

# Run the tests with the detected/specified port
echo "Running E2E tests on http://localhost:$PORT"
TEST_PORT=$PORT npm run test:e2e
