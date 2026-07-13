---
description: "Run adversarial verification on the current diff before claiming done. Loads the loopkit adversarial-verify skill and dispatches the verifier subagent."
targets: ["*"]
argument-hint: "[--summary]"
allowed-tools: "Read, Grep, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(pnpm check:fix), Bash(pnpm markdown:check)"
---

# /verify -- assume the change is broken

Use this before telling the user a code change is complete.

1. Read the current diff and any active goal/spec files.
2. Load `.rulesync/skills/adversarial-verify/SKILL.md`.
   - If running from generated files only, use the current agent's generated skill path for `adversarial-verify`.
3. Use the `verifier` subagent from `.rulesync/subagents/verifier.md`.
   - If running from generated files only, use the current agent's generated subagent path for `verifier`.
4. Ensure the verifier runs `pnpm check:fix` and then `pnpm markdown:check` from the project root before its final verdict.
5. Check for behavioral regressions, missing tests, stale generated output, broken docs, and claims not supported by the diff.
6. Return concrete findings first, then a short pass/fail summary.

If `--summary` is present, keep the result compact but do not hide blocking issues.
