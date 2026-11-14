# SkillPath AI 🚀
> **Know your gaps. Learn what matters. Get job-ready.**

An AI-powered personalized learning platform that employs a team of collaborating autonomous AI agents to analyze a learner's skills, match them to a target career role, generate a prerequisite-ordered learning roadmap, track progress, and continuously re-plan when goals change or assessment scores fluctuate.

---

## 🌟 Hackathon Upgrades & Key Innovations

Unlike conventional platforms (Coursera, roadmap.sh) which are catalog-locked, static, or use a single prompt dressed up as an "agent", **SkillPath AI** features:

1. **Autonomous 7-Agent Architecture**: Dedicated Python agents with clear input/output schemas collaborating via an event-driven Orchestrator.
2. **Topological Prerequisite Ordering**: Strict dependency graphs ensuring prerequisites are mastered before dependents (HTML/CSS & JavaScript before React, JavaScript before Node.js, Node.js & SQL before REST APIs).
3. **Adaptive Trigger System (Judges Demo)**:
   - Failing an assessment (< 60%) immediately commands the Curriculum Agent to insert remedial review modules while the Mentor Agent provides explanations and study tips.
   - Switching career goals (e.g., to Data Scientist) re-routes the timeline and reuses existing transferable competencies (e.g. Python, SQL) to accelerate readiness.
4. **Evidence-Based Verification**: Proficiency levels (0–100) backed by auto-graded code assessments, GitHub repos, projects, and certificates.
5. **Interactive What-If Career Simulator**: Predictive modeling showing real-time readiness shifts before committing study time (e.g., adding Docker jumps readiness from 42% to 55%).
6. **Institutional Cohort Heatmap**: Actionable admin view displaying cohort-wide skill gaps (e.g., "70% lack Node.js -> schedule workshop") and at-risk students.
7. **Offline & Zero-Key Fallback**: Built-in deterministic rule engine ensuring 100% demo uptime with no API keys required, with support for Google Gemini and Anthropic Claude.

---

## 🤖 The 7 Collaborating Agents

| Agent | Responsibility | Core Output |
| :--- | :--- | :--- |
| **Profile Agent** | Parses resume text, GitHub repos, and certificates | Structured skill graph with proficiency (0-100) & evidence |
| **Career Agent** | Maps target career roles to weighted industry requirements | Weighted role competency graph |
| **Gap Analyst** | Computes mathematical readiness & boosts prerequisite gaps | Prioritized gap ledger & readiness score |
| **Curriculum Agent** | Topologically orders gaps & fits them to weekly availability | Week-by-week prerequisite roadmap & resources |
| **Assessment Agent** | Auto-grades quizzes and code tasks, detecting weak subtopics | Scores, weak subtopics, and performance feedback |
| **Mentor Agent** | Context-aware conversational guide explaining roadmap adaptations | Real-time chat guidance & study tips |
| **Orchestrator** | Event-driven event bus routing triggers and audit logs | Complete `AgentEvent` live stream |

---

## 🚀 Quick Start (One Command)

### Prerequisites
- Python 3.10+
- Node.js 18+ (bundled/symlinked in `~/.local/bin`)

### Option A: Run Script
```bash
cd /Users/reya/skillpath-ai
./run.sh
```

### Option B: Manual Startup
```bash
# 1. Start Backend & Static SPA Server
cd /Users/reya/skillpath-ai/backend
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# 2. (Optional) Run Vite Dev Server for Hot-Reloading
cd /Users/reya/skillpath-ai/frontend
npm run dev
```

Open your browser to: **`http://localhost:8000`** (or `http://localhost:5173` if running Vite dev server).

---

## 🎯 Step-by-Step Demo Script for Judges

### Scenario 1: Initial Learner State & Gap Analysis
1. Open `http://localhost:8000/login`.
2. Click **"Demo Student (Alex Rivera)"** (or login with `student@skillpath.ai` / `password123`).
3. Notice Alex starts with **Python (75%)**, **SQL (70%)**, and basic **HTML/CSS (60%)** targeting **Full Stack Developer**.
4. The dashboard displays the initial readiness gauge. Navigate to **Skill Analysis** (`/analysis`) to inspect the Radar Chart and identified gaps (**JavaScript**, **React**, **Node.js**).

### Scenario 2: Live Multi-Agent Collaboration Audit
1. Navigate to **Agent Activity** (`/agents`).
2. Show judges the chronological stream of events: `ProfileAgent` -> `CareerAgent` -> `GapAnalyst` -> `CurriculumAgent` -> `MentorAgent`.

### Scenario 3: Intentional Failure & Dynamic Remedial Insertion
1. Navigate to **Assessments** (`/assessments`).
2. Select **JavaScript**. Click the shortcut button **"Fail Quiz (< 60%)"** (or submit wrong answers).
3. The assessment immediately grades the attempt and triggers the adaptive rule:
   - Notice the toast alert: *"Roadmap adapted: Inserted remedial review module..."*
   - Navigate to **Roadmap** (`/roadmap`) to see the newly inserted **"JavaScript Fundamentals & Review"** item with reason tag *"Low quiz score (0%)"*.
   - Open the **AI Mentor** drawer (top right button): the mentor explains *why* the remedial topic was scheduled.

### Scenario 4: Goal Switch to Data Scientist & Skill Reuse
1. Navigate to **Career Match** (`/career-match`).
2. Click **"Switch Goal to Data Scientist"**.
3. The Orchestrator triggers `goal_changed`:
   - The platform instantly re-plans the dependency roadmap for Data Science.
   - Alex's existing competencies in **Python** and **SQL** are immediately matched and reused, significantly boosting the readiness score!

### Scenario 5: Career What-If Simulator & Admin Heatmap
1. Go to **Career Simulator** (`/simulator`).
2. Select **JavaScript** or **Docker** and adjust the slider to 85%. Watch the live readiness shift by **+15.6%**.
3. Sign out and log in as **Demo Director** (`admin@skillpath.ai` / `admin123`).
4. View the **Cohort Competency Heatmap**, top skill gaps with recommended workshops, and at-risk student intervention alerts.

---

## 🧪 Automated Test Suite

Run the full end-to-end integration and agent test suite:
```bash
cd /Users/reya/skillpath-ai/backend
python3 test_api.py
```
Outputs:
- `[TEST 1 PASS] Readiness: 18.7%, Missing Gaps: ['JavaScript', 'React', 'Node.js', ...]`
- `[TEST 2 PASS] Topological roadmap order verified: ['JavaScript', 'React', 'Node.js']`
- `[TEST 3 PASS] Low score triggered adaptation. Remedial item inserted`
- `[TEST 4 PASS] Re-planned for Data Scientist! Reused skills: ['Python', 'SQL']`
- `[TEST 5 PASS] Career Simulator delta & Admin cohort analytics verified`

