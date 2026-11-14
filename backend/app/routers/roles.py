from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import JobRole, User
from app.schemas import JobRoleResponse
from app.security import get_current_user
from app.agents.orchestrator import orchestrator

router = APIRouter(tags=["Job Roles"])

class GoalRequest(BaseModel):
    role_id: str

@router.get("/roles", response_model=List[JobRoleResponse])
def get_job_roles(db: Session = Depends(get_db)):
    roles = db.query(JobRole).all()
    return roles

@router.post("/goal")
def set_target_goal(goal_req: GoalRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(JobRole).filter(JobRole.id == goal_req.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Target job role not found")

    result = orchestrator.handle_event("goal_changed", db, current_user, {"new_role_id": goal_req.role_id})
    return {
        "message": f"Career goal switched to {role.name}",
        "current_role_id": current_user.current_role_id,
        "actions_taken": result.get("actions_taken", [])
    }

