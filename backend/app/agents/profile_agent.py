from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models import User, UserSkill
from app.services.llm import llm_service

class ProfileAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="ProfileAgent")

    def process_profile(self, db: Session, user: User, resume_text: str = None) -> List[Dict[str, Any]]:
        input_desc = f"Parsing profile for user {user.name} ({user.email}). Resume provided: {bool(resume_text)}"
        
        extracted_skills = []
        if resume_text:
            extracted_skills = llm_service.parse_resume_text(resume_text)
            for item in extracted_skills:
                existing = db.query(UserSkill).filter(
                    UserSkill.user_id == user.id,
                    UserSkill.skill_name == item["skill_name"]
                ).first()
                if existing:
                    existing.level = max(existing.level, item["level"])
                    existing.evidence = item["evidence"]
                    existing.source = "resume"
                else:
                    new_skill = UserSkill(
                        user_id=user.id,
                        skill_name=item["skill_name"],
                        level=item["level"],
                        evidence=item["evidence"],
                        source="resume"
                    )
                    db.add(new_skill)
            db.commit()

        current_skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
        output_desc = f"Identified {len(current_skills)} structured skills with proficiency levels & evidence."
        
        self.log(db, user.id, "profile_processed", input_desc, output_desc)
        return [{"skill_name": s.skill_name, "level": s.level, "evidence": s.evidence} for s in current_skills]

profile_agent = ProfileAgent()

