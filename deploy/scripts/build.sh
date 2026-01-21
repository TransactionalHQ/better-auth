#!/bin/bash
set -e

echo "Building transactional-better-auth..."

# Navigate to package directory
cd "$(dirname "$0")/../.."

# Install dependencies
echo "Installing dependencies..."
npm install

# Run type check
echo "Running type check..."
npm run typecheck

# Run tests
echo "Running tests..."
npm run test

# Build
echo "Building package..."
npm run build

echo "Build complete!"
echo ""
echo "Output files:"
ls -la dist/
