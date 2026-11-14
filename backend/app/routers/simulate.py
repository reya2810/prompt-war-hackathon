from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, JobRole, UserSkill
from app.schemas import SimulationRequest, SimulationResponse
from app.security import get_current_user

router = APIRouter(prefix="/simulate", tags=["Career Simulator"])

@router.post("", response_model=SimulationResponse)
def simulate_career_impact(
    sim_req: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_role_id = sim_req.role_id or current_user.current_role_id
    job_role = db.query(JobRole).filter(JobRole.id == target_role_id).first()
    if not job_role:
        job_role = db.query(JobRole).first()

    required_skills = job_role.required_skills or []
    user_skills = {
        s.skill_name.lower(): s.level
        for s in db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    }

    # Current readiness
    total_weight = sum([r.get("weight", 3) for r in required_skills])
    current_weighted = 0.0
    for req in required_skills:
        w = req.get("weight", 3)
        req_lvl = req.get("required_level", 80)
        curr_lvl = user_skills.get(req["skill"].lower(), 0)
        ratio = min(curr_lvl / req_lvl, 1.0) if req_lvl > 0 else 1.0
        current_weighted += w * ratio

    current_readiness = round((current_weighted / total_weight * 100.0) if total_weight > 0 else 0.0, 1)

    # Simulated readiness with added skill
    simulated_skills = dict(user_skills)
    sim_skill_name = sim_req.skill_to_add
    simulated_skills[sim_skill_name.lower()] = sim_req.target_level

    sim_weighted = 0.0
    found_in_role = False
    for req in required_skills:
        w = req.get("weight", 3)
        req_lvl = req.get("required_level", 80)
        lvl = simulated_skills.get(req["skill"].lower(), 0)
        if req["skill"].lower() == sim_skill_name.lower():
            found_in_role = True
        ratio = min(lvl / req_lvl, 1.0) if req_lvl > 0 else 1.0
        sim_weighted += w * ratio

    projected_readiness = round((sim_weighted / total_weight * 100.0) if total_weight > 0 else 0.0, 1)
    delta = round(projected_readiness - current_readiness, 1)

    if found_in_role:
        impact = f"Mastering '{sim_skill_name}' directly satisfies a core requirement for {job_role.name}, elevating your job readiness by +{delta}%!"
    else:
        impact = f"'{sim_skill_name}' provides valuable complementary domain knowledge, though it isn't currently a primary required competency for {job_role.name}."

    return {
        "skill_added": sim_skill_name,
        "target_level": sim_req.target_level,
        "current_readiness": current_readiness,
        "projected_readiness": projected_readiness,
        "delta": delta,
        "impact_description": impact
    }

