#!/bin/bash
set -e

# Bump version and create git tag
# Usage: ./deploy/scripts/version.sh [patch|minor|major]

BUMP_TYPE=${1:-patch}

echo "Bumping version ($BUMP_TYPE)..."

# Navigate to package directory
cd "$(dirname "$0")/../.."

# Validate bump type
if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  echo "Error: Invalid bump type. Use: patch, minor, or major"
  exit 1
fi

# Run tests first
echo "Running tests before version bump..."
npm run test

# Bump version
NEW_VERSION=$(npm version $BUMP_TYPE --no-git-tag-version)
echo "New version: $NEW_VERSION"

echo ""
echo "Version bumped to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Update CHANGELOG.md with new version"
echo "  2. Commit: git commit -am \"chore: release $NEW_VERSION\""
echo "  3. Tag: git tag $NEW_VERSION"
echo "  4. Push: git push && git push --tags"
echo "  5. Publish: ./deploy/scripts/publish.sh"
