from datetime import datetime
from sqlalchemy.orm import Session
from app.models import AgentEvent

class BaseAgent:
    def __init__(self, name: str):
        self.name = name

    def log(self, db: Session, user_id: int, event_type: str, input_summary: str, output_summary: str) -> AgentEvent:
        event = AgentEvent(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            event_type=event_type,
            agent_name=self.name,
            input_summary=input_summary,
            output_summary=output_summary
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
