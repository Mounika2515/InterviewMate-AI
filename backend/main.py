import io
import json
import os
import re
import uuid

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv(override=True)

app = FastAPI(title="InterviewMate AI Backend - Stage 2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://interview-mate-ai-zeta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("ORCHESTRATE_IAM_APIKEY")
WXO_URL = os.getenv("ORCHESTRATE_URL", "").rstrip("/")

ORCHESTRATOR_URL = (
    f"{WXO_URL}/v1/orchestrate/A2A/agents/"
    "c2b2e180-01f1-4d8b-88b9-d4a9e88259d8"
    "/environment/a92cd1b3-4fe2-4196-9d5f-fc5fcf4d165f"
)

RESUME_ANALYZER_URL = (
    f"{WXO_URL}/v1/orchestrate/A2A/agents/"
    "ba5610ce-7fc8-4592-ac7b-94b34c1be56c"
    "/environment/50da4f29-df0f-4b14-bc18-ee1f29599b15"
)

QUESTION_GENERATOR_URL = (
    f"{WXO_URL}/v1/orchestrate/A2A/agents/"
    "e98550d5-cb04-436a-8f41-1a5350adf8d0"
    "/environment/7464d5c8-daf9-412d-a5e4-140fbe019cf7"
)

MOCK_INTERVIEWER_URL = (
    f"{WXO_URL}/v1/orchestrate/A2A/agents/"
    "f305965e-787d-425f-8a55-4586ff95e195"
    "/environment/f475d3e0-0026-4791-9f54-75d6a34c789d"
)

EVALUATION_URL = (
    f"{WXO_URL}/v1/orchestrate/A2A/agents/"
    "d1fc607a-834b-4ab9-b534-2ac65159e855"
    "/environment/8ffeade6-0ee1-49a0-8e95-46f3406ed3ad"
)


class ChatRequest(BaseModel):
    message: str


class QuestionGenerationRequest(BaseModel):
    setup: dict
    candidate: dict


class OrchestratedStartRequest(BaseModel):
    setup: dict
    candidate: dict
    resume_text: str = ""


class MockInterviewRequest(BaseModel):
    action: str
    context_id: str | None = None
    setup: dict
    candidate: dict
    planned_questions: list = []
    current_question: int = 0
    answer: str = ""


class EvaluationRequest(BaseModel):
    setup: dict
    candidate: dict
    transcript: list


class QuestionBankChatRequest(BaseModel):
    message: str
    candidate: dict = {}
    context_id: str | None = None


@app.get("/")
def root():
    return {"message": "InterviewMate AI Backend - Stage 2", "status": "ok"}


_iam_token = None
_iam_token_expires_at = 0.0


def get_iam_token():
    global _iam_token, _iam_token_expires_at

    # Reuse the IAM token for several requests instead of requesting a new
    # token every time the frontend calls an agent.
    now = __import__("time").time()
    if _iam_token and now < _iam_token_expires_at - 60:
        return _iam_token

    if not API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ORCHESTRATE_IAM_APIKEY is not configured",
        )

    response = httpx.post(
        "https://iam.cloud.ibm.com/identity/token",
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": API_KEY,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    response.raise_for_status()

    payload = response.json()
    _iam_token = payload["access_token"]
    _iam_token_expires_at = now + int(payload.get("expires_in", 3600))
    return _iam_token


def a2a_message(url: str, text: str, context_id: str | None = None, timeout: float = 60):
    token = get_iam_token()

    message = {
        "messageId": str(uuid.uuid4()),
        "role": "user",
        "parts": [{"kind": "text", "text": text}],
    }

    # A2A 0.3 messages can carry the conversation context so subsequent
    # turns remain in the same agent task/conversation.
    if context_id:
        message["contextId"] = context_id

    payload = {
        "jsonrpc": "2.0",
        "id": str(uuid.uuid4()),
        "method": "message/send",
        "params": {"message": message},
    }

    response = httpx.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        json=payload,
        timeout=timeout,
    )
    response.raise_for_status()
    return response.json()


def extract_agent_text(data: dict) -> str:
    result = data.get("result", {})

    # Format 1: result.parts directly (WXO short-response format)
    for part in result.get("parts", []):
        if part.get("kind") == "text":
            text = part.get("text", "").strip()
            if text:
                return text

    # Format 2: result.history (conversation history format)
    for message in reversed(result.get("history", [])):
        if message.get("role") != "agent":
            continue
        for part in message.get("parts", []):
            if part.get("kind") == "text":
                text = part.get("text", "").strip()
                if text:
                    return text

    # Format 3: result.artifacts
    for artifact in result.get("artifacts", []):
        for part in artifact.get("parts", []):
            if part.get("kind") == "text":
                text = part.get("text", "").strip()
                if text:
                    return text

    return ""


def extract_json(text: str):
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.I)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Find the largest likely JSON object/array in the response.
    candidates = []
    for opening, closing in [("[", "]"), ("{", "}")]:
        start = cleaned.find(opening)
        end = cleaned.rfind(closing)
        if start != -1 and end > start:
            candidates.append(cleaned[start : end + 1])

    for candidate in candidates:
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            continue

    return None


def normalize_evaluations(parsed, transcript):
    if isinstance(parsed, dict):
        items = parsed.get("evaluations") or parsed.get("results") or parsed.get("questions")
    else:
        items = parsed

    if not isinstance(items, list):
        raise ValueError("Evaluation Agent did not return a JSON evaluation list")

    normalized = []
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            continue

        source = transcript[index] if index < len(transcript) else {}

        def score(*keys):
            for key in keys:
                value = item.get(key)
                if value is not None:
                    try:
                        return max(0, min(10, float(value)))
                    except (TypeError, ValueError):
                        pass
            return 0

        technical = score("technical", "technical_accuracy", "Technical Accuracy")
        relevance = score("relevance", "Relevance")
        completeness = score("completeness", "Completeness")
        clarity = score("clarity", "clarity_communication", "Clarity & Communication", "Clarity")
        depth = score("depth", "depth_of_understanding", "Depth of Understanding")
        overall = score("overall", "Overall")

        if not overall:
            overall = round((technical + relevance + completeness + clarity + depth) / 5, 1)

        strengths = item.get("strengths") or item.get("what_did_well") or []
        improvements = item.get("improvements") or item.get("what_to_improve") or []
        improved = item.get("improved") or item.get("suggested_improved_answer") or ""

        if isinstance(strengths, str):
            strengths = [strengths]
        if isinstance(improvements, str):
            improvements = [improvements]

        normalized.append(
            {
                "question": {
                    "id": f"eval-{index}",
                    "category": source.get("category", "AI Interview"),
                    "difficulty": source.get("difficulty", "Beginner"),
                    "question": source.get("question", ""),
                },
                "answer": source.get("answer", ""),
                "technical": round(technical, 1),
                "relevance": round(relevance, 1),
                "completeness": round(completeness, 1),
                "clarity": round(clarity, 1),
                "depth": round(depth, 1),
                "overall": round(overall, 1),
                "strengths": strengths,
                "improvements": improvements,
                "improved": improved,
            }
        )

    if not normalized:
        raise ValueError("Evaluation Agent returned no usable evaluations")

    return normalized


@app.post("/api/orchestrated-start")
def orchestrated_start(request: OrchestratedStartRequest):
    """Start the InterviewMate workflow through the Orchestrator.

    The Orchestrator is the website's main AI entry point. It receives the
    interview goal and candidate context, then the backend dispatches the
    specialist A2A agents in the workflow: Resume Analyzer -> Question
    Generator. Mock Interviewer and Evaluation Agent continue the same
    interview session through their dedicated endpoints.
    """
    setup = request.setup or {}
    candidate = request.candidate or {}
    count = max(1, min(20, int(setup.get("questionCount", 5))))

    try:
        # 1) Orchestrator receives the complete workflow request first.
        orchestration_prompt = f"""
You are the InterviewMate Orchestrator. Coordinate an interview-training
workflow for the candidate below.

Role: {setup.get('role', 'AI/ML Engineer')}
Experience: {setup.get('experience', 'Beginner')}
Focus: {setup.get('focus', 'Mixed')}
Questions requested: {count}

Candidate context:
{json.dumps(candidate, indent=2)}

Workflow specialists that must be used:
1. Resume Analyzer - establish the candidate profile from the supplied resume/context.
2. Question Generator - create personalized questions.
3. Mock Interviewer - conduct the interview one question at a time.
4. Evaluation Agent - evaluate the completed transcript.

Return a concise orchestration acknowledgement only. Do not generate the
interview questions yourself.
""".strip()
        orch = a2a_message(ORCHESTRATOR_URL, orchestration_prompt, timeout=60)
        orch_text = extract_agent_text(orch)

        # 2) Resume Analyzer establishes/validates the candidate profile.
        resume_source = request.resume_text.strip() or json.dumps(candidate, indent=2)
        resume_prompt = f"""
Analyze the following candidate resume/context for InterviewMate AI.
Extract only explicitly available information: name, education, skills,
technologies, projects, experience, certifications and achievements.
Do not infer missing facts.

Resume/context:
{resume_source}
""".strip()
        resume_data = a2a_message(RESUME_ANALYZER_URL, resume_prompt, timeout=60)
        resume_text = extract_agent_text(resume_data)

        # 3) Question Generator creates the planned question set.
        q_prompt = f"""
Generate exactly {count} interview questions for InterviewMate AI.
Target role: {setup.get('role', 'AI/ML Engineer')}
Experience: {setup.get('experience', 'Beginner')}
Interview focus: {setup.get('focus', 'Mixed')}

Candidate profile:
{json.dumps(candidate, indent=2)}

Resume Analyzer output:
{resume_text}

Rules:
- Personalize using only the supplied profile and analyzer output.
- Match role, experience and focus.
- For Mixed focus, include technical, project and HR/behavioral coverage.
- Return exactly {count} questions, one per line, numbered 1 through {count}.
- Do not include answers or explanations.
""".strip()
        q_data = a2a_message(QUESTION_GENERATOR_URL, q_prompt, timeout=60)
        q_text = extract_agent_text(q_data)

        return {
            "success": True,
            "response": q_text,
            "orchestrator": {
                "success": True,
                "response": orch_text,
                "context_id": orch.get("result", {}).get("contextId"),
            },
            "resume_analyzer": {
                "success": True,
                "response": resume_text,
                "context_id": resume_data.get("result", {}).get("contextId"),
            },
            "question_generator": {
                "success": True,
                "response": q_text,
                "context_id": q_data.get("result", {}).get("contextId"),
            },
        }
    except httpx.HTTPStatusError as e:
        return {"success": False, "error": f"watsonx Orchestrate returned HTTP {e.response.status_code}", "details": e.response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/generate-questions")
def generate_questions(request: QuestionGenerationRequest):
    """Generate questions using the dedicated Question Generator Agent.

    This is intentionally separate from /api/chat so the question-generation
    path does not make an unnecessary Orchestrator -> specialist hop.
    """
    setup = request.setup or {}
    candidate = request.candidate or {}
    count = max(1, min(20, int(setup.get("questionCount", 5))))

    prompt = f"""
You are the Question Generator Agent for InterviewMate AI.

Generate exactly {count} interview questions.

Target role: {setup.get('role', 'AI/ML Engineer')}
Experience level: {setup.get('experience', 'Beginner')}
Interview focus: {setup.get('focus', 'Mixed')}

Candidate profile:
{json.dumps(candidate, indent=2)}

Rules:
- Personalize questions using only the supplied candidate profile.
- Match the requested role, experience level, and focus.
- For Mixed focus, include a useful mix of technical, project, and HR/behavioral questions.
- Keep questions suitable for the selected experience level.
- Do not provide answers, explanations, or feedback.
- Return exactly {count} questions.
- Put one question on each line.
- Number them 1 through {count}.
""".strip()

    try:
        data = a2a_message(QUESTION_GENERATOR_URL, prompt, timeout=60)
        text = extract_agent_text(data)

        if not text:
            raise ValueError("Question Generator Agent returned an empty response")

        return {
            "success": True,
            "response": text,
            "state": data.get("result", {}).get("status", {}).get("state"),
            "context_id": data.get("result", {}).get("contextId"),
        }
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": f"Question Generator returned HTTP {e.response.status_code}",
            "details": e.response.text,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/question-bank-chat")
def question_bank_chat(request: QuestionBankChatRequest):
    """Chat with the IBM watsonx Orchestrate Question Generator Agent (with RAG knowledge base)
    to generate custom interview questions on-demand based on user queries.
    """
    user_query = request.message.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    candidate = request.candidate or {}
    candidate_summary = ""
    if candidate:
        name = candidate.get("name", "")
        skills = ", ".join(candidate.get("skills", [])) if isinstance(candidate.get("skills"), list) else candidate.get("skills", "")
        role = candidate.get("role", "")
        if name or skills or role:
            candidate_summary = f"\nCandidate Profile Context: Name={name}, Role={role}, Skills={skills}"

    prompt = f"""
You are the Question Generator Agent for InterviewMate AI, powered by IBM watsonx Orchestrate with access to the RAG knowledge base.
You are interacting directly with the candidate in the Question Bank Chatbot.

User request:
{user_query}{candidate_summary}

Instructions:
- Provide high-quality, relevant interview questions matching the requested topic, technology (e.g. Python, SQL, ML, DSA, etc.), count, and difficulty (Beginner, Intermediate, Advanced).
- Use the RAG knowledge base to ensure technical accuracy and real-world relevance.
- Format questions clearly with numbers or bullet points.
- If requested, provide sample answers, explanations, or practical interview tips.
- Keep the tone professional, encouraging, and clear.
""".strip()

    try:
        data = a2a_message(QUESTION_GENERATOR_URL, prompt, request.context_id, timeout=60)
        text = extract_agent_text(data)

        if not text:
            raise ValueError("Question Generator Agent returned an empty response")

        return {
            "success": True,
            "response": text,
            "state": data.get("result", {}).get("status", {}).get("state"),
            "context_id": data.get("result", {}).get("contextId") or request.context_id,
        }
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": f"Question Generator Agent returned HTTP {e.response.status_code}",
            "details": e.response.text,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        data = a2a_message(ORCHESTRATOR_URL, request.message)
        return {
            "success": True,
            "response": extract_agent_text(data),
            "state": data.get("result", {}).get("status", {}).get("state"),
            "context_id": data.get("result", {}).get("contextId"),
        }
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": f"watsonx Orchestrate returned HTTP {e.response.status_code}",
            "details": e.response.text,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/mock-interview")
def mock_interview(request: MockInterviewRequest):
    try:
        setup = request.setup
        candidate = request.candidate
        planned = [q.get("question", q) if isinstance(q, dict) else q for q in request.planned_questions]

        if request.action == "start":
            prompt = f"""
You are the Mock Interviewer Agent for InterviewMate AI.

Start a realistic mock interview for this candidate.

Role: {setup.get('role', 'AI/ML Engineer')}
Experience: {setup.get('experience', 'Beginner')}
Focus: {setup.get('focus', 'Mixed')}
Requested questions: {setup.get('questionCount', len(planned) or 5)}

Candidate profile:
{json.dumps(candidate, indent=2)}

Planned question areas:
{json.dumps(planned, indent=2)}

Rules:
- Ask exactly ONE interview question now.
- Use the candidate profile and role to personalize it.
- Do not give the answer.
- Do not add an explanation before or after the question.
- Return only the question text.
""".strip()
        else:
            prompt = f"""
The candidate just answered your previous interview question.

Candidate answer:
{request.answer}

This is interview question number {request.current_question + 1}.

Continue the mock interview.
- Ask exactly ONE next question.
- You may ask a concise follow-up when the previous answer needs clarification.
- Otherwise move to the next planned area.
- Keep the question appropriate for the role and experience level.
- Do not evaluate the answer yet.
- Do not give the candidate the answer.
- Return only the next question text.
""".strip()

        data = a2a_message(MOCK_INTERVIEWER_URL, prompt, request.context_id)
        text = extract_agent_text(data)
        context_id = data.get("result", {}).get("contextId") or request.context_id

        return {
            "success": True,
            "question": text,
            "context_id": context_id,
            "state": data.get("result", {}).get("status", {}).get("state"),
        }
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": f"Mock Interviewer returned HTTP {e.response.status_code}",
            "details": e.response.text,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/evaluate")
def evaluate(request: EvaluationRequest):
    try:
        prompt = f"""
You are the Evaluation Agent for InterviewMate AI.

Evaluate every question-answer pair below. Return ONLY valid JSON.

Candidate:
{json.dumps(request.candidate, indent=2)}

Interview setup:
{json.dumps(request.setup, indent=2)}

Transcript:
{json.dumps(request.transcript, indent=2)}

For each transcript item return an object with exactly these fields:
- technical (0-10)
- relevance (0-10)
- completeness (0-10)
- clarity (0-10)
- depth (0-10)
- overall (0-10)
- strengths (array of specific strings)
- improvements (array of specific strings)
- improved (a personalized improved answer, based on the actual question and candidate answer)

Important:
- Evaluate the actual answer, not answer length alone.
- Do not use generic feedback that could apply to every question.
- Mention specific missing concepts or strengths from the candidate's answer.
- If the candidate answer is correct, say what was correct.
- The improved answer must answer the actual question.
- Do not invent candidate experience that is not in the profile or answer.

JSON format:
{{"evaluations": [{{"technical": 0, "relevance": 0, "completeness": 0, "clarity": 0, "depth": 0, "overall": 0, "strengths": [], "improvements": [], "improved": ""}}]}}
""".strip()

        data = a2a_message(EVALUATION_URL, prompt)
        text = extract_agent_text(data)
        parsed = extract_json(text)
        if parsed is None:
            raise ValueError("Could not parse Evaluation Agent JSON response")

        evaluations = normalize_evaluations(parsed, request.transcript)
        return {"success": True, "evaluations": evaluations, "raw_response": text}
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": f"Evaluation Agent returned HTTP {e.response.status_code}",
            "details": e.response.text,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def _extract_text_from_file(contents: bytes, filename: str) -> str:
    """Extract plain text from PDF, DOCX, or TXT bytes."""
    if filename.endswith(".pdf"):
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(contents))
        return "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    elif filename.endswith(".docx"):
        import docx
        doc = docx.Document(io.BytesIO(contents))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()
    else:
        return contents.decode("utf-8", errors="ignore").strip()


