#!/bin/bash
# Simple script to update CHANGELOG.md
# Usage: ./scripts/update-changelog.sh "Added" "New feature description" "src/components/SomeComponent.ts"

TYPE="$1"
DESCRIPTION="$2"
FILE="$3"

if [ -z "$TYPE" ] || [ -z "$DESCRIPTION" ]; then
  echo "Usage: $0 <type> <description> [file]"
  echo "Types: Added, Changed, Fixed, Removed, Deprecated, Security"
  exit 1
fi

CHANGELOG_FILE="CHANGELOG.sh"

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Create the change entry
if [ -n "$FILE" ]; then
  ENTRY="- $DESCRIPTION ($FILE)"
else
  ENTRY="- $DESCRIPTION"
fi

# Read current changelog
if [ -f "CHANGELOG.md" ]; then
  CONTENT=$(cat CHANGELOG.md)
else
  CONTENT="# ARCUS Construction Commerce Platform - Changelog\n\nAll notable changes to this project will be documented in this file.\n\n## [Unreleased]\n\n"
fi

# Add the entry under the appropriate section
SECTION_CASE=$(echo "$TYPE" | tr '[:lower:]' '[:upper:]')
case "$SECTION_CASE" in
  "ADDED")
    SECTION="### Added"
    ;;
  "CHANGED")
    SECTION="### Changed"
    ;;
  "FIXED")
    SECTION="### Fixed"
    ;;
  "REMOVED")
    SECTION="### Removed"
    ;;
  "DEPRECATED")
    SECTION="### Deprecated"
    ;;
  "SECURITY")
    SECTION="### Security"
    ;;
  *)
    SECTION="### Added"
    ;;
esac

# Check if section exists
if echo "$CONTENT" | grep -q "$SECTION"; then
  # Section exists, append to it
  NEW_CONTENT=$(echo "$CONTENT" | sed "/$SECTION/a\\$ENTRY")
else
  # Section doesn't exist, create it after [Unreleased]
  NEW_CONTENT=$(echo "$CONTENT" | sed "/## \[Unreleased]/a\\n$SECTION\\n$ENTRY")
fi

# Write back to file
echo -e "$NEW_CONTENT" > CHANGELOG.md

echo "Logged $TYPE change: $DESCRIPTION"
if [ -n "$FILE" ]; then
  echo "File: $FILE"
fi