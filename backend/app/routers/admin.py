from typing import Dict, Any, List
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserSkill, JobRole, Roadmap, Attempt
from app.schemas import AdminCohortResponse, HeatmapCell
from app.security import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/cohort", response_model=AdminCohortResponse)
def get_cohort_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cohort_id = current_user.cohort_id or "cohort-2026-alpha"
    students = db.query(User).filter(User.cohort_id == cohort_id, User.role == "learner").all()
    total_students = len(students)

    student_ids = [s.id for s in students]
    all_user_skills = db.query(UserSkill).filter(UserSkill.user_id.in_(student_ids)).all()
    all_roadmaps = db.query(Roadmap).filter(Roadmap.user_id.in_(student_ids)).all()

    # Avg readiness
    readiness_list = [r.readiness_score for r in all_roadmaps if r.readiness_score]
    avg_readiness = round(sum(readiness_list) / len(readiness_list) if readiness_list else 45.0, 1)

    # Role distribution
    role_dist = defaultdict(int)
    for s in students:
        role_dist[s.current_role_id] += 1

    # Skill heatmap & gap aggregation
    skill_levels = defaultdict(list)
    for us in all_user_skills:
        skill_levels[us.skill_name].append(us.level)

    monitored_skills = ["JavaScript", "React", "Node.js", "Python", "SQL", "Docker", "Machine Learning", "Git"]
    heatmap = []
    top_gaps = []

    for s_name in monitored_skills:
        levels = skill_levels.get(s_name, [0])
        avg_lvl = round(sum(levels) / max(total_students, 1), 1)
        # Students with level < 50
        at_risk_count = len([lvl for lvl in levels if lvl < 50]) + (total_students - len(levels))
        gap_pct = round((at_risk_count / max(total_students, 1)) * 100.0, 1)

        heatmap.append({
            "skill": s_name,
            "avg_level": avg_lvl,
            "gap_percentage": gap_pct,
            "at_risk_students": at_risk_count
        })

        if gap_pct > 30:
            top_gaps.append({
                "skill": s_name,
                "gap_percentage": gap_pct,
                "at_risk_count": at_risk_count,
                "recommended_action": f"Schedule university workshop or guest lecture on {s_name} fundamentals."
            })

    top_gaps.sort(key=lambda x: x["gap_percentage"], reverse=True)

    # Identify at-risk learners
    at_risk_learners = []
    for s in students:
        rm = next((r for r in all_roadmaps if r.user_id == s.id), None)
        r_score = rm.readiness_score if rm else 35.0
        if r_score < 50.0:
            at_risk_learners.append({
                "id": s.id,
                "name": s.name,
                "email": s.email,
                "role": s.current_role_id,
                "readiness_score": r_score,
                "status": "High Risk" if r_score < 40 else "Moderate Risk",
                "recommended_nudge": "Assign peer mentor and schedule remedial milestone check-in."
            })

    return {
        "cohort_id": cohort_id,
        "total_students": total_students,
        "avg_readiness": avg_readiness,
        "top_skill_gaps": top_gaps,
        "at_risk_learners": at_risk_learners,
        "role_distribution": dict(role_dist),
        "skill_heatmap": heatmap
    }