def _quick_parse_resume(text: str) -> dict:
    """Cheaply extract a rough profile from raw resume text without calling IBM."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # Heuristic: first non-empty line is likely the name
    name = lines[0] if lines else ""

    skills_keywords = ["python","java","sql","machine learning","deep learning","pandas",
                       "numpy","scikit","tensorflow","pytorch","flask","django","react",
                       "javascript","html","css","git","docker","aws","azure","nlp","data"]
    skills = list({w.title() for w in skills_keywords if w in text.lower()})

    tech_keywords = ["python","pandas","numpy","scikit-learn","tensorflow","pytorch",
                     "flask","django","fastapi","react","node","mysql","postgresql",
                     "mongodb","docker","git","aws","azure","gcp"]
    technologies = list({w for w in tech_keywords if w.lower() in text.lower()})

    # Look for education hints
    edu = ""
    for line in lines:
        if any(k in line.lower() for k in ["b.tech","m.tech","bachelor","master","b.e","mba","phd","degree","university","college"]):
            edu = line
            break

    # Look for experience hints
    experience = ""
    for line in lines:
        if any(k in line.lower() for k in ["year","fresher","intern","experience","entry"]):
            experience = line
            break

    # Look for project names (lines after "Projects" header)
    projects = []
    in_projects = False
    for line in lines:
        if "project" in line.lower() and len(line) < 30:
            in_projects = True
            continue
        if in_projects:
            if len(line) > 5 and not any(k in line.lower() for k in ["skill","education","certif","work","experience"]):
                projects.append(line)
            else:
                in_projects = False
        if len(projects) >= 5:
            break

    return {
        "name": name,
        "education": edu,
        "skills": skills[:10],
        "technologies": technologies[:10],
        "projects": projects[:5],
        "experience": experience,
        "certifications": [],
        "achievements": [],
    }


@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    """Extract text from uploaded file. Returns quick local parse immediately,
    then the IBM Resume Analyzer Agent result in the same response."""
    try:
        contents = await file.read()
        filename = (file.filename or "").lower()

        try:
            resume_text = _extract_text_from_file(contents, filename)
        except Exception as e:
            return {"success": False, "error": f"Could not read file: {e}"}

        if not resume_text:
            return {"success": False, "error": "Could not extract any text from the uploaded file."}

        # Return quick local parse immediately + call IBM agent
        quick_profile = _quick_parse_resume(resume_text)

        prompt = f"""
