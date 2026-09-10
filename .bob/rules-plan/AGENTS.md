# AGENTS.md — Plan Mode

This file provides guidance to agents when working with code in this repository.

## Architecture Constraints

- **No application runtime** — this workspace is purely declarative. "Building" means authoring spec files (YAML/JSON) or Python tool modules, then importing them via the `orchestrate` CLI or MCP tools.
- **Style/toolkit coupling**: `toolkits` on an agent are only valid for `experimental_customer_care` style. Any plan that assigns toolkits to a `react`/`default`/`planner` agent will fail at import.
- **Planner agents**: `custom_join_tool` and `structured_output` are mutually exclusive — plan for one or the other, not both.
- **Tool module paths are CWD-relative**: Python tool files must be importable from the working directory at import time. Plan the file layout before writing tools.
- **Spec versioning is forward-only**: there is no rollback mechanism — plan changes as additive imports or explicit deletes via the CLI/MCP.

## Resource Dependency Order

When planning multi-resource imports:
1. Connections first (tools/toolkits may depend on them)
2. Tools / Toolkits
3. Knowledge bases
4. Agents last (they reference tools, toolkits, knowledge bases, and other agents by name)

## Environment Model

Two environments exist: `draft` and `live`. All MCP tool calls target the currently authenticated environment. Changes in `draft` are not automatically promoted to `live`.
