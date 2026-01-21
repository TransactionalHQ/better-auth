#!/bin/bash
set -e

# Publish to npm
# Usage: ./deploy/scripts/publish.sh [--dry-run]

echo "Publishing transactional-better-auth to npm..."

# Navigate to package directory
cd "$(dirname "$0")/../.."

# Check for dry run flag
DRY_RUN=""
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo "Running in dry-run mode..."
fi

# Ensure we're logged into npm
if ! npm whoami > /dev/null 2>&1; then
  echo "Error: Not logged into npm. Run 'npm login' first."
  exit 1
fi

# Build first
./deploy/scripts/build.sh

# Publish
echo ""
echo "Publishing package..."
npm publish $DRY_RUN --access public

if [[ -z "$DRY_RUN" ]]; then
  echo ""
  echo "Successfully published transactional-better-auth!"
  echo "View at: https://www.npmjs.com/package/transactional-better-auth"
else
  echo ""
  echo "Dry run complete. No package was published."
fi
