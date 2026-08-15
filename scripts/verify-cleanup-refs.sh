#!/usr/bin/env bash
# Fail if deleted cruft paths still exist, kept paths vanished, or deleted names still appear outside known history notes.
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
  src/lib/admin-snapshot.ts
  src/lib/admin-snapshot.test.ts
)
must_keep=(
  public/brand/ss-horiz-color.png
  public/brand/goed-only-color.png
  public/brand/startup-state-mark.svg
  docs/growing-into-a-workspace.md
  scripts/run-judged-rank.ts
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
patterns='file\.svg|globe\.svg|next\.svg|vercel\.svg|window\.svg|ss-horiz-white\.png|goed-only-color\.svg|startup-state-horizontal\.svg|startup-state-mark-white\.svg|check-import-fences\.sh|writing-your-own-skills\.md|recommended-tooling\.md|admin-snapshot\.ts|buildAdminSnapshot'
while IFS= read -r match; do
  case "$match" in
    *docs/audit/repo-cleanup-sweep.tsv*) continue ;;
    *scripts/verify-cleanup-refs.sh*) continue ;;
    *docs/decision-log.md*) continue ;;
  esac
  printf 'cleanup: leftover reference: %s\n' "$match" >&2
  fail=1
done < <(grep -RInE --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next "$patterns" "$root" 2>/dev/null || true)
if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
printf 'cleanup: refs ok\n'
