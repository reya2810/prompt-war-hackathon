from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models import User, UserSkill, JobRole, Skill

class GapAnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="GapAnalyst")

    def analyze_gaps(self, db: Session, user: User, role_id: str) -> Dict[str, Any]:
        job_role = db.query(JobRole).filter(JobRole.id == role_id).first()
        if not job_role:
            job_role = db.query(JobRole).first()

        user_skills_map = {
            s.skill_name.lower(): s
            for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
        }

        # Load all skills to inspect prerequisite graph
        all_skills = {s.name.lower(): s for s in db.query(Skill).all()}

        required_skills = job_role.required_skills or []
        
        total_weight = 0.0
        weighted_user_score = 0.0
        
        radar_data = []
        strengths = []
        weaknesses = []
        matched_skills = []
        missing_skills = []
        evidence_breakdown = []

        # First pass: calculate base gap items and find which skills are needed
        needed_skill_names = {r["skill"].lower() for r in required_skills}

        for req in required_skills:
            s_name = req["skill"]
            s_key = s_name.lower()
            weight = float(req.get("weight", 3))
            req_level = float(req.get("required_level", 80))
            total_weight += weight

            user_skill = user_skills_map.get(s_key)
            current_level = float(user_skill.level) if user_skill else 0.0
            evidence = user_skill.evidence if user_skill else "No direct evidence provided"
            source = user_skill.source if user_skill else "none"

            # Readiness calculation: min(user_level / required_level, 1.0)
            ratio = min(current_level / req_level, 1.0) if req_level > 0 else 1.0
            weighted_user_score += weight * ratio

            radar_data.append({
                "skill": s_name,
                "current": int(current_level),
                "required": int(req_level),
                "fullMark": 100
            })

            # Check if this skill is a prerequisite of other needed skills
            is_prereq = False
            prereqs_of_this = []
            if s_key in all_skills:
                prereqs_of_this = all_skills[s_key].prerequisites or []
                
            for other_k in needed_skill_names:
                if other_k in all_skills:
                    other_prereqs = [p.lower() for p in (all_skills[other_k].prerequisites or [])]
                    if s_key in other_prereqs:
                        is_prereq = True
                        break

            level_diff = max(0.0, req_level - current_level)
            # Boost if it is a prerequisite for other missing skills
            boost_factor = 1.35 if is_prereq else 1.0
            gap_score = weight * level_diff * boost_factor

            status = "matched" if current_level >= req_level else ("gap" if current_level < 50 else "in_progress")
            
            if current_level >= 70:
                strengths.append(s_name)
            elif current_level < 60:
                weaknesses.append(s_name)

            if current_level >= req_level * 0.75:
                matched_skills.append({
                    "skill": s_name,
                    "level": int(current_level),
                    "required_level": int(req_level),
                    "evidence": evidence,
                    "source": source,
                    "status": "matched"
                })
            else:
                missing_skills.append({
                    "skill": s_name,
                    "weight": int(weight),
                    "current_level": int(current_level),
                    "required_level": int(req_level),
                    "gap_score": round(gap_score, 2),
                    "is_prerequisite": is_prereq,
                    "prerequisites": prereqs_of_this
                })

            evidence_breakdown.append({
                "skill": s_name,
                "current_level": int(current_level),
                "required_level": int(req_level),
                "evidence": evidence,
                "source": source
            })

        readiness_score = (weighted_user_score / total_weight * 100.0) if total_weight > 0 else 0.0
        readiness_score = round(min(100.0, max(0.0, readiness_score)), 1)

        # Sort missing skills by gap_score descending (priority)
        missing_skills.sort(key=lambda x: x["gap_score"], reverse=True)

        input_desc = f"Comparing {len(user_skills_map)} learner skills against {len(required_skills)} requirements for {job_role.name}."
        top_gaps = [m["skill"] for m in missing_skills[:3]]
        output_desc = f"Readiness Score: {readiness_score}%. Matched: {len(matched_skills)}, Gaps: {len(missing_skills)}. Priority gaps: {', '.join(top_gaps)}."

        self.log(db, user.id, "gap_analysis_computed", input_desc, output_desc)

        return {
            "role_id": job_role.id,
            "role_name": job_role.name,
            "readiness_score": readiness_score,
            "radar_data": radar_data,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "evidence_breakdown": evidence_breakdown
        }

gap_analyst_agent = GapAnalystAgent()

