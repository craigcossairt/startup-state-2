#!/usr/bin/env bash
# Fail if deleted placeholder paths still exist, or if kept product paths vanished.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
fail=0
must_gone=(
  public/file.svg
  public/globe.svg
  public/next.svg
  public/vercel.svg
  public/window.svg
  public/brand/ss-horiz-white.png
  public/brand/goed-only-color.svg
  public/brand/startup-state-horizontal.svg
  public/brand/startup-state-mark-white.svg
  scripts/check-import-fences.sh
  docs/writing-your-own-skills.md
  docs/recommended-tooling.md
)
must_keep=(
  public/brand/ss-horiz-color.png
  public/brand/goed-only-color.png
  public/brand/startup-state-mark.svg
  docs/growing-into-a-workspace.md
  README.md
  docs/about-me.md
  src/app/layout.tsx
)
for rel in "${must_gone[@]}"; do
  if [[ -e "$root/$rel" ]]; then
    printf 'cleanup: still present (should be gone): %s\n' "$rel" >&2
    fail=1
  fi
done
for rel in "${must_keep[@]}"; do
  if [[ ! -e "$root/$rel" ]]; then
    printf 'cleanup: missing (must keep): %s\n' "$rel" >&2
    fail=1
  fi
done
# No code may still import deleted public placeholders
if grep -RInE 'file\.svg|globe\.svg|next\.svg|vercel\.svg|window\.svg' "$root/src" "$root/docs" 2>/dev/null; then
  printf 'cleanup: leftover reference to placeholder svg\n' >&2
  fail=1
fi
if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
printf 'cleanup: refs ok\n'
