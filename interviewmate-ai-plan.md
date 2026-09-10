# InterviewMate AI — Implementation Plan

## Status Legend
- `[ ] pending` — not started
- `[-] in-progress` — currently being worked on
- `[x] done` — complete

---

## Top-Level Goal

Build an agentic, RAG-powered personalized interview training platform on IBM watsonx Orchestrate using IBM Granite models. The system accepts a user's resume and target role, then conducts a full mock interview cycle: profile extraction → question generation → live mock interview → scored evaluation with feedback.

**Constraints:**
- IBM Cloud Trial/Lite resources only (free tier where possible)
- No unnecessary third-party services
- IBM watsonx Orchestrate as the agent orchestration layer
- IBM Granite as the LLM
- RAG knowledge base via watsonx Orchestrate's built-in knowledge base feature
- Simple React frontend (or watsonx Orchestrate webchat embed) for MVP
- No application code until architecture is approved

---

## Sub-Tasks

### Sub-Task 1 — Knowledge Base Population [ ] pending

**Intent:** Create and populate the RAG knowledge base inside watsonx Orchestrate with role-specific interview content. This is the foundation everything else depends on.

**Expected Outcomes:**
- A knowledge base named `interview-kb` exists and is indexed in WXO
- Contains documents for: Python, ML, SQL, DSA, AI/ML, HR, Behavioral, Interview Prep, Role Expectations
- Status shows "ready" in WXO

**Todo List:**
1. Author source documents (Markdown/PDF) for each topic area
2. Structure documents with clear headings for RAG chunking quality
3. Create knowledge base spec file at `knowledge-bases/interview-kb.yaml`
4. Import knowledge base via MCP tool
5. Verify status is indexed and ready

**Relevant Context:**
- Knowledge base spec: `venv/Lib/site-packages/ibm_watsonx_orchestrate/agent_builder/knowledge_bases/`
- MCP tool: `mcp__watsonx-orchestrate-adk_cd47__import_knowledge_bases`
- Source docs go in: `knowledge-bases/docs/`

---

### Sub-Task 2 — Resume Analyzer Agent [ ] pending

**Intent:** Build the first agent in the pipeline. Accepts a resume file (PDF/text), extracts structured information, and produces a candidate profile JSON.

**Expected Outcomes:**
- A native WXO agent named `resume-analyzer` exists
- Can accept a file upload (PDF or text)
- Outputs structured JSON: `{ name, skills[], education[], experience[], projects[], technologies[] }`
- Testable via `chat_with_agent` MCP tool

**Todo List:**
1. Write the resume parser Python tool at `tools/resume_parser.py` using `@tool` decorator
2. Write tool spec file at `tools/resume-parser-tool.yaml`
3. Import tool into WXO
4. Write agent spec at `agents/resume-analyzer.yaml` with correct instructions
5. Import agent into WXO
6. Test with a sample resume via `chat_with_agent`

**Relevant Context:**
- `AgentStyle.REACT_CORE` is the default and recommended style
- File upload uses `WXOFile` param type in `@tool` decorator
- `spec_version: v1` is mandatory on agent YAML

---

### Sub-Task 3 — Interview Question Generator Agent [ ] pending

**Intent:** Takes a candidate profile + target role + experience level, queries the RAG knowledge base, and uses IBM Granite to generate a personalized question set (technical + behavioral + HR).

**Expected Outcomes:**
- A native WXO agent named `question-generator` exists
- Connected to `interview-kb` knowledge base
- Generates 5–10 questions per category (technical, behavioral, HR)
- Output is a structured question list with metadata (category, difficulty, topic)

**Todo List:**
1. Write question generation Python tool at `tools/question_generator.py`
2. Import tool into WXO
3. Write agent spec at `agents/question-generator.yaml` referencing `interview-kb`
4. Configure IBM Granite model in agent spec
5. Import agent into WXO
6. Test end-to-end with a sample candidate profile

**Relevant Context:**
- Knowledge base linked via `knowledge_base: [interview-kb]` in agent spec
- IBM Granite model name to be confirmed after environment activation
- RAG retrieval is handled natively by WXO when KB is attached to agent

---

### Sub-Task 4 — Mock Interview Agent [ ] pending

