from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ChatMessage
from app.schemas import ChatRequest, ChatResponse
from app.security import get_current_user
from app.agents.mentor_agent import mentor_agent

router = APIRouter(prefix="/mentor", tags=["AI Mentor"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_mentor(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reply = mentor_agent.chat(db, current_user, req.message)
    return {
        "reply": reply,
        "agent_name": "MentorAgent",
        "timestamp": datetime.utcnow()
    }

@router.get("/history")
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.timestamp.asc()).all()
    
    return [
        {
            "id": m.id,
            "role": m.role,
            "agent_name": m.agent_name,
            "message": m.message,
            "timestamp": m.timestamp
        }
        for m in messages
    ]

