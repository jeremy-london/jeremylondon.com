# Supported Tools and Features

Rulesync supports both **generation** and **import** for All of the major AI coding tools:

<!-- SUPPORTED_TOOLS_DOCS:BEGIN -->

| Tool                   | --targets       | rules | ignore |   mcp    | commands | subagents | skills | hooks | permissions |
| ---------------------- | --------------- | :---: | :----: | :------: | :------: | :-------: | :----: | :---: | :---------: |
| AGENTS.md              | agentsmd        |  ✅   |        |          |    🎮    |    🎮     |   🎮   |       |             |
| AgentsSkills           | agentsskills    |       |        |          |          |           | ✅ 🌏  |       |             |
| Amp                    | amp             | ✅ 🌏 |        |  ✅ 🌏   |          |           | ✅ 🌏  |       |    ✅ 🌏    |
| Claude Code            | claudecode      | ✅ 🌏 |   ✅   |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| Codex CLI              | codexcli        | ✅ 🌏 |        | ✅ 🌏 🔧 |    🌏    |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| GitHub Copilot         | copilot         | ✅ 🌏 |        |    ✅    |    ✅    |   ✅ 🌏   | ✅ 🌏  |  ✅   |             |
| GitHub Copilot CLI     | copilotcli      | ✅ 🌏 |        |  ✅ 🌏   |          |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |             |
| Goose                  | goose           | ✅ 🌏 |   ✅   |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   |   ✅   | ✅ 🌏 |     🌏      |
| Hermes Agent           | hermesagent     |  ✅   |        |    🌏    |    🌏    |   ✅ 🌏   |   🌏   |  🌏   |     🌏      |
| Grok CLI               | grokcli         | ✅ 🌏 |        |  ✅ 🌏   |          |   ✅ 🌏   | ✅ 🌏  |       |     🌏      |
| Cursor                 | cursor          |  ✅   |   ✅   |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| deepagents-cli         | deepagents      | ✅ 🌏 |        |  ✅ 🌏   |          |   ✅ 🌏   | ✅ 🌏  |  🌏   |             |
| Factory Droid          | factorydroid    | ✅ 🌏 |        |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| OpenCode               | opencode        | ✅ 🌏 |        | ✅ 🌏 🔧 |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| Cline                  | cline           | ✅ 🌏 |   ✅   |    🌏    |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  |       |     ✅      |
| Kilo Code              | kilo            | ✅ 🌏 |   ✅   |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| Roo Code               | roo             | ✅ 🌏 |   ✅   |    ✅    |    ✅    |    ✅     | ✅ 🌏  |       |             |
| Rovodev (Atlassian)    | rovodev         | ✅ 🌏 |        |    🌏    |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  |       |     🌏      |
| Takt                   | takt            | ✅ 🌏 |        |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  |       |    ✅ 🌏    |
| Vibe Code              | vibe            | ✅ 🌏 |   ✅   |  ✅ 🌏   |          |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| Qwen Code              | qwencode        | ✅ 🌏 |   ✅   | ✅ 🌏 🔧 |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| Reasonix               | reasonix        | ✅ 🌏 |        |  ✅ 🌏   |  ✅ 🌏   |           | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| Kiro ⚠️                | kiro            | ✅ 🌏 |   ✅   |  ✅ 🌏   |    ✅    |    ✅     |   ✅   |  ✅   |     ✅      |
| Kiro CLI               | kiro-cli        | ✅ 🌏 |   ✅   |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  |  ✅   |     ✅      |
| Kiro IDE               | kiro-ide        | ✅ 🌏 |   ✅   |  ✅ 🌏   |    ✅    |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |     ✅      |
| Google Antigravity IDE | antigravity-ide | ✅ 🌏 |        | ✅ 🌏 🔧 |  ✅ 🌏   |           | ✅ 🌏  | ✅ 🌏 |     ✅      |
| Google Antigravity CLI | antigravity-cli | ✅ 🌏 |   ✅   | ✅ 🌏 🔧 |  ✅ 🌏   |           | ✅ 🌏  | ✅ 🌏 |     🌏      |
| JetBrains AI Assistant | aiassistant     |  ✅   |   ✅   |          |          |           |   ✅   |       |             |
| JetBrains Junie        | junie           | ✅ 🌏 |   ✅   |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  |  🌏   |    ✅ 🌏    |
| AugmentCode            | augmentcode     | ✅ 🌏 |   ✅   |  ✅ 🌏   |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| Devin Desktop          | devin           | ✅ 🌏 |   ✅   | ✅ 🌏 🔧 |  ✅ 🌏   |   ✅ 🌏   | ✅ 🌏  | ✅ 🌏 |    ✅ 🌏    |
| Warp                   | warp            |  ✅   |   ✅   |  ✅ 🌏   |          |           | ✅ 🌏  |       |     🌏      |
| Replit                 | replit          |  ✅   |        |          |          |           | ✅ 🌏  |       |             |
| Pi Coding Agent        | pi              | ✅ 🌏 |        |          |  ✅ 🌏   |           | ✅ 🌏  |       |             |
| Zed                    | zed             | ✅ 🌏 |   ✅   |  ✅ 🌏   |          |           | ✅ 🌏  |       |    ✅ 🌏    |

