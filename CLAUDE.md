# CLAUDE.md

@AGENTS.md

Claude Code specifics (everything above is harness-agnostic):

- Hooks, slash commands, skills, and agents live in `.claude/` - see SETUP.md for what's wired.
- The `/tdd`, `/bug-report`, and `/worktree` commands are thin wrappers around
  `docs/methodology/` - auto-follow them without being asked to invoke them by name.
- The optional local knowledge base in `brain/` injects context via a UserPromptSubmit hook once
  initialized (see `brain/README.md`). Kill switch: `PROJECT_BRAIN_DISABLE=1`.

## Agent skills

### Issue tracker

GitHub Issues on `craigcossairt/startup-state-2` via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default mattpocock triage roles plus `wayfinder:*` map labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` plus briefs under `docs/briefs/`. See `docs/agents/domain.md`.

### Matt Pocock skills

Engineering and productivity skills from [mattpocock/skills](https://github.com/mattpocock/skills) live under `.claude/skills/`. Cursor routers under `.cursor/skills/`. Locked in `skills-lock.json`. **TDD:** use this repo's `/tdd` command (`docs/methodology/tdd.md`), not mattpocock's `tdd` skill (not installed).
