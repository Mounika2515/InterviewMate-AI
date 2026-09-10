# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

This is a **watsonx Orchestrate (WXO) workspace** — a configuration-as-code project for managing agents, tools, toolkits, connections, knowledge bases, and models on IBM watsonx Orchestrate. There is no application source code here; everything is declarative spec files (YAML/JSON) or Python tool definitions, managed via the `orchestrate` CLI and the MCP server.

## Stack

- **Runtime**: Python 3.12 (managed by `uv` in `venv/`)
- **SDK**: `ibm-watsonx-orchestrate` v2.16.1 (installed in `venv/`)
- **MCP server**: `ibm-watsonx-orchestrate-mcp-server` (invoked via `uvx`)
- **CLI entry point**: `orchestrate` (maps to `ibm_watsonx_orchestrate.cli.main:app`)

## Workspace Layout (from `workspace_config.yaml`)

```
agents/          ← agent spec files (.yaml / .json)
tools/           ← python tool files (.py) or openapi specs
toolkits/        ← MCP / python toolkit spec files
connections/     ← connection spec files
knowledge-bases/ ← knowledge base spec files
models/          ← model/policy spec files
```

All directories are currently empty — resources are managed live via the MCP tools or CLI.

## CLI Commands (run inside the workspace)

```bash
# Authentication
orchestrate env add  --name <env> --url <url>  # register an environment
orchestrate login --env <env>                  # authenticate

# Resource management
orchestrate agents import --file <file>
orchestrate tools import --file <file> --kind python|openapi
orchestrate toolkits import --file <file>
orchestrate connections import --file <file>
orchestrate knowledge-bases import --file <file>
orchestrate models import --file <file>
```

No build/test/lint pipeline exists — this workspace has no application code.

## Spec File Conventions (non-obvious)

- All spec files **require** a top-level `spec_version` field (e.g. `spec_version: v1`); omitting it raises `BadRequest` on import.
- Agent specs **must** have non-empty, non-whitespace `name` and `description` fields; empty strings are rejected.
- `AgentStyle.REACT_CORE` is serialized to the backend as `"react_intrinsic"` — do not write `react_core` in raw YAML specs sent directly to the API.
- `toolkits` on an agent spec are **only valid** for `experimental_customer_care` style agents; any other style raises `BadRequest`.
- For planner-style agents, `custom_join_tool` and `structured_output` are mutually exclusive.

## Python Tool Authoring

- Decorate tool functions with `@tool` from `ibm_watsonx_orchestrate.agent_builder.tools`.
- The tool's `name` defaults to the Python function name; `description` defaults to the docstring description.
- Use **Google-style docstrings** for parameter descriptions — malformed docstrings silently degrade agent routing quality.
- All parameters must have type hints; missing hints default to `str` with a warning.
- For file upload params use `WXOFile` or `List[WXOFile]` (optionally annotated with `MultiFileConstraints`).
- `Optional[T]` params with a default are automatically marked non-required in the generated JSON schema.

## MCP Tools (Bob integration)

The MCP server (`watsonx-orchestrate-adk`) exposes all CRUD operations for agents, tools, toolkits, connections, knowledge bases, and models directly as Bob tools. Prefer MCP tools over running the CLI manually when working inside Bob.
