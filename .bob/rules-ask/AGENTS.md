# AGENTS.md — Ask Mode

This file provides guidance to agents when working with code in this repository.

## What this workspace is

A **watsonx Orchestrate configuration workspace** — no application source code exists here. The `venv/` tree contains the installed `ibm-watsonx-orchestrate` SDK (read-only reference); actual workspace artifacts live in `agents/`, `tools/`, `toolkits/`, `connections/`, `knowledge-bases/`, `models/` (all currently empty).

## SDK Reference Location

The installed SDK source is at `venv/Lib/site-packages/ibm_watsonx_orchestrate/`. Key modules for answering questions:
- Tool authoring API: `agent_builder/tools/python_tool.py` and `agent_builder/tools/types.py`
- Agent types and validation: `agent_builder/agents/types.py`
- CLI command tree: `cli/main.py`

## Non-obvious Terminology

- "toolkit" = an MCP server or Python package deployed to Orchestrate (not a collection of tools in the generic sense).
- "kind" on an agent = `native` | `external` | `assistant` (not a free-form string).
- `spec_version` is a required field on every spec, not optional metadata.
