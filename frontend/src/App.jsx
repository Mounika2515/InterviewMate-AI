import { useEffect, useState, useRef } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
/* =========================================================
   DEMO DATA
========================================================= */

const demoProfile = {
  name: "Mounika",
  education: "B.Tech – Computer Science & Engineering (AI & ML)",
  skills: ["Python", "Machine Learning", "SQL", "AI/ML"],
  technologies: ["Python", "Pandas", "Scikit-learn", "Flask"],
  projects: ["Iris Classification", "Titanic Survival Prediction"],
  experience: "Beginner",
  certifications: ["AI & ML Fundamentals", "Data Science with Python"],
  achievements: [],
};

const interviewQuestions = [
  {
    id: 1,
    category: "Machine Learning",
    difficulty: "Beginner",
    question:
      "What is machine learning, and how is it different from traditional programming?",
  },
  {
    id: 2,
    category: "Python",
    difficulty: "Beginner",
    question:
      "How would you load a CSV file using Python and handle missing values?",
  },
  {
    id: 3,
    category: "Machine Learning",
    difficulty: "Beginner",
    question:
      "What is the difference between supervised and unsupervised learning?",
  },
  {
    id: 4,
    category: "Machine Learning",
    difficulty: "Beginner",
    question:
      "What is the purpose of splitting a dataset into training and testing data?",
  },
  {
    id: 5,
    category: "Python",
    difficulty: "Beginner",
    question:
      "What are the differences between a Python list, tuple, set, and dictionary?",
  },
  {
    id: 6,
    category: "SQL",
    difficulty: "Beginner",
    question:
      "What is the difference between WHERE and HAVING in SQL?",
  },
  {
    id: 7,
    category: "SQL",
    difficulty: "Beginner",
    question:
      "What is a primary key and why is it important in a database?",
  },
  {
    id: 8,
    category: "DSA",
    difficulty: "Beginner",
    question:
      "Explain the working of Bubble Sort and its time complexity.",
  },
  {
    id: 9,
    category: "DSA",
    difficulty: "Intermediate",
    question:
      "What is the difference between an array and a linked list?",
  },
  {
    id: 10,
    category: "AI/ML",
    difficulty: "Beginner",
    question:
      "What is the difference between Artificial Intelligence, Machine Learning, and Deep Learning?",
  },
  {
    id: 11,
    category: "AI/ML",
    difficulty: "Intermediate",
    question:
      "What is overfitting in machine learning and how can it be reduced?",
  },
  {
    id: 12,
    category: "Machine Learning",
    difficulty: "Beginner",
    question:
      "What is feature scaling and why is it useful?",
  },
  {
    id: 13,
    category: "Projects",
    difficulty: "Beginner",
    question:
      "Explain the workflow you followed in your Titanic survival prediction project.",
  },
  {
    id: 14,
    category: "Projects",
    difficulty: "Beginner",
    question:
      "What challenges did you face while working on one of your machine learning projects?",
  },
  {
    id: 15,
    category: "HR",
    difficulty: "Beginner",
    question:
      "Tell me about yourself and your interest in AI and Machine Learning.",
  },
  {
    id: 16,
    category: "HR",
    difficulty: "Beginner",
    question:
      "Why do you want to work as an AI/ML Engineer?",
  },
  {
    id: 17,
    category: "Behavioral",
    difficulty: "Beginner",
    question:
      "Tell me about a time when you faced a difficult problem and how you solved it.",
  },
  {
    id: 18,
    category: "Behavioral",
    difficulty: "Beginner",
    question:
      "How do you handle learning a new technology or concept?",
  },
  {
    id: 19,
    category: "Python",
    difficulty: "Intermediate",
    question:
      "How would you remove duplicate values from a Python list?",
  },
  {
    id: 20,
    category: "Machine Learning",
    difficulty: "Intermediate",
    question:
      "What is a confusion matrix and what information does it provide?",
  },
];

/* =========================================================
   IBM WATSONX ORCHESTRATE API HELPERS
========================================================= */


function getQuestionCategory(question, focus) {
  const text = question.toLowerCase();

  if (focus && focus !== "Mixed" && focus !== "Technical" && focus !== "HR & Behavioral") {
    return focus;
  }

  if (text.includes("python")) return "Python";
  if (text.includes("sql") || text.includes("database") || text.includes("query")) return "SQL";
  if (text.includes("data structure") || text.includes("algorithm") || text.includes("complexity")) return "DSA";
  if (text.includes("project") || text.includes("resume") || text.includes("experience")) return "Projects";
  if (text.includes("tell me about yourself") || text.includes("why do you want") || text.includes("strength") || text.includes("weakness")) return "HR";
  if (text.includes("team") || text.includes("challenge") || text.includes("conflict")) return "Behavioral";
  if (text.includes("artificial intelligence") || text.includes("deep learning") || text.includes("machine learning") || text.includes("model")) return "Machine Learning";

  return focus === "HR & Behavioral" ? "Behavioral" : "AI/ML";
}

function extractAIQuestions(responseText, count, focus, experience) {
  const text = String(responseText || "").trim();

  // Prefer numbered/bulleted lines from the Orchestrator response.
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let extracted = lines
    .map((line) =>
      line.replace(/^\s*(?:question\s*)?(?:\d+\s*[.)\-:]|[-*•])\s*/i, "").trim()
    )
    .filter((line) => line.length >= 15)
    .filter((line) => !/^(here are|questions?:|interview questions?:|sure[,!]?|okay[,!]?)/i.test(line));

  // If the agent returned one paragraph, try sentence-level extraction.
  if (extracted.length < count) {
    const sentences = text
      .split(/(?<=[?])\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 15 && item.includes("?"));

    extracted = [...extracted, ...sentences];
  }

  const unique = [];
  const seen = new Set();

  for (const question of extracted) {
    const cleaned = question
      .replace(/^[-*•]\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned || seen.has(cleaned.toLowerCase())) continue;
    seen.add(cleaned.toLowerCase());
    unique.push(cleaned);

    if (unique.length === count) break;
  }

  return unique.map((question, index) => ({
    id: `ai-${Date.now()}-${index}`,
    category: getQuestionCategory(question, focus),
    difficulty: experience || "Beginner",
    question,
    source: "IBM watsonx Orchestrate",
  }));
}

async function generateInterviewQuestions(setup, candidate) {
  const profile = candidate;
  const count = Number(setup.questionCount || 5);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/orchestrated-start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        setup,
        candidate: profile,
        resume_text: JSON.stringify(profile),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Unable to start the InterviewMate Orchestrator workflow."
      );
    }

    const questions = extractAIQuestions(
      data.response,
      count,
      setup.focus,
      setup.experience
    );

    if (questions.length === 0) {
      throw new Error(
        "IBM Question Generator responded, but no interview questions could be extracted."
      );
    }

    return questions;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("IBM Orchestrator workflow timed out. Keeping the built-in question bank.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function startMockInterviewWithAI(setup, plannedQuestions, candidate) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/mock-interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        action: "start",
        context_id: null,
        setup,
        candidate: candidate,
        planned_questions: plannedQuestions,
        answer: "",
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Unable to start the IBM Mock Interviewer.");
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("IBM Mock Interviewer timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendMockAnswerToAI({ contextId, setup, candidate, plannedQuestions, currentQuestion, answer }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/mock-interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        action: "answer",
        context_id: contextId,
        setup,
        candidate,
        planned_questions: plannedQuestions,
        current_question: currentQuestion,
        answer,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Unable to continue the IBM Mock Interviewer.");
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("IBM Mock Interviewer timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function evaluateInterviewWithAI({ setup, candidate, transcript }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ setup, candidate, transcript }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Unable to evaluate the interview with IBM.");
    }
    return data.evaluations || [];
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("IBM Evaluation Agent timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function askQuestionBankAI({ message, candidate, contextId }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/question-bank-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        candidate: candidate || {},
        context_id: contextId || null,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Unable to retrieve questions from IBM Question Generator.");
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out while waiting for IBM watsonx Orchestrate.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =========================================================
   RESUME PAGE
========================================================= */

function ProfileItem({ label, value }) {
  return (
    <div className="profile-item">
      <span className="profile-label">{label}</span>
      <span className="profile-value">
        {value || "Not available"}
      </span>
    </div>
  );
}

function ProfileTags({ items }) {
  if (!items || items.length === 0) {
    return (
      <span className="profile-value">
        Not available
      </span>
    );
  }

  return (
    <div className="profile-tags">
      {items.map((item, index) => (
        <span className="profile-tag" key={index}>
          {item}
        </span>
      ))}
    </div>
  );
}

function ProfileList({ title, items }) {
  return (
    <div className="resume-section">
      <h3>{title}</h3>

      {items && items.length > 0 ? (
        <ul className="resume-list">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted-text">
          No information available.
        </p>
      )}
    </div>
  );
}

function ResumePage({ profile, onProfileChange }) {
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [analyzeSource, setAnalyzeSource] = useState("");

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setAnalyzeError("");
    setAnalyzeSource("");
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/analyze-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAnalyzeError(data.error || "Resume analysis failed.");
        return;
      }

      if (data.profile) {
        onProfileChange(data.profile);
        setAnalyzeSource(data.source || "");
      } else {
        setAnalyzeError("Could not extract structured profile.");
      }
    } catch (err) {
      setAnalyzeError("Could not connect to backend. Is it running on port 8000?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Candidate Profile
          </p>

          <h1>Resume Analysis</h1>

          <p>
            Upload your resume and create a personalized
            candidate profile.
          </p>
        </div>
      </div>

      <div className="resume-upload-card">
        <div className="upload-icon">↑</div>

        <div>
          <h3>Upload Resume</h3>

          <p>
            PDF resume supported for the prototype.
          </p>

          <label className="primary-button upload-button" style={{ opacity: isAnalyzing ? 0.6 : 1, pointerEvents: isAnalyzing ? "none" : "auto" }}>
            {isAnalyzing ? "Analyzing Resume..." : "Choose Resume"}

            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleResumeUpload}
              hidden
              disabled={isAnalyzing}
            />
          </label>

          {fileName && (
            <p className="upload-file-name">
              Selected: <strong>{fileName}</strong>
            </p>
          )}

          {isAnalyzing && (
            <p className="upload-file-name">
              ✦ Analyzing resume with IBM Agent...
            </p>
          )}

          {!isAnalyzing && analyzeSource === "ibm" && (
            <p className="upload-file-name" style={{ color: "#38a169" }}>
              ✓ Profile extracted by IBM Resume Analyzer Agent
            </p>
          )}

          {!isAnalyzing && analyzeSource === "local" && (
            <p className="upload-file-name" style={{ color: "#d97706" }}>
              ⚠ Extracted locally (IBM Agent unavailable). Profile may be incomplete.
            </p>
          )}

          {analyzeError && (
            <p className="upload-file-name" style={{ color: "#e53e3e" }}>
              ⚠ {analyzeError}
            </p>
          )}
        </div>
      </div>

      <div className="resume-profile-card">
        <div className="resume-profile-header">
          <div className="profile-avatar">
            {profile.name?.charAt(0) || "U"}
          </div>

          <div>
            <p className="page-eyebrow">
              Extracted Profile
            </p>

            <h2>
              {profile.name || "Candidate"}
            </h2>

            <p>{profile.education}</p>
          </div>
        </div>

        <div className="profile-grid">
          <ProfileItem
            label="Experience"
            value={profile.experience}
          />

          <div className="profile-item">
            <span className="profile-label">
              Skills
            </span>

            <ProfileTags items={profile.skills} />
          </div>

          <div className="profile-item">
            <span className="profile-label">
              Technologies
            </span>

            <ProfileTags
              items={profile.technologies}
            />
          </div>

          <ProfileItem
            label="Education"
            value={profile.education}
          />
        </div>

        <ProfileList
          title="Projects"
          items={profile.projects}
        />

        <ProfileList
          title="Certifications"
          items={profile.certifications}
        />

        <ProfileList
          title="Achievements"
          items={profile.achievements}
        />
      </div>
    </div>
  );
}

/* =========================================================
   INTERVIEW SETUP
========================================================= */

