#!/usr/bin/env bash
# SessionStart hook for loopkit: inject the using-loopkit bootstrap skill as
# additionalContext so skills auto-trigger from turn 1 without the user
# having to remember they exist.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "${SCRIPT_DIR}/../.." && pwd)}"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$PROJECT_ROOT}"

BOOTSTRAP="${PROJECT_ROOT}/.rulesync/skills/using-loopkit/SKILL.md"
if [ ! -f "$BOOTSTRAP" ]; then
  BOOTSTRAP="${PLUGIN_ROOT}/skills/using-loopkit/SKILL.md"
fi
if [ ! -f "$BOOTSTRAP" ]; then
  BOOTSTRAP="${PROJECT_ROOT}/.claude/skills/using-loopkit/SKILL.md"
fi
[ -f "$BOOTSTRAP" ] || exit 0

if [ -n "${CODEX_THREAD_ID:-}" ] || [ -n "${CODEX_MANAGED_BY_NPM:-}" ]; then
  printf '{}\n'
  exit 0
fi

body="$(cat "$BOOTSTRAP")"

escape_for_json() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  s="${s//$'\n'/\\n}"
  s="${s//$'\r'/\\r}"
  s="${s//$'\t'/\\t}"
  printf '%s' "$s"
}
escaped="$(escape_for_json "$body")"

ctx="<EXTREMELY_IMPORTANT>\nThis project uses loopkit. Below is the using-loopkit bootstrap: the routing rules for all other loopkit skills. Read it BEFORE responding; invoke matching skills BEFORE any other action.\n\n${escaped}\n</EXTREMELY_IMPORTANT>"

printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$ctx"
exit 0