Analyze the following candidate resume for InterviewMate AI.
Extract only information explicitly present in the resume.

Resume:
{resume_text}

Return ONLY valid JSON in this exact format with no extra text:
{{"name": "", "education": "", "skills": [], "technologies": [], "projects": [], "experience": "", "certifications": [], "achievements": []}}
""".strip()

        token = get_iam_token()
        payload = {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": "message/send",
            "params": {
                "message": {
                    "messageId": str(uuid.uuid4()),
                    "role": "user",
                    "parts": [{"kind": "text", "text": prompt}],
                }
            },
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    RESUME_ANALYZER_URL,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                )
            response.raise_for_status()
            data = response.json()
            text = extract_agent_text(data)
            parsed = extract_json(text)

            if parsed:
                ibm_profile = {
                    "name": parsed.get("name", "") or quick_profile["name"],
                    "education": parsed.get("education", "") or quick_profile["education"],
                    "skills": parsed.get("skills", []) or quick_profile["skills"],
                    "technologies": parsed.get("technologies", []) or quick_profile["technologies"],
                    "projects": parsed.get("projects", []) or quick_profile["projects"],
                    "experience": parsed.get("experience", "") or quick_profile["experience"],
                    "certifications": parsed.get("certifications", []),
                    "achievements": parsed.get("achievements", []),
                }
                return {"success": True, "profile": ibm_profile, "source": "ibm"}
        except Exception:
            pass  # Fall through to return quick profile

        return {"success": True, "profile": quick_profile, "source": "local"}

    except httpx.HTTPStatusError as e:
        return {"success": False, "error": f"Resume Analyzer returned HTTP {e.response.status_code}"}
    except Exception as e:
        return {"success": False, "error": str(e)}
