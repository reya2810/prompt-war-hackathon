import json
import logging
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_key = settings.GEMINI_API_KEY
        self.anthropic_key = settings.ANTHROPIC_API_KEY

    def generate_mentor_reply(self, context: Dict[str, Any], user_message: str) -> str:
        """
        Generates mentor advice, explaining plan changes, study tips, or motivation.
        Uses rule-based mock logic or real LLM if configured.
        """
        role_name = context.get("role_name", "your target role")
        readiness = context.get("readiness_score", 42.0)
        recent_event = context.get("recent_event", "")
        weak_topics = context.get("weak_subtopics", [])
        
        msg_lower = user_message.lower()

        # If real LLM configured and key present:
        if self.provider == "gemini" and self.gemini_key:
            try:
                import requests
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
                prompt = f"""You are the AI Mentor in SkillPath AI. 
Learner Context:
- Target Role: {role_name}
- Readiness Score: {readiness:.1f}%
- Recent Event: {recent_event}
- Weak Subtopics: {weak_topics}

Learner says: "{user_message}"
Provide an empathetic, actionable, and concise reply explaining any roadmap adaptations and next steps."""
                res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=5)
                if res.status_code == 200:
                    return res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            except Exception as e:
                logger.warning(f"Gemini call failed, falling back to mock: {e}")

        # Deterministic intelligent mock responses
        if "why" in msg_lower and ("change" in msg_lower or "remedial" in msg_lower or "plan" in msg_lower or "quiz" in msg_lower):
            if weak_topics:
                topics_str = ", ".join(weak_topics)
                return f"I updated your roadmap because your recent assessment highlighted opportunities in {topics_str}. To build strong mastery before moving to advanced topics like React and Node.js, we inserted foundational practice with targeted interactive exercises."
            return f"Your roadmap adapted based on your latest performance and goal requirements for {role_name}. Every topic is dependency-ordered so you never hit a roadblock when tackling complex frameworks."

        if "javascript" in msg_lower or "js" in msg_lower:
            return "JavaScript is the core engine of modern full-stack development! Master asynchronous JS (Promises, async/await), DOM manipulation, and closures first—it will make learning React and Node.js ten times smoother."

        if "react" in msg_lower:
            return "For React, focus on declarative UI state management (`useState`, `useEffect`), component composition, and unidirectional data flow. Once your JavaScript fundamentals are solid, React concepts click naturally."

        if "ready" in msg_lower or "score" in msg_lower or "progress" in msg_lower:
            return f"You are currently at **{readiness:.1f}% job readiness** for {role_name}. Completing your upcoming milestone topics and scoring above 80% on practice quizzes will boost your readiness significantly!"

        if "hi" in msg_lower or "hello" in msg_lower or "hey" in msg_lower:
            return f"Hello! I am your AI Mentor at SkillPath AI. I'm actively tracking your progress towards {role_name}. How can I assist you with your learning path or doubts today?"

        return f"Great question! In your current path toward {role_name}, consistent hands-on coding and verifying concepts with practical mini-projects will accelerate your mastery. Let me know if you want targeted resource recommendations or practice challenges!"

    def parse_resume_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Parses resume text or project descriptions to extract skills, levels, and evidence.
        """
        found_skills = []
        text_lower = text.lower()
        
        skill_catalog = {
            "Python": (75, "Demonstrated in resume projects and scripting", ["python", "django", "flask", "pandas"]),
            "SQL": (70, "Database querying and schema design mentioned", ["sql", "postgres", "mysql", "sqlite"]),
            "HTML/CSS": (65, "Web layout and responsive UI styling", ["html", "css", "html5", "tailwind"]),
            "JavaScript": (50, "Frontend scripting and DOM handling", ["javascript", "js", "es6"]),
            "React": (40, "Component-based web applications", ["react", "redux", "nextjs"]),
            "Node.js": (40, "Backend REST service development", ["node", "nodejs", "express"]),
            "Docker": (50, "Containerization and local environments", ["docker", "container"]),
            "Git": (80, "Version control and GitHub workflows", ["git", "github", "gitlab"]),
            "Machine Learning": (60, "Model training and data pipelines", ["machine learning", "sklearn", "pytorch", "tensorflow"])
        }

        for skill, (default_level, evidence_tpl, keywords) in skill_catalog.items():
            if any(k in text_lower for k in keywords):
                found_skills.append({
                    "skill_name": skill,
                    "level": default_level,
                    "evidence": evidence_tpl,
                    "source": "resume"
                })

        return found_skills

llm_service = LLMService()

