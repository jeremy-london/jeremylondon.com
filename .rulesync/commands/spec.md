---
description: "Write the goal spec (PROMPT.md) before implementing. Loads the loopkit spec-first skill."
targets: ["*"]
argument-hint: "[--force]"
allowed-tools: "Read, Write, Bash(ls:*)"
---

# /spec -- write the goal spec before you act

Use this when the user asks for implementation work, feature work, refactors, migrations, or any task where the target behavior should be pinned down before editing.

1. Read the current request and relevant repo context.
2. Load the `spec-first` skill from `.rulesync/skills/spec-first/SKILL.md`.
   - If running from generated files only, use the current agent's generated skill path for `spec-first`.
3. Write `PROMPT.md` with the goal, constraints, acceptance criteria, non-goals, and known risks.
4. Write `IMPLEMENTATION_PLAN.md` with the concrete plan.
5. Stop and ask the user to approve or adjust the spec before implementation unless they explicitly passed `--force`.

Do not implement during `/spec` unless `--force` is present.
