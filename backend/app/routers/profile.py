from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserSkill, Certification, Project
from app.schemas import ProfileUpdate, UserResponse
from app.security import get_current_user
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user

@router.put("", response_model=UserResponse)
def update_profile(profile_in: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if profile_in.name:
        current_user.name = profile_in.name
    if profile_in.hours_per_week:
        current_user.hours_per_week = profile_in.hours_per_week
    if profile_in.learning_style:
        current_user.learning_style = profile_in.learning_style

    if profile_in.skills is not None:
        # Update or add skills
        for s in profile_in.skills:
            existing = db.query(UserSkill).filter(
                UserSkill.user_id == current_user.id,
                UserSkill.skill_name == s.skill_name
            ).first()
            if existing:
                existing.level = s.level
                existing.evidence = s.evidence or existing.evidence
                existing.source = s.source or existing.source
            else:
                db.add(UserSkill(
                    user_id=current_user.id,
                    skill_name=s.skill_name,
                    level=s.level,
                    evidence=s.evidence or "Self-assessed",
                    source=s.source or "self"
                ))

    if profile_in.target_role_id and profile_in.target_role_id != current_user.current_role_id:
        orchestrator.handle_event("goal_changed", db, current_user, {"new_role_id": profile_in.target_role_id})

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/resume")
def upload_resume(resume_text: str = Form(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = orchestrator.handle_event("profile_created", db, current_user, {"resume_text": resume_text})
    return {"message": "Resume parsed and profile updated", "details": res}