function InterviewSetupPage({ navigate, isGenerating }) {
  const [role, setRole] =
    useState("AI/ML Engineer");

  const [experience, setExperience] =
    useState("Beginner");

  const [questionCount, setQuestionCount] =
    useState("5");

  const [customQuestionCount, setCustomQuestionCount] =
    useState("");

  const [focus, setFocus] =
    useState("Mixed");

  const handleQuestionCountSelect = (value) => {
    setQuestionCount(value);
    setCustomQuestionCount("");
  };

  const handleQuestionCountInput = (value) => {
    const trimmed = value.replace(/\D/g, "");
    setCustomQuestionCount(trimmed);
    setQuestionCount(trimmed || "5");
  };

  const startInterview = () => {
    const finalQuestionCount = Math.max(
      1,
      Number(customQuestionCount || questionCount || 5)
    );

    const setup = {
      role,
      experience,
      questionCount: finalQuestionCount,
      focus,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "interviewSetup",
      JSON.stringify(setup)
    );

    navigate("Mock Interview");
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Personalized Practice
          </p>

          <h1>Interview Setup</h1>

          <p>
            Configure your interview before starting the
            practice session.
          </p>
        </div>
      </div>

      <div className="setup-card">
        <div className="setup-grid">
          <div className="form-group">
            <label>Target Role</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option>AI/ML Engineer</option>
              <option>
                Machine Learning Engineer
              </option>
              <option>Data Scientist</option>
              <option>Data Analyst</option>
              <option>Software Developer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Experience Level</label>

            <select
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value)
              }
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label>Number of Questions</label>

            <div className="question-count-row">
              <select
                value={questionCount}
                onChange={(e) =>
                  handleQuestionCountSelect(e.target.value)
                }
              >
                <option value="5">
                  5 Questions
                </option>

                <option value="10">
                  10 Questions
                </option>

                <option value="15">
                  15 Questions
                </option>
              </select>

              <input
                type="number"
                min="1"
                max="50"
                step="1"
                placeholder="Custom"
                value={customQuestionCount}
                onChange={(e) =>
                  handleQuestionCountInput(e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Interview Focus</label>

            <select
              value={focus}
              onChange={(e) =>
                setFocus(e.target.value)
              }
            >
              <option>Mixed</option>
              <option>Technical</option>
              <option>Machine Learning</option>
              <option>Python</option>
              <option>SQL</option>
              <option>DSA</option>
              <option>HR & Behavioral</option>
            </select>
          </div>
        </div>

        <div className="setup-summary">
          <div>
            <span>Role</span>
            <strong>{role}</strong>
          </div>

          <div>
            <span>Level</span>
            <strong>{experience}</strong>
          </div>

          <div>
            <span>Questions</span>
            <strong>{questionCount}</strong>
          </div>

          <div>
            <span>Focus</span>
            <strong>{focus}</strong>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={startInterview}
          disabled={isGenerating}
        >
          {isGenerating
            ? "Generating AI Questions..."
            : "Start Mock Interview →"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   QUESTION BANK AI CHATBOT (IBM WATSONX ORCHESTRATE + RAG)
========================================================= */

function FormattedChatMessage({ content, onPracticeQuestion }) {
  if (!content) return null;

  const lines = content.split(/\r?\n/);

  const renderInline = (text) => {
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let match;
    let lastIndex = 0;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={key++} className="chat-strong">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code key={key++} className="chat-inline-code">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={key++} className="chat-em">
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="chat-formatted-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="chat-line-break" />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="chat-heading-3">
              {renderInline(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="chat-heading-2">
              {renderInline(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="chat-heading-1">
              {renderInline(trimmed.replace(/^#\s+/, ""))}
            </h2>
          );
        }

        const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)/);
        if (numMatch) {
          const rawQuestion = numMatch[2];
          return (
            <div key={idx} className="chat-list-item chat-numbered-item">
              <span className="chat-item-number">{numMatch[1]}</span>
              <div className="chat-item-body">
                <div className="chat-item-text">{renderInline(rawQuestion)}</div>
                {onPracticeQuestion && rawQuestion.length >= 15 && (
                  <button
                    className="chat-practice-mini-btn"
                    title="Practice this question in Mock Interview"
                    onClick={() => onPracticeQuestion(rawQuestion)}
                  >
                    Practice →
                  </button>
                )}
              </div>
            </div>
          );
        }

        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
        if (bulletMatch) {
          return (
            <div key={idx} className="chat-list-item chat-bullet-item">
              <span className="chat-bullet-dot">•</span>
              <div className="chat-item-text">{renderInline(bulletMatch[1])}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="chat-paragraph">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function QuestionBankPage({ navigate, startQuestion, candidate }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("qbChatMessages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return [
      {
        id: "welcome-1",
        sender: "assistant",
        text: "👋 **Welcome to the AI Question Bank!**\n\nI am the **Question Generator Agent**, connected live to **IBM watsonx Orchestrate** and our indexed **RAG Knowledge Base**.\n\nYou can ask for any custom interview questions, concept explanations, or practice drills. Try asking:\n• *\"Give me 5 beginner Python questions on lists\"*\n• *\"Give me 10 intermediate SQL questions\"*\n• *\"Give me ML interview questions\"*",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [contextId, setContextId] = useState(() => localStorage.getItem("qbContextId") || null);
  const [lastPrompt, setLastPrompt] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickPrompts = [
    "Give me 5 beginner Python questions on lists",
    "Give me 10 intermediate SQL questions",
    "Give me ML interview questions",
    "Give me 5 DSA questions on Binary Trees",
    "Give me behavioral questions for AI Engineer",
  ];

  useEffect(() => {
    localStorage.setItem("qbChatMessages", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (promptToSend) => {
    const query = (typeof promptToSend === "string" ? promptToSend : input).trim();
    if (!query || isLoading) return;

    setError("");
    setLastPrompt(query);
    setInput("");

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await askQuestionBankAI({
        message: query,
        candidate: candidate || {},
        contextId: contextId || null,
      });

      if (data.context_id) {
        setContextId(data.context_id);
        localStorage.setItem("qbContextId", data.context_id);
      }

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: data.response || "No response received from agent.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Question Bank Chat error:", err);
      setError(err.message || "Failed to retrieve questions from IBM watsonx Orchestrate.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    const defaultWelcome = [
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: "👋 **Chat cleared!**\n\nI'm ready for new interview question requests. Ask anything, for example:\n• *\"Give me 5 beginner Python questions on lists\"*\n• *\"Give me 10 intermediate SQL questions\"*\n• *\"Give me ML interview questions\"*",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(defaultWelcome);
    setContextId(null);
    setError("");
    localStorage.removeItem("qbChatMessages");
    localStorage.removeItem("qbContextId");
  };

  const handlePracticeQuestion = (questionText) => {
    const cleanText = questionText
      .replace(/\*\*/g, "")
      .replace(/^\d+[\.\)]\s*/, "")
      .replace(/^[-*•]\s*/, "")
      .trim();

    if (!cleanText) return;

    if (startQuestion) {
      startQuestion({
        id: `qb-custom-${Date.now()}`,
        category: getQuestionCategory(cleanText, "Mixed"),
        difficulty: "Practice",
        question: cleanText,
      });
    }

    if (navigate) {
      navigate("Mock Interview");
    }
  };

  return (
    <div className="page-content qb-chat-page-content">
      {/* Header */}
      <div className="qb-header-card">
        <div className="qb-header-info">
          <h1>AI Question Bank Assistant</h1>
        </div>
        <div className="qb-header-actions">
          <button
            className="qb-clear-btn"
            onClick={handleClearChat}
            title="Start a fresh conversation"
          >
            <span>⟲</span> Clear Chat
          </button>
        </div>
      </div>

      {/* Suggestion Prompts */}
      <div className="qb-suggestions-section">
        <span className="qb-suggestions-label">Try Asking:</span>
        <div className="qb-suggestions-chips">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              className="qb-suggestion-chip"
              disabled={isLoading}
              onClick={() => handleSend(prompt)}
            >
              <span className="qb-chip-spark">✦</span> {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="qb-chat-window">
        <div className="qb-messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`qb-message-row ${msg.sender === "user" ? "qb-user-row" : "qb-assistant-row"
                }`}
            >
              {msg.sender === "assistant" && (
                <div className="qb-avatar qb-ai-avatar">
                  <span>IBM</span>
                </div>
              )}

              <div className={`qb-message-bubble ${msg.sender === "user" ? "qb-user-bubble" : "qb-assistant-bubble"
                }`}>
                <div className="qb-bubble-header">
                  <span className="qb-sender-name">
                    {msg.sender === "user" ? "You" : "Question Generator Agent"}
                  </span>
                  <span className="qb-timestamp">{msg.timestamp}</span>
                </div>

                <div className="qb-bubble-body">
                  {msg.sender === "assistant" ? (
                    <FormattedChatMessage
                      content={msg.text}
                      onPracticeQuestion={handlePracticeQuestion}
                    />
                  ) : (
                    <p className="qb-user-text">{msg.text}</p>
                  )}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="qb-avatar qb-user-avatar">
                  <span>{candidate?.name ? candidate.name[0].toUpperCase() : "U"}</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="qb-message-row qb-assistant-row">
              <div className="qb-avatar qb-ai-avatar qb-avatar-pulse">
                <span>IBM</span>
              </div>
              <div className="qb-message-bubble qb-assistant-bubble qb-loading-bubble">
                <div className="qb-loading-header">
                  <span className="qb-sender-name">Question Generator Agent</span>
                  <span className="qb-loading-tag">Querying RAG KB...</span>
                </div>
                <div className="qb-loading-content">
                  <div className="qb-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="qb-loading-text">
                    Generating interview questions with IBM Granite & RAG knowledge base...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="qb-error-card">
              <div className="qb-error-icon">⚠️</div>
              <div className="qb-error-content">
                <strong>Error connecting to Question Generator Agent</strong>
                <p>{error}</p>
                {lastPrompt && (
                  <button
                    className="qb-retry-button"
                    disabled={isLoading}
                    onClick={() => handleSend(lastPrompt)}
                  >
                    ↺ Retry Request
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="qb-input-section">
          <form
            className="qb-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="qb-input-wrapper">
              <textarea
                ref={inputRef}
                className="qb-textarea"
                rows={1}
                placeholder="Ask for interview questions (e.g. 'Give me 5 beginner Python questions on lists')..."
                value={input}
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="submit"
                className="qb-send-button"
                disabled={isLoading || !input.trim()}
                title="Send message"
              >
                {isLoading ? (
                  <span className="qb-button-spinner"></span>
                ) : (
                  <span>↑</span>
                )}
              </button>
            </div>
            <div className="qb-input-footer">
              <span className="qb-footer-hint">
                Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for a new line
              </span>
              <span className="qb-footer-brand">
                ⚡ watsonx Orchestrate · RAG Knowledge Base
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MOCK INTERVIEW
========================================================= */

function MockInterviewPage({
  navigate,
  questions,
  answers,
  setAnswers,
  currentQuestion,
  setCurrentQuestion,
  finishInterview,
  submitMockAnswer,
  isMockLoading,
}) {
  const [answer, setAnswer] =
    useState(
      answers[currentQuestion] || ""
    );

  const question =
    questions[currentQuestion];

  useEffect(() => {
    setAnswer(
      answers[currentQuestion] || ""
    );
  }, [currentQuestion, answers]);

  if (!question) {
    return (
      <div className="page-content">
        <div className="empty-state-card">
          <h3>
            No interview questions available
          </h3>

          <button
            className="primary-button"
            onClick={() =>
              navigate("Interview Setup")
            }
          >
            Go to Interview Setup
          </button>
        </div>
      </div>
    );
  }

  const saveAnswer = () => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: answer,
    }));
  };

  const nextQuestion = async () => {
    if (isMockLoading) return;
    saveAnswer();
    localStorage.setItem("interviewStartedAnswer", "1");

    if (currentQuestion < questions.length - 1) {
      if (submitMockAnswer) {
        await submitMockAnswer(answer);
      } else {
        setCurrentQuestion((previous) => previous + 1);
      }
    } else {
      finishInterview(answer);
    }
  };

  const previousQuestion = () => {
    if (isMockLoading) return;
    saveAnswer();

    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) => previous - 1
      );
    }
  };

  return (
    <div className="page-content">
      <div className="interview-session-layout">
        <div className="interview-session-top">
          <div>
            <p className="interview-label">
              LIVE MOCK INTERVIEW
            </p>

            <h1>Mock Interview</h1>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("Interview Setup")
            }
          >
            Exit Interview
          </button>
        </div>

        <div className="interview-progress">
          <div className="interview-progress-top">
            <span>
              Question {currentQuestion + 1} of{" "}
              {questions.length}
            </span>

            <span>
              {Math.round(
                ((currentQuestion + 1) /
                  questions.length) *
                100
              )}
              %
            </span>
          </div>

          <div className="interview-progress-track">
            <div
              className="interview-progress-bar"
              style={{
                width: `${((currentQuestion + 1) /
                  questions.length) *
                  100
                  }%`,
              }}
            />
          </div>
        </div>

        <div className="interview-question-card">
          <div className="question-header">
            <div className="question-number">
              Q{currentQuestion + 1}
            </div>

            <div className="question-tags">
              <span className="category-badge">
                {question.category}
              </span>

              <span
                className={`difficulty-badge ${question.difficulty
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {question.difficulty}
              </span>
            </div>
          </div>

          <p className="question-instruction">
            Take a moment to think about your answer
            before responding.
          </p>

          <h2>{question.question}</h2>

          <div className="answer-area">
            <label>Your Answer</label>

            <textarea
              className="interview-answer"
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              placeholder="Type your answer here..."
              rows="8"
              disabled={isMockLoading}
            />

            <div className="answer-hint">
              Tip: Keep your answer clear,
              structured, and relevant to the
              question.
            </div>

            {isMockLoading && (
              <div className="answer-hint" style={{ marginTop: "12px" }}>
                ✦ IBM Mock Interviewer is preparing your next question...
              </div>
            )}
          </div>

          <div className="interview-footer">
            <button
              className="secondary-button"
              onClick={previousQuestion}
              disabled={currentQuestion === 0 || isMockLoading}
            >
              ← Previous
            </button>

            <button
              className="primary-button"
              onClick={nextQuestion}
              disabled={isMockLoading}
            >
              {isMockLoading
                ? "Loading..."
                : currentQuestion === questions.length - 1
                  ? "Finish Interview"
                  : "Next Question →"}
            </button>
          </div>
        </div>

        <div className="interviewer-tip">
          <div className="interviewer-tip-icon">
            ✦
          </div>

          <div>
            <strong>
              Interviewer Tip
            </strong>

            <p>
              Answer as if you are speaking to a
              real interviewer. Give specific
              examples whenever possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DEMO EVALUATION ENGINE
========================================================= */

function calculateEvaluation(
  question,
  answer
) {
  const text =
    answer?.trim() || "";

  if (!text) {
    return {
      technical: 0,
      relevance: 0,
      completeness: 0,
      clarity: 0,
      depth: 0,
      overall: 0,

      strengths: [
        "No answer was provided.",
      ],

      improvements: [
        "Provide an answer and explain your reasoning clearly.",
      ],

      improved:
        "Start by directly answering the question, then explain the main concept and provide a simple example.",
    };
  }

  const words =
    text.split(/\s+/).filter(Boolean)
      .length;

  let baseScore = 5;

  if (words >= 15) baseScore += 1;
  if (words >= 30) baseScore += 1;
  if (words >= 60) baseScore += 1;

  const technicalKeywords = [
    "machine learning",
    "data",
    "model",
    "algorithm",
    "python",
    "sql",
    "database",
    "training",
    "testing",
    "feature",
    "prediction",
    "classification",
    "example",
  ];

  const lowerText =
    text.toLowerCase();

  const keywordMatches =
    technicalKeywords.filter(
      (keyword) =>
        lowerText.includes(keyword)
    ).length;

  const technical = Math.min(
    10,
    baseScore +
    Math.min(2, keywordMatches)
  );

  const relevance = Math.min(
    10,
    baseScore + 1
  );

  const completeness = Math.min(
    10,
    baseScore +
    (words >= 40 ? 2 : 0)
  );

  const clarity = Math.min(
    10,
    baseScore +
    (words >= 20 ? 1 : 0)
  );

  const depth = Math.min(
    10,
    baseScore +
    (keywordMatches >= 3 ? 2 : 0)
  );

  const overall = Math.round(
    (technical +
      relevance +
      completeness +
      clarity +
      depth) /
    5
  );

  const strengths = [];

  if (words >= 20) {
    strengths.push(
      "The answer provides a reasonable amount of explanation."
    );
  }

  if (keywordMatches > 0) {
    strengths.push(
      "The answer includes relevant technical concepts."
    );
  }

  strengths.push(
    "The response directly attempts to answer the question."
  );

  const improvements = [];

  if (words < 30) {
    improvements.push(
      "Add more explanation and a simple example."
    );
  }

  improvements.push(
    "Structure the answer with a definition, explanation, and example."
  );

  if (question.category === "Projects") {
    improvements.push(
      "Connect the explanation to your actual project experience."
    );
  }

  return {
    technical,
    relevance,
    completeness,
    clarity,
    depth,
    overall,
    strengths,
    improvements,

    improved:
      "A stronger interview answer would begin with the main idea, briefly explain how it works, and then support the explanation with a practical example.",
  };
}

/* =========================================================
   EVALUATION PAGE
========================================================= */

function EvaluationPage({
  navigate,
  evaluations,
}) {
  if (
    !evaluations ||
    evaluations.length === 0
  ) {
    return (
      <div className="page-content">
        <div className="empty-evaluation">
          <div className="empty-state-icon">
            ✓
          </div>

          <h2>
            No evaluation available yet
          </h2>

          <p>
            Complete a mock interview first to
            see your performance evaluation.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("Interview Setup")
            }
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  const average =
    evaluations.reduce(
      (sum, item) =>
        sum + item.overall,
      0
    ) / evaluations.length;

  const overallScore =
    Math.round(average * 10) / 10;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            Performance Analysis
          </p>

          <h1>
            Interview Evaluation
          </h1>

          <p>
            Review your performance and identify
            areas for improvement.
          </p>
        </div>
      </div>

      <div className="evaluation-summary">
        <div className="overall-score-card">
          <div className="score-circle">
            <span>{overallScore}</span>
            <small>/10</small>
          </div>

          <div>
            <p className="page-eyebrow">
              Overall Score
            </p>

            <h2>
              {overallScore >= 8
                ? "Excellent Performance"
                : overallScore >= 6
                  ? "Good Progress"
                  : "Keep Practicing"}
            </h2>

            <p>
              Based on{" "}
              {evaluations.length} evaluated
              answer
              {evaluations.length !== 1
                ? "s"
                : ""}
              .
            </p>
          </div>
        </div>

        <div className="evaluation-metric-grid">
          {[
            [
              "Technical Accuracy",
              "technical",
            ],
            ["Relevance", "relevance"],
            [
              "Completeness",
              "completeness",
            ],
            ["Clarity", "clarity"],
            ["Depth", "depth"],
          ].map(([label, key]) => {
            const value =
              evaluations.reduce(
                (sum, item) =>
                  sum + item[key],
                0
              ) /
              evaluations.length;

            return (
              <div
                className="evaluation-metric-card"
                key={key}
              >
                <span>{label}</span>

                <strong>
                  {Math.round(value * 10) /
                    10}
                </strong>

                <div className="score-bar">
                  <div
                    style={{
                      width: `${value * 10}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="evaluation-details">
        <div className="evaluation-details-header">
          <div>
            <h2>
              Answer-by-Answer Evaluation
            </h2>

            <p>
              Review feedback for each interview
              question.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("History")
            }
          >
            View History
          </button>
        </div>

        <div className="answer-evaluation-list">
          {evaluations.map(
            (item, index) => (
              <div
                className="answer-evaluation-item"
                key={index}
              >
                <div className="answer-evaluation-header">
                  <div>
                    <span className="question-small-number">
                      Q{index + 1}
                    </span>

                    <span className="category-badge">
                      {item.question.category}
                    </span>
                  </div>

                  <strong>
                    {item.overall}/10
                  </strong>
                </div>

                <h3>
                  {item.question.question}
                </h3>

                <div className="candidate-answer">
                  <span>
                    Your Answer
                  </span>

                  <p>
                    {item.answer ||
                      "No answer provided."}
                  </p>
                </div>

                <div className="evaluation-mini-grid">
                  <div>
                    <span>
                      Technical
                    </span>

                    <strong>
                      {item.technical}/10
                    </strong>
                  </div>

                  <div>
                    <span>
                      Relevance
                    </span>

                    <strong>
                      {item.relevance}/10
                    </strong>
                  </div>

                  <div>
                    <span>
                      Completeness
                    </span>

                    <strong>
                      {item.completeness}/10
                    </strong>
                  </div>

                  <div>
                    <span>
                      Clarity
                    </span>

                    <strong>
                      {item.clarity}/10
                    </strong>
                  </div>

                  <div>
                    <span>
                      Depth
                    </span>

                    <strong>
                      {item.depth}/10
                    </strong>
                  </div>
                </div>

                <div className="evaluation-feedback">
                  <div>
                    <h4>
                      What you did well
                    </h4>

                    <ul>
                      {item.strengths.map(
                        (strength, i) => (
                          <li key={i}>
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4>
                      What to improve
                    </h4>

                    <ul>
                      {item.improvements.map(
                        (
                          improvement,
                          i
                        ) => (
                          <li key={i}>
                            {improvement}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4>
                      Suggested Improved Answer
                    </h4>

                    <p>
                      {item.improved}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="evaluation-actions">
        <button
          className="secondary-button"
          onClick={() =>
            navigate("Question Bank")
          }
        >
          Practice More Questions
        </button>

        <button
          className="primary-button"
          onClick={() =>
            navigate("Interview Setup")
          }
        >
          Start New Interview →
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function HistoryPage({
  navigate,
  history,
  deleteHistory,
}) {
  const [
    selectedInterview,
    setSelectedInterview,
  ] = useState(null);

  return (
    <div className="page-content">
      <div className="page-header history-heading">
        <div>
          <p className="page-eyebrow">
            Progress Tracking
          </p>

          <h1>Interview History</h1>

          <p>
            Review your previous mock interviews
            and performance.
          </p>
        </div>

        {history.length > 0 && (
          <button
            className="danger-button"
            onClick={deleteHistory}
          >
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <div className="empty-state-icon">
            ◷
          </div>

          <h2>
            No interview history
          </h2>

          <p>
            Complete your first mock interview
            to see your progress here.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("Interview Setup")
            }
          >
            Start First Interview
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div
              className="history-item"
              key={item.id}
            >
              <div className="history-icon">
                ✓
              </div>

              <div className="history-main">
                <div>
                  <span className="history-role">
                    {item.role}
                  </span>

                  <h3>
                    Mock Interview
                  </h3>

                  <p>
                    {new Date(
                      item.date
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="history-score">
                  <strong>
                    {item.score}
                  </strong>

                  <span>/10</span>
                </div>

                <button
                  className="history-view-button"
                  onClick={() =>
                    setSelectedInterview(
                      item
                    )
                  }
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedInterview && (
        <div className="history-modal-overlay">
          <div className="history-modal">
            <div className="history-modal-header">
              <div>
                <p className="page-eyebrow">
                  Interview Details
                </p>

                <h2>
                  {selectedInterview.role}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedInterview(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="history-detail-score">
              <span>
                Overall Score
              </span>

              <strong>
                {selectedInterview.score}/10
              </strong>
            </div>

            <div className="history-question-details">
              {selectedInterview.evaluations?.map(
                (item, index) => (
                  <div
                    className="history-question-detail"
                    key={index}
                  >
                    <div className="history-detail-header">
                      <strong>
                        Q{index + 1}
                      </strong>

                      <span>
                        {item.overall}/10
                      </span>
                    </div>

                    <h4>
                      {item.question.question}
                    </h4>

                    <p>
                      {item.answer ||
                        "No answer provided."}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ navigate, history }) {
  const completedInterviews = history.length;
  const questionsPracticed = history.reduce(
    (total, item) => total + (item.questionCount || 0),
    0
  );
  const averageScore = completedInterviews > 0
    ? Math.round(
      (history.reduce((total, item) => total + item.score, 0) /
        completedInterviews) *
      10
    ) / 10
    : null;
  return (
    <div className="dashboard-page">
      <div className="welcome-card">
        <div>
          <span className="welcome-label">
            INTERVIEWMATE AI
          </span>

          <h1>
            Prepare smarter.
            <br />
            Interview with confidence.
          </h1>

          <p>
            Your personalized AI interview
            training platform for technical,
            behavioral and HR interviews.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("Interview Setup")
            }
          >
            Start Interview →
          </button>
        </div>

      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>
            Interviews Completed
          </span>

          <strong>{completedInterviews}</strong>

          <small>
            {completedInterviews === 1
              ? "Keep building your progress"
              : "Keep practicing consistently"}
          </small>
        </div>

        <div className="stat-card">
          <span>
            Questions Practiced
          </span>

          <strong>{questionsPracticed}</strong>

          <small>
            Questions evaluated
          </small>
        </div>

        <div className="stat-card">
          <span>
            Average Score
          </span>

          <strong>{averageScore ?? "—"}</strong>

          <small>
            {averageScore === null
              ? "Complete an interview"
              : "Average interview score"}
          </small>
        </div>

        <div className="stat-card">
          <span>
            Current Streak
          </span>

          <strong>{completedInterviews > 0 ? 1 : 0}</strong>

          <small>
            {completedInterviews > 0
              ? "Keep practicing to grow it"
              : "Practice consistently"}
          </small>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                QUICK START
              </span>

              <h2>
                Practice your interview skills
              </h2>
            </div>
          </div>

          <div className="quick-start-grid">
            <button
              className="quick-action"
              onClick={() =>
                navigate("Interview Setup")
              }
            >
              <span>01</span>

              <div>
                <strong>
                  Start Mock Interview
                </strong>

                <small>
                  Practice with an AI interviewer
                </small>
              </div>
            </button>

            <button
              className="quick-action"
              onClick={() =>
                navigate("Question Bank")
              }
            >
              <span>02</span>

              <div>
                <strong>
                  Explore Questions
                </strong>

                <small>
                  Browse technical and HR
                  questions
                </small>
              </div>
            </button>
          </div>
        </div>

        <div className="dashboard-card progress-card">
          <div className="card-heading">
            <div>
              <span className="section-label">
                YOUR PROGRESS
              </span>

              <h2>
                Interview readiness
              </h2>
            </div>
          </div>

          <div className="progress-empty">
            <div className="progress-circle">
              <span>
                {averageScore === null
                  ? "0%"
                  : `${Math.round(averageScore * 10)}%`}
              </span>
            </div>

            <p>
              {averageScore === null
                ? "Complete your first interview to start tracking your readiness."
                : "Your readiness is based on your average interview score."}
            </p>
          </div>
        </div>
      </div>

      <div className="feature-section">
        <div className="section-heading">
          <span className="section-label">
            IBM TEAM
          </span>

          <h2>
            Powered by specialized IBM Agents
          </h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-number">
              01
            </div>

            <h3>
              Resume Analyzer
            </h3>

            <p>
              Extracts skills, projects,
              education and experience from
              your resume.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-number">
              02
            </div>

            <h3>
              Question Generator
            </h3>

            <p>
              Creates personalized interview
              questions based on your profile.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-number">
              03
            </div>

            <h3>
              Mock Interviewer
            </h3>

            <p>
              Conducts realistic interviews and
              asks follow-up questions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-number">
              04
            </div>

            <h3>
              Evaluation Agent
            </h3>

            <p>
              Evaluates your answers and
              provides actionable improvement
              feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function AuthPage({ mode, onModeChange, onAuthenticate, isPasswordRecovery, onPasswordResetComplete }) {
  const isSignUp = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [rememberedEmails] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rememberedAuthEmails") || "[]");
    } catch {
      return [];
    }
  });
  const [formData, setFormData] = useState(() => ({
    name: "",
    email: rememberedEmails[0] || "",
    password: "",
  }));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleForgotPassword = async () => {
    setAuthError("");
    setAuthMessage("");

    if (!formData.email.trim()) {
      setAuthError("Enter your email address first.");
      return;
    }

    setIsResettingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email.trim(),
      { redirectTo: `${window.location.origin}/` }
    );
    setIsResettingPassword(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setAuthMessage("Password reset instructions have been sent to your email.");
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");

    if (newPassword.length < 8) {
      setAuthError("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAuthError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSubmitting(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setAuthMessage("Your password has been updated. You can continue to InterviewMate.");
    onPasswordResetComplete();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setIsSubmitting(true);

    const result = isSignUp
      ? await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name.trim() || "Candidate" } },
      })
      : await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

    setIsSubmitting(false);

    if (result.error) {
      setAuthError(result.error.message);
      return;
    }

    const email = formData.email.trim().toLowerCase();
    const updatedEmails = [email, ...rememberedEmails.filter((item) => item !== email)].slice(0, 5);
    localStorage.setItem("rememberedAuthEmails", JSON.stringify(updatedEmails));

    if (isSignUp && !result.data.session) {
      setAuthMessage("Account created. Check your email to confirm your account, then sign in.");
      onModeChange("login");
      return;
    }

    const user = result.data.user;
    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Candidate";
    onAuthenticate(user, displayName);
  };

  return (
    <main className="auth-page">
      <section className="auth-visual-panel">
        <div className="auth-brand"><div className="auth-brand-mark">IM</div><span>InterviewMate</span></div>
        <div className="auth-visual-copy">
          <p className="auth-kicker">Your next opportunity starts here</p>
          <h1>Practice with purpose. Walk in prepared.</h1>
          <p>Build confidence with AI-powered mock interviews, targeted questions, and feedback that helps you improve one answer at a time.</p>
        </div>
        <div className="auth-proof">
          <div className="auth-proof-avatars"><span>AK</span><span>SR</span><span>MJ</span></div>
          <p><strong>4.9/5</strong> from focused candidates</p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><div className="auth-brand-mark">IM</div><span>InterviewMate</span></div>
          <div className="auth-heading">
            <p className="auth-eyebrow">AI interview trainer</p>
            <h2>{isPasswordRecovery ? "Set a new password" : isSignUp ? "Create your account" : "Welcome back"}</h2>
            <p>{isPasswordRecovery ? "Choose a new password for your InterviewMate account." : isSignUp ? "Set up your practice space in less than a minute." : "Pick up where your preparation left off."}</p>
          </div>

          <form className="auth-form" onSubmit={isPasswordRecovery ? handlePasswordUpdate : handleSubmit}>
            {isPasswordRecovery ? (
              <>
                <label className="auth-field">
                  <span>New password</span>
                  <input type="password" placeholder="At least 8 characters" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength="8" required />
                </label>
                <label className="auth-field">
                  <span>Confirm new password</span>
                  <input type="password" placeholder="Repeat your new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength="8" required />
                </label>
              </>
            ) : isSignUp && (
              <label className="auth-field">
                <span>Full name</span>
                <input type="text" placeholder="Mounika Reddy" value={formData.name} onChange={(event) => updateField("name", event.target.value)} autoComplete="name" required />
              </label>
            )}
            {!isPasswordRecovery && <>
              <label className="auth-field">
                <span>Email address</span>
                <input type="email" placeholder="you@example.com" value={formData.email} onChange={(event) => updateField("email", event.target.value)} autoComplete="email" list="remembered-auth-emails" required />
                <datalist id="remembered-auth-emails">
                  {rememberedEmails.map((email) => <option value={email} key={email} />)}
                </datalist>
              </label>
              <label className="auth-field">
                <span>Password</span>
                <div className="auth-password-input">
                  <input type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={formData.password} onChange={(event) => updateField("password", event.target.value)} autoComplete={isSignUp ? "new-password" : "current-password"} minLength="8" required />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
                </div>
              </label>
            </>}
            {!isPasswordRecovery && <div className="auth-form-options">
              <label className="auth-checkbox"><input type="checkbox" defaultChecked /><span>Keep me signed in</span></label>
              {!isSignUp && <button type="button" className="auth-text-button" onClick={handleForgotPassword} disabled={isResettingPassword}>{isResettingPassword ? "Sending..." : "Forgot password?"}</button>}
            </div>}
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : isPasswordRecovery ? "Update password" : isSignUp ? "Create account" : "Sign in"}<span aria-hidden="true">-&gt;</span></button>
          </form>

          {!isPasswordRecovery && <p className="auth-switch">{isSignUp ? "Already have an account?" : "New to InterviewMate?"}{" "}<button type="button" onClick={() => onModeChange(isSignUp ? "login" : "signup")}>{isSignUp ? "Sign in" : "Create an account"}</button></p>}
          <p className="auth-terms">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authUser, setAuthUser] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [
    interviewQuestionsState,
    setInterviewQuestionsState,
  ] = useState([]);

  const [answers, setAnswers] =
    useState({});

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(0);

  const [evaluations, setEvaluations] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [candidateProfile, setCandidateProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("candidateProfile");
      return saved ? JSON.parse(saved) : demoProfile;
    } catch { return demoProfile; }
  });

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isMockLoading, setIsMockLoading] =
    useState(false);

  const [mockContextId, setMockContextId] =
    useState(() => localStorage.getItem("mockContextId") || "");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const saveProfile = async (user, profile) => {
    if (!user?.id) return;

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: profile.name || user.user_metadata?.full_name || "Candidate",
        email: user.email || null,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase profile save failed:", error);
    }
  };

  const loadProfile = async (user) => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Supabase profile load failed:", error);
      return;
    }

    if (data?.full_name) {
      setCandidateProfile((previous) => {
        const updatedProfile = { ...previous, name: data.full_name };
        localStorage.setItem("candidateProfile", JSON.stringify(updatedProfile));
        return updatedProfile;
      });
    }
  };

  const handleAuthenticate = async (user, displayName) => {
    const updatedProfile = { ...candidateProfile, name: displayName };
    setCandidateProfile(updatedProfile);
    localStorage.setItem("candidateProfile", JSON.stringify(updatedProfile));
    setAuthUser(user);
    await saveProfile(user, updatedProfile);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Supabase sign-out failed:", error);
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        const recoveryLink = window.location.hash.includes("type=recovery")
          || new URLSearchParams(window.location.search).get("type") === "recovery";
        setAuthUser(session?.user || null);
        if (recoveryLink && session?.user) setIsPasswordRecovery(true);
        setIsAuthLoading(false);
        if (session?.user) loadProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setAuthUser(session?.user || null);
        if (_event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
        if (session?.user) loadProfile(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =====================================================
     LOAD HISTORY
  ===================================================== */

  useEffect(() => {
    const savedHistory =
      localStorage.getItem(
        "interviewHistory"
      );

    if (savedHistory) {
      try {
        setHistory(
          JSON.parse(savedHistory)
        );
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const navigate = (page) => {
    setActivePage(page);
  };

  /* =====================================================
     START INTERVIEW — IBM WATSONX ORCHESTRATE
  ===================================================== */

  const startInterview = async () => {
    const setupData =
      localStorage.getItem("interviewSetup");

    let setup = {
      role: "AI/ML Engineer",
      experience: "Beginner",
      questionCount: 5,
      focus: "Mixed",
    };

    if (setupData) {
      try {
        setup = JSON.parse(setupData);
      } catch {
        // Use defaults
      }
    }

    // Reuse questions already generated for the same interview setup.
    // This prevents another IBM request when the user returns to the
    // setup page or clicks Mock Interview again during the same session.
    const setupKey = JSON.stringify({
      role: setup.role,
      experience: setup.experience,
      questionCount: Number(setup.questionCount || 5),
      focus: setup.focus,
    });

    const savedQuestions =
      localStorage.getItem("activeInterviewQuestions");
    const savedSetupKey =
      localStorage.getItem("activeInterviewSetupKey");

    if (savedQuestions && savedSetupKey === setupKey) {
      try {
        const cachedQuestions = JSON.parse(savedQuestions);

        if (Array.isArray(cachedQuestions) && cachedQuestions.length > 0) {
          setInterviewQuestionsState(cachedQuestions);
          setAnswers({});
          setEvaluations([]);
          setCurrentQuestion(0);
          navigate("Mock Interview");
          return;
        }
      } catch {
        // Ignore invalid cached questions and generate fresh questions.
      }
    }

    setIsGenerating(true);

    try {
      const aiQuestions =
        await generateInterviewQuestions(setup, candidateProfile);

      setInterviewQuestionsState(aiQuestions);
      setAnswers({});
      setEvaluations([]);
      setCurrentQuestion(0);

      localStorage.setItem(
        "activeInterviewQuestions",
        JSON.stringify(aiQuestions)
      );
      localStorage.setItem(
        "activeInterviewSetupKey",
        setupKey
      );

      navigate("Mock Interview");
    } catch (error) {
      console.error("AI question generation failed:", error);

      // Keep the existing prototype usable if the backend/WXO is temporarily unavailable.
      let filtered = [...interviewQuestions];

      if (setup.focus && setup.focus !== "Mixed") {
        if (setup.focus === "Technical") {
          filtered = interviewQuestions.filter((item) =>
            [
              "Python",
              "Machine Learning",
              "AI/ML",
              "SQL",
              "DSA",
            ].includes(item.category)
          );
        } else if (setup.focus === "HR & Behavioral") {
          filtered = interviewQuestions.filter((item) =>
            ["HR", "Behavioral"].includes(item.category)
          );
        } else {
          filtered = interviewQuestions.filter(
            (item) => item.category === setup.focus
          );
        }
      }

      if (filtered.length === 0) {
        filtered = [...interviewQuestions];
      }

      filtered = filtered.slice(
        0,
        setup.questionCount || 5
      );

      setInterviewQuestionsState(filtered);
      setAnswers({});
      setEvaluations([]);
      setCurrentQuestion(0);
      localStorage.setItem(
        "activeInterviewQuestions",
        JSON.stringify(filtered)
      );
      localStorage.setItem(
        "activeInterviewSetupKey",
        setupKey
      );
      navigate("Mock Interview");
    } finally {
      setIsGenerating(false);
    }
  };

  /* =====================================================
     START SINGLE QUESTION
  ===================================================== */

  const startQuestionFromBank = (
    question
  ) => {
    setInterviewQuestionsState([
      question,
    ]);

    setAnswers({});
    setEvaluations([]);
    setCurrentQuestion(0);

    localStorage.removeItem("activeInterviewQuestions");
    localStorage.removeItem("activeInterviewSetupKey");

    localStorage.setItem(
      "interviewSetup",
      JSON.stringify({
        role: "Practice Question",
        experience:
          question.difficulty,
        questionCount: 1,
        focus: question.category,
      })
    );

    navigate("Mock Interview");
  };

  /* =====================================================
     SUBMIT MOCK ANSWER — IBM MOCK INTERVIEWER
  ===================================================== */

  const submitMockAnswer = async (answer) => {
    setIsMockLoading(true);
    try {
      const setup = JSON.parse(localStorage.getItem("interviewSetup") || "{}");
      const data = await sendMockAnswerToAI({
        contextId: mockContextId,
        setup,
        candidate: candidateProfile,
        plannedQuestions: interviewQuestionsState,
        currentQuestion,
        answer,
      });
      const newContextId = data.context_id || mockContextId;
      setMockContextId(newContextId);
      if (newContextId) localStorage.setItem("mockContextId", newContextId);
      setCurrentQuestion((prev) => prev + 1);
    } catch (error) {
      console.error("IBM Mock Interviewer answer failed:", error);
      // Fall back to just advancing the question locally
      setCurrentQuestion((prev) => prev + 1);
    } finally {
      setIsMockLoading(false);
    }
  };

  /* =====================================================
     FINISH INTERVIEW — IBM EVALUATION AGENT
  ===================================================== */

  const finishInterview = async (lastAnswer = "") => {
    const finalAnswers = { ...answers, [currentQuestion]: lastAnswer };
    setAnswers(finalAnswers);

    const setupData = localStorage.getItem("interviewSetup");
    let setup = {};
    try { setup = JSON.parse(setupData || "{}"); } catch { setup = {}; }

    const transcript = interviewQuestionsState.map((question, index) => ({
      question: question.question,
      category: question.category,
      answer: finalAnswers[index] || "",
    }));

    const localEvaluations = interviewQuestionsState.map((question, index) => ({
      question,
      answer: finalAnswers[index] || "",
      ...calculateEvaluation(question, finalAnswers[index] || ""),
    }));

    const historyId = Date.now();
    const localScore = localEvaluations.length > 0
      ? Math.round((localEvaluations.reduce((sum, item) => sum + item.overall, 0) / localEvaluations.length) * 10) / 10
      : 0;
    const localHistoryItem = {
      id: historyId,
      date: new Date().toISOString(),
      role: setup.role || "AI/ML Engineer",
      experience: setup.experience || "Beginner",
      questionCount: localEvaluations.length,
      score: localScore,
      evaluations: localEvaluations,
    };

    setHistory((previous) => {
      const updated = [localHistoryItem, ...previous];
      localStorage.setItem("interviewHistory", JSON.stringify(updated));
      return updated;
    });

    // Show evaluation page immediately with local scores, then replace with IBM scores
    setEvaluations(localEvaluations);
    navigate("Evaluation");

    // Call IBM Evaluation Agent in background and replace scores when ready
    try {
      const ibmEvaluations = await evaluateInterviewWithAI({
        setup,
        candidate: candidateProfile,
        transcript,
      });

      if (ibmEvaluations && ibmEvaluations.length > 0) {
        const merged = ibmEvaluations.map((ev, index) => ({
          question: interviewQuestionsState[index] || localEvaluations[index]?.question,
          answer: finalAnswers[index] || "",
          ...ev,
        }));
        setEvaluations(merged);

        const score = merged.length > 0
          ? Math.round((merged.reduce((sum, item) => sum + item.overall, 0) / merged.length) * 10) / 10
          : 0;

        setHistory((previous) => {
          const updated = previous.map((item) =>
            item.id === historyId
              ? { ...item, questionCount: merged.length, score, evaluations: merged }
              : item
          );
          localStorage.setItem("interviewHistory", JSON.stringify(updated));
          return updated;
        });
        return;
      }
    } catch (error) {
      console.error("IBM Evaluation Agent failed, keeping local scores:", error);
    }

  };

  /* =====================================================
     DELETE HISTORY
  ===================================================== */

  const deleteHistory = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to clear all interview history?"
      );

    if (!confirmed) return;

    localStorage.removeItem(
      "interviewHistory"
    );

    setHistory([]);
  };

  /* =====================================================
     SIDEBAR
  ===================================================== */

  const navItems = [
    {
      name: "Dashboard",
      icon: "⌂",
    },
    {
      name: "Resume",
      icon: "▣",
    },
    {
      name: "Interview Setup",
      icon: "⚙",
    },
    {
      name: "Question Bank",
      icon: "☷",
    },
    {
      name: "Mock Interview",
      icon: "◉",
    },
    {
      name: "Evaluation",
      icon: "✓",
    },
    {
      name: "History",
      icon: "◷",
    },
  ];

  if (isAuthLoading) {
    return <main className="auth-loading">Loading InterviewMate...</main>;
  }

  if (isPasswordRecovery) {
    return (
      <AuthPage
        mode="login"
        onModeChange={setAuthMode}
        onAuthenticate={handleAuthenticate}
        isPasswordRecovery
        onPasswordResetComplete={() => setIsPasswordRecovery(false)}
      />
    );
  }

  if (!authUser) {
    return <AuthPage mode={authMode} onModeChange={setAuthMode} onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            IM
          </div>

          <div>
            <h2>
              InterviewMate
            </h2>

            <span>
              AI INTERVIEW TRAINER
            </span>
          </div>
        </div>

        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activePage ===
                item.name
                ? "active"
                : ""
                }`}
              onClick={() => {
                if (
                  item.name ===
                  "Mock Interview"
                ) {
                  if (
                    interviewQuestionsState.length ===
                    0
                  ) {
                    const setupData =
                      localStorage.getItem(
                        "interviewSetup"
                      );

                    if (setupData) {
                      startInterview();
                    } else {
                      navigate(
                        "Interview Setup"
                      );
                    }
                  } else {
                    navigate(
                      "Mock Interview"
                    );
                  }
                } else {
                  navigate(
                    item.name
                  );
                }
              }}
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-profile-button"
            type="button"
            onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isAccountMenuOpen}
            aria-label="Open account menu"
          >
            <span className="sidebar-profile-avatar">
              {(candidateProfile.name || "C").charAt(0).toUpperCase()}
            </span>
            <span className="sidebar-profile-copy">
              <strong>{candidateProfile.name || "Candidate"}</strong>
              <span>{authUser.email || "No email available"}</span>
            </span>
          </button>

          {isAccountMenuOpen && (
            <div className="account-menu">
              <strong>{candidateProfile.name || "Candidate"}</strong>
              <span>{authUser.email || "No email available"}</span>
              <button className="sign-out-button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          )}

          <span>
            IBM GRANITE
          </span>

          <p>
            Agentic AI Interview Platform
          </p>

        </div>
      </aside>

      <main className="main-content">
        {activePage ===
          "Dashboard" && (
            <Dashboard
              navigate={navigate}
              history={history}
            />
          )}

        {activePage ===
          "Resume" && (
            <ResumePage
              profile={candidateProfile}
              onProfileChange={(p) => {
                setCandidateProfile(p);
                localStorage.setItem("candidateProfile", JSON.stringify(p));
                saveProfile(authUser, p);
              }}
            />
          )}

        {activePage ===
          "Interview Setup" && (
            <InterviewSetupPage
              isGenerating={isGenerating}
              navigate={(
                page
              ) => {
                if (
                  page ===
                  "Mock Interview"
                ) {
                  startInterview();
                } else {
                  navigate(page);
                }
              }}
            />
          )}

        {activePage ===
          "Question Bank" && (
            <QuestionBankPage
              navigate={navigate}
              startQuestion={
                startQuestionFromBank
              }
              candidate={candidateProfile}
            />
          )}

        {activePage ===
          "Mock Interview" && (
            <MockInterviewPage
              navigate={navigate}
              questions={
                interviewQuestionsState
              }
              answers={answers}
              setAnswers={
                setAnswers
              }
              currentQuestion={
                currentQuestion
              }
              setCurrentQuestion={
                setCurrentQuestion
              }
              finishInterview={
                finishInterview
              }
              submitMockAnswer={
                submitMockAnswer
              }
              isMockLoading={
                isMockLoading
              }
            />
          )}

        {activePage ===
          "Evaluation" && (
            <EvaluationPage
              navigate={navigate}
              evaluations={
                evaluations
              }
            />
          )}

        {activePage ===
          "History" && (
            <HistoryPage
              navigate={navigate}
              history={history}
              deleteHistory={
                deleteHistory
              }
            />
          )}
      </main>
    </div>
  );
}

export default App;