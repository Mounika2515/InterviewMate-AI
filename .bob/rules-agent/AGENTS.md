# AGENTS.md — Agent (Coding) Mode

This file provides guidance to agents when working with code in this repository.

## Writing Python Tools

- Import: `from ibm_watsonx_orchestrate.agent_builder.tools import tool, ToolPermission, WXOFile, MultiFileConstraints`
- Use `@tool` decorator — not a class, not a standalone function.
- Tool function binding is derived **at import time** from `inspect.getsourcefile()` relative to `os.getcwd()`. The tool file must be importable as a module from the working directory; subdirectory paths become dotted module names.
- `Optional[T] = None` params are automatically made non-required in the schema — no manual schema override needed.
- `List[WXOFile]` params without `MultiFileConstraints` get `allowMultipleFiles: true` automatically.
- Join tools (kind=`PythonToolKind.JOIN_TOOL`) must have exactly these first three params in order: `original_query: str`, `task_results: Dict[str, Any]`, `messages: List[Dict[str, Any]]`.

## Writing Agent Specs (YAML)

Required fields: `spec_version`, `kind`, `name`, `description`, `llm`.
- `spec_version: v1` is mandatory — missing it raises `BadRequest` at import, not a validation warning.
- Default `style` when omitted is `react_core` (serialized as `react_intrinsic` to the backend).
- `collaborators` and `tools` accept either string names or inline objects; both are coerced to names at `__init__`.
- An agent cannot list itself as a collaborator — circular reference is validated on construction.

## MCP Tools

Prefer the `mcp__watsonx-orchestrate-adk_cd47__*` tools for all CRUD operations over shelling out to `orchestrate` CLI. They operate against the currently authenticated environment.