<!-- SUPPORTED_TOOLS_DOCS:END -->

- ✅: Supports project mode
- 🌏: Supports global mode
- 🎮: Supports simulated commands/subagents/skills (Project mode only)
- 🔧: Supports MCP tool config (`enabledTools`/`disabledTools`)
- ⚠️: Deprecated - still supported, but see the note below

## Deprecation notes

- **Google Antigravity (`antigravity-ide` / `antigravity-cli`)** - Antigravity 2.0 splits into two products: the desktop **`antigravity-ide`** and the **`antigravity-cli`** (`agy`). As of Antigravity 2.0 the IDE reads its global MCP config and skills from the shared `~/.gemini/config/` tree - `~/.gemini/config/mcp_config.json` and `~/.gemini/config/skills/`, matching the current [MCP](https://antigravity.google/docs/mcp) and [Skills](https://antigravity.google/docs/skills) docs. The `antigravity-cli` global MCP config also lives in the shared `~/.gemini/config/mcp_config.json`, while the CLI keeps its own global skills tree at `~/.gemini/antigravity-cli/skills/`. Both targets also intentionally **share** the global rule file `~/.gemini/GEMINI.md` and the global hooks file `~/.gemini/config/hooks.json` - enabling both targets in `--global` mode writes those shared files once. For project-scope rules, **both `antigravity-ide` and `antigravity-cli`** emit the root rule as a plain cross-tool **`AGENTS.md`** at the project root (the Gemini-lineage discovery order is `AGENTS.md`, `CONTEXT.md`, `GEMINI.md`; the IDE has read `AGENTS.md` since v1.20.3) and non-root rules under `.agents/rules/` (the IDE adds trigger frontmatter to non-root rules; the CLI keeps them as plain markdown). For **commands (workflows)**, both targets share the project `.agents/workflows/` directory (invoked as `/workflow-name`); in `--global` mode the IDE writes to `~/.gemini/antigravity/global_workflows/` while the CLI keeps its own `~/.gemini/antigravity-cli/global_workflows/` tree (mirroring the CLI's global skills tree).
- **Kiro (`kiro`)** - Kiro ships as two products with diverging config formats: the **Kiro IDE** reads Markdown subagents (`.rulesync/agents/*.md`) and structured JSON hooks (`.rulesync/hooks/*.json`, format `{ "version": "v1", "hooks": [ ... ] }`), while the **Kiro CLI** reads JSON agent-config subagents (`.rulesync/agents/*.json`) and agent hooks in `.rulesync/agents/default.json`. A single target cannot emit both faithfully, so `kiro` is split into **`kiro-cli`** and **`kiro-ide`**. The legacy `kiro` target is kept as a **deprecated alias** (its current mixed output is unchanged for backward compatibility). Shared surfaces (steering rules with `inclusion`, `.rulesync/settings/mcp.json`, `.rulesync/prompts/` commands, `.rulesync/skills/`, `.rulesyncignore`, permissions) are identical between the two; they differ in **subagents** (`.md` vs `.json`) and **hooks**. Kiro IDE **hooks** are emitted as a single `.rulesync/hooks/rulesync.json` (whose `hooks` array holds every generated hook) in both project (`.rulesync/hooks/`) and global (`~/.rulesync/hooks/`) scope, mapping canonical lifecycle events to the IDE's PascalCase triggers (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`) and supporting both `agent` (prompt) and `command` actions; the Kiro CLI continues to emit agent hooks in `.rulesync/agents/default.json`. Global **skills** (`~/.rulesync/skills/`) and global Kiro IDE **subagents** (`~/.rulesync/agents/`) are also supported, as are global Kiro CLI **commands** (`~/.rulesync/prompts/`) and **subagents** (`~/.rulesync/agents/`).