**Intent:** Conducts an interactive, turn-by-turn mock interview. Asks one question at a time, receives answers, and adapts follow-up questions based on responses.

**Expected Outcomes:**
- A native WXO agent named `mock-interviewer` exists
- Maintains conversation context across turns
- Asks questions from the generated question set one at a time
- Records all Q&A pairs for the Evaluation Agent

**Todo List:**
1. Write interview session management Python tool at `tools/interview_session.py`
2. Import tool into WXO
3. Write agent spec at `agents/mock-interviewer.yaml` with multi-turn conversation instructions
4. Import agent into WXO
5. Test a full mock interview session via `chat_with_agent`

**Relevant Context:**
- Turn-by-turn conversation is native to WXO agent chat
- Session state (current question index, Q&A history) stored in tool or context variables
- `context_variables` on AgentSpec can carry state across turns

---

### Sub-Task 5 — Evaluation Agent [ ] pending

**Intent:** Evaluates all answers from the mock interview session. Scores on technical accuracy, relevance, and communication. Identifies strengths/weaknesses and generates a final report.

**Expected Outcomes:**
- A native WXO agent named `evaluator` exists
- Produces a structured evaluation report: `{ scores: {technical, relevance, communication}, overall_score, strengths[], weaknesses[], suggestions[], summary }`
- Report is human-readable and actionable

**Todo List:**
1. Write evaluation Python tool at `tools/evaluator.py`
2. Import tool into WXO
3. Write agent spec at `agents/evaluator.yaml` connected to `interview-kb` for reference answers
4. Import agent into WXO
5. Test with a sample Q&A transcript

**Relevant Context:**
- IBM Granite used for LLM-based scoring and feedback generation
- Knowledge base provides reference answers for accuracy scoring

---

### Sub-Task 6 — Orchestrator Agent (Main Coordinator) [ ] pending

**Intent:** A top-level orchestrator agent that coordinates the full workflow: Resume Analyzer → Question Generator → Mock Interviewer → Evaluator. This is the single entry point for users.

**Expected Outcomes:**
- A native WXO agent named `interviewmate-orchestrator` exists
- Has all four sub-agents as collaborators
- Routes the user through the full pipeline automatically
- Accessible via webchat embed

**Todo List:**
1. Write orchestrator agent spec at `agents/interviewmate-orchestrator.yaml`
2. List all four agents as `collaborators`
3. Write clear routing instructions
4. Import agent into WXO
5. Generate webchat embed code
6. Test full end-to-end pipeline

**Relevant Context:**
- Collaborators listed by name string in `collaborators:` field
- `AgentStyle.REACT_CORE` with clear instructions is preferred over PLANNER for student resource limits
- Webchat embed via `mcp__watsonx-orchestrate-adk_cd47__generate_webchat_embed`

---

### Sub-Task 7 — Frontend (Optional Thin UI) [ ] pending

**Intent:** A minimal web page that embeds the WXO webchat widget or provides a simple form-based UI. Kept minimal to stay within student project scope.

**Expected Outcomes:**
- Single HTML page or simple React app
- Embeds WXO webchat widget OR provides form inputs for resume + role selection
- Deployable to IBM Cloud Static Hosting or GitHub Pages

**Todo List:**
1. Generate webchat embed code from WXO
2. Create `frontend/index.html` wrapping the embed
3. Add role selector and experience level dropdowns
4. (Optional) Deploy to IBM Cloud Object Storage static hosting

**Relevant Context:**
- WXO webchat is the lowest-effort UI path
- Custom React UI only if webchat UX is insufficient

---

## Context for Implementation

**Environment setup required before any sub-task:**
```bash
# Activate Python venv
.\venv\Scripts\activate

# Authenticate to WXO
orchestrate env add --name dev --url <WXO_URL>
orchestrate login --env dev
```

**Model to use:** IBM Granite — exact model name confirmed after `orchestrate models list`

**Key file locations:**
- Agent specs: `agents/*.yaml`
- Tool Python files: `tools/*.py`
- Knowledge base specs: `knowledge-bases/*.yaml`
- Knowledge base source docs: `knowledge-bases/docs/*.md`
- Toolkit specs: `toolkits/*.yaml`
- Connection specs: `connections/*.yaml`

**spec_version: v1 is MANDATORY on every spec file.**
