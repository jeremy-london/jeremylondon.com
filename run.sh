#!/usr/bin/env bash
# Agent-agnostic loopkit runner: fresh context each turn, state on disk.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPT_FILE="${PROMPT_FILE:-PROMPT.md}"
PLAN_FILE="${PLAN_FILE:-IMPLEMENTATION_PLAN.md}"
STATUS_PATTERN="${STATUS_PATTERN:-^STATUS: done$}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"
MAX_LOOPS="${MAX_LOOPS:-0}"
AGENT="${AGENT:-auto}"
AGENT_COMMAND="${AGENT_COMMAND:-}"

usage() {
  cat <<'EOF'
Usage: ./run.sh [--agent auto|claude|codex|custom] [--once]

Environment:
  AGENT           Agent to run. Defaults to auto.
  AGENT_COMMAND   Custom command for other agents. Use {prompt} as a placeholder,
                  or omit it to append the prompt as the last argument.
  PROMPT_FILE     Goal prompt file. Defaults to PROMPT.md.
  PLAN_FILE       Plan/status file. Defaults to IMPLEMENTATION_PLAN.md.
  STATUS_PATTERN  Done marker regex. Defaults to ^STATUS: done$.
  MAX_LOOPS       0 means run until done. Any positive number caps iterations.
  SLEEP_SECONDS   Delay between iterations. Defaults to 5.

Examples:
  ./run.sh --agent claude
  ./run.sh --agent codex
  AGENT_COMMAND='my-agent run {prompt}' ./run.sh --agent custom
EOF
}

ONCE=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    --agent)
      AGENT="${2:-}"
      shift 2
      ;;
    --once)
      ONCE=true
      MAX_LOOPS=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

need_file() {
  if [ ! -f "$ROOT_DIR/$1" ]; then
    echo "Missing required file: $1" >&2
    exit 1
  fi
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

detect_agent() {
  if [ -n "$AGENT_COMMAND" ]; then
    echo "custom"
    return
  fi

  case "$AGENT" in
    auto) ;;
    claude|codex|custom)
      echo "$AGENT"
      return
      ;;
    *)
      echo "Unsupported agent: $AGENT" >&2
      exit 2
      ;;
  esac

  if [ -n "${CLAUDE_PROJECT_DIR:-}" ] || [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
    echo "claude"
    return
  fi
  if [ -n "${CODEX_HOME:-}" ] || [ -n "${CODEX_SANDBOX:-}" ] || [ -n "${CODEX_SESSION_ID:-}" ]; then
    echo "codex"
    return
  fi
  if has_command claude; then
    echo "claude"
    return
  fi
  if has_command codex; then
    echo "codex"
    return
  fi

  echo "No supported agent CLI found. Set AGENT_COMMAND for this environment." >&2
  exit 1
}

run_custom() {
  local prompt="$1"
  if [[ "$AGENT_COMMAND" == *"{prompt}"* ]]; then
    local quoted_prompt
    printf -v quoted_prompt '%q' "$prompt"
    local command_string="${AGENT_COMMAND//\{prompt\}/$quoted_prompt}"
    bash -lc "$command_string"
  else
    bash -lc "$AGENT_COMMAND \"\$1\"" _ "$prompt"
  fi
}

run_agent() {
  local agent="$1"
  local prompt="$2"

  case "$agent" in
    claude)
      has_command claude || { echo "claude CLI not found" >&2; exit 1; }
      claude -p "$prompt"
      ;;
    codex)
      has_command codex || { echo "codex CLI not found" >&2; exit 1; }
      codex exec -C "$ROOT_DIR" "$prompt"
      ;;
    custom)
      [ -n "$AGENT_COMMAND" ] || {
        echo "AGENT_COMMAND is required when AGENT=custom" >&2
        exit 1
      }
      run_custom "$prompt"
      ;;
  esac
}

build_step_prompt() {
  cat <<EOF
Read $PROMPT_FILE and $PLAN_FILE. Do the next implementation step.

Use this repository's generated agent rules and the rulesync source under .rulesync/ as applicable.
Keep changes focused. Run the relevant checks for the step. Update $PLAN_FILE with progress.
If the work is complete and checks are green, set a line exactly matching: STATUS: done
EOF
}

build_verify_prompt() {
  cat <<EOF
Run the verification workflow for the current diff.

Use .rulesync/commands/verify.md as the source behavior if your agent does not support the /verify slash command.
Assume the change is broken until the diff, checks, and generated files prove otherwise.
Report blocking issues first. If verification passes, keep the response short.
EOF
}

need_file "$PROMPT_FILE"
need_file "$PLAN_FILE"

SELECTED_AGENT="$(detect_agent)"
echo "Using agent: $SELECTED_AGENT"

loop_count=0
while true; do
  loop_count=$((loop_count + 1))
  echo "Iteration: $loop_count"

  run_agent "$SELECTED_AGENT" "$(build_step_prompt)"

  if [ "$SELECTED_AGENT" = "claude" ]; then
    run_agent "$SELECTED_AGENT" "/verify" || echo "verify failed, will retry"
  else
    run_agent "$SELECTED_AGENT" "$(build_verify_prompt)" || echo "verify failed, will retry"
  fi

  if grep -Eq "$STATUS_PATTERN" "$ROOT_DIR/$PLAN_FILE"; then
    echo "done"
    break
  fi

  if [ "$ONCE" = true ]; then
    echo "stopped after one iteration"
    break
  fi

  if [ "$MAX_LOOPS" -gt 0 ] && [ "$loop_count" -ge "$MAX_LOOPS" ]; then
    echo "stopped after MAX_LOOPS=$MAX_LOOPS"
    break
  fi

  sleep "$SLEEP_SECONDS"
done
