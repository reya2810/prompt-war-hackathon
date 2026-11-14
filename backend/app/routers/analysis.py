from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import SkillAnalysisResponse
from app.security import get_current_user
from app.agents.gap_analyst_agent import gap_analyst_agent

router = APIRouter(prefix="/analysis", tags=["Skill Analysis"])

@router.get("", response_model=SkillAnalysisResponse)
def get_skill_analysis(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = gap_analyst_agent.analyze_gaps(db, current_user, current_user.current_role_id)
    return analysis

