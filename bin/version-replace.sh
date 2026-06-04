#!/usr/bin/env bash
#
# Replace the SPSG_VERSION placeholder with the current plugin version.
#
# Mirrors dokan-lite's bin/version-replace.js. Any occurrence of the
# SPSG_VERSION placeholder in source files (typically `@since SPSG_VERSION`
# docblocks on newly added code) is replaced with the "version" value from
# package.json. Run on release via `npm run version`.
#
# Usage: bash bin/version-replace.sh
#
set -euo pipefail

# Resolve plugin root (parent of this script's directory) and work from there.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PLACEHOLDER="SPSG_VERSION"

# Read "version" from package.json.
VERSION="$(grep -m1 '"version"' package.json | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"

if [ -z "$VERSION" ]; then
    echo "Error: could not read version from package.json" >&2
    exit 1
fi

echo "Replacing ${PLACEHOLDER} -> ${VERSION}"

# List source files containing the placeholder, skipping build/third-party trees.
files="$(grep -rl "$PLACEHOLDER" . \
    --include='*.php' --include='*.js' --include='*.jsx' \
    --include='*.ts' --include='*.tsx' --include='*.scss' --include='*.css' \
    --exclude-dir={node_modules,vendor,lib,build,dist,.git} || true)"

count=0
for file in $files; do
    perl -pi -e "s#\\Q${PLACEHOLDER}\\E#${VERSION}#g" "$file"
    echo "  updated: $file"
    count=$((count + 1))
done

echo "Done. ${count} file(s) updated."
