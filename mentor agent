from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models import User, ChatMessage, Roadmap, Attempt
from app.services.llm import llm_service

class MentorAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="MentorAgent")

    def chat(self, db: Session, user: User, user_message: str) -> str:
        # Build context
        roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()
        recent_attempt = db.query(Attempt).filter(Attempt.user_id == user.id).order_by(Attempt.timestamp.desc()).first()

        context = {
            "role_name": roadmap.role_name if roadmap else user.current_role_id,
            "readiness_score": roadmap.readiness_score if roadmap else 40.0,
            "recent_event": f"Attempted {recent_attempt.skill_name} with score {recent_attempt.score:.0f}%" if recent_attempt else "Profile initialized",
            "weak_subtopics": recent_attempt.weak_subtopics if recent_attempt else []
        }

        # Save user message
        db.add(ChatMessage(
            user_id=user.id,
            role="user",
            agent_name="User",
            message=user_message,
            timestamp=datetime.utcnow()
        ))
        db.commit()

        # Generate response
        reply = llm_service.generate_mentor_reply(context, user_message)

        # Save assistant message
        db.add(ChatMessage(
            user_id=user.id,
            role="assistant",
            agent_name="MentorAgent",
            message=reply,
            timestamp=datetime.utcnow()
        ))
        db.commit()

        self.log(
            db, user.id, "mentor_guidance_provided",
            f"User asked: '{user_message}'",
            f"Mentor advised: '{reply[:120]}...'"
        )

        return reply

mentor_agent = MentorAgent()

