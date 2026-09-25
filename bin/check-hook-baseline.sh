#!/usr/bin/env bash
#
# Fails when a PHP hook in tests/compat/php-hooks-baseline.txt is no longer
# fired anywhere in the plugin (ADR-004: hooks are never renamed or removed).
#
# Hook names are read from do_action / apply_filters calls with a string
# literal first argument. New hook names are listed so they can be appended to
# the baseline in the same change.
#
# Usage: bash bin/check-hook-baseline.sh   (or: npm run check:hooks)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASELINE="$ROOT/tests/compat/php-hooks-baseline.txt"

if [[ ! -f "$BASELINE" ]]; then
    echo "Baseline not found: $BASELINE" >&2
    exit 2
fi

current="$(mktemp)"
trap 'rm -f "$current"' EXIT

# Whole-file matching, so calls whose hook name sits on the next line are found too.
find "$ROOT" -type f -name '*.php' \
    -not -path '*/node_modules/*' -not -path '*/vendor/*' -not -path "$ROOT/lib/*" \
    -not -path "$ROOT/tests/*" -not -path "$ROOT/build/*" -not -path '*/.git/*' \
    -print0 \
    | xargs -0 perl -0777 -ne \
        'while ( /\b(?:do_action|apply_filters)(?:_ref_array|_deprecated)?\(\s*[\x27"]([^\x27"]+)/g ) { print "$1\n" }' \
    | sort -u > "$current"

missing="$(comm -23 <(sort -u "$BASELINE") "$current")"
added="$(comm -13 <(sort -u "$BASELINE") "$current")"

if [[ -n "$added" ]]; then
    echo "New hooks (append them to tests/compat/php-hooks-baseline.txt):"
    echo "$added" | sed 's/^/  + /'
fi

if [[ -n "$missing" ]]; then
    echo "Hooks removed or renamed (not allowed, see docs/adr/ADR-004-backward-compatibility.md):" >&2
    echo "$missing" | sed 's/^/  - /' >&2
    exit 1
fi

echo "Hook baseline OK ($(wc -l < "$BASELINE" | tr -d ' ') hooks)."
