from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AgentEvent, User
from app.schemas import AgentEventResponse
from app.security import get_current_user

router = APIRouter(prefix="/agents", tags=["Agent Activity"])

@router.get("/activity", response_model=List[AgentEventResponse])
def get_agent_activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(AgentEvent).filter(
        (AgentEvent.user_id == current_user.id) | (AgentEvent.user_id == None)
    ).order_by(AgentEvent.timestamp.desc()).limit(50).all()

    return events

