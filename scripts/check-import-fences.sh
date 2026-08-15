#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
fail=0

die() {
  printf 'import-fence: %s\n' "$1" >&2
  fail=1
}

if [[ -e "$root/src/components/admin/tyler-card.tsx" ]]; then
  die "tyler-card.tsx must not be imported"
fi

if grep -RInE --exclude='*.test.ts' --exclude='*.test.tsx' 'TylerCard|canvas-confetti|For Tyler' "$root/src" >/dev/null; then
  die "Tyler easter egg strings are present under src/"
fi

if grep -RInE 'href="/playbook"|href="/careers"|href="/swag"|href="/news"' "$root/src/components/nav.tsx" >/dev/null; then
  die "Part 1 leftover nav items are on the Opportunity Finder nav"
fi

if ! grep -q 'Footer' "$root/src/app/layout.tsx"; then
  die "root layout does not mount Footer"
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

printf 'import-fence: clean\n'
