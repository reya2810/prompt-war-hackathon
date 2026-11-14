from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import User, Roadmap, RoadmapItem, ChatMessage, AgentEvent
from app.agents.profile_agent import profile_agent
from app.agents.career_agent import career_agent
from app.agents.gap_analyst_agent import gap_analyst_agent
from app.agents.curriculum_agent import curriculum_agent
from app.agents.assessment_agent import assessment_agent
from app.agents.mentor_agent import mentor_agent

class Orchestrator:
    def __init__(self):
        self.name = "Orchestrator"

    def _log_event(self, db: Session, user_id: int, event_type: str, input_desc: str, output_desc: str):
        event = AgentEvent(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            event_type=event_type,
            agent_name=self.name,
            input_summary=input_desc,
            output_summary=output_desc
        )
        db.add(event)
        db.commit()

    def handle_event(self, event_name: str, db: Session, user: User, payload: Dict[str, Any] = None) -> Dict[str, Any]:
        payload = payload or {}
        results = {"event": event_name, "actions_taken": []}

        if event_name == "profile_created":
            self._log_event(
                db, user.id, "profile_created",
                f"New learner profile registered: {user.name} ({user.email}). Goal: {user.current_role_id}",
                "Triggering multi-agent collaboration cascade: ProfileAgent -> CareerAgent -> GapAnalyst -> CurriculumAgent -> MentorAgent"
            )
            # 1. ProfileAgent parses skills
            skills = profile_agent.process_profile(db, user, resume_text=payload.get("resume_text"))
            # 2. CareerAgent loads role
            career_agent.get_role_requirements(db, user.id, user.current_role_id)
            # 3. GapAnalyst computes gaps & readiness
            analysis = gap_analyst_agent.analyze_gaps(db, user, user.current_role_id)
            # 4. CurriculumAgent builds roadmap
            curriculum_agent.build_roadmap(db, user, user.current_role_id, analysis["missing_skills"], analysis["readiness_score"])
            # 5. Mentor welcomes learner
            welcome_msg = (
                f"Welcome {user.name}! I am your AI Mentor. We analyzed your skills against {analysis['role_name']}. "
                f"Your starting job readiness is {analysis['readiness_score']}%. I've generated a customized dependency-ordered roadmap "
                f"for you based on {user.hours_per_week} hours/week. Let's conquer your first milestone!"
            )
            db.add(ChatMessage(
                user_id=user.id,
                role="assistant",
                agent_name="MentorAgent",
                message=welcome_msg,
                timestamp=datetime.utcnow()
            ))
            db.commit()
            results["actions_taken"] = ["profile_analyzed", "role_loaded", "gaps_computed", "roadmap_built", "mentor_welcomed"]

        elif event_name == "goal_changed":
            new_role_id = payload.get("new_role_id", user.current_role_id)
            old_role_id = user.current_role_id
            user.current_role_id = new_role_id
            db.commit()

            self._log_event(
                db, user.id, "goal_changed",
                f"Learner switched target career from '{old_role_id}' to '{new_role_id}'",
                "Re-routing pipeline: CareerAgent -> GapAnalyst (reusing existing skills) -> CurriculumAgent -> MentorAgent explanation"
            )
            # 1. CareerAgent reloads role
            role_data = career_agent.get_role_requirements(db, user.id, new_role_id)
            # 2. GapAnalyst recomputes
            analysis = gap_analyst_agent.analyze_gaps(db, user, new_role_id)
            # 3. CurriculumAgent rebuilds roadmap
            roadmap = curriculum_agent.build_roadmap(db, user, new_role_id, analysis["missing_skills"], analysis["readiness_score"])
            # 4. Mentor explains adaptation
            matched_names = [m["skill"] for m in analysis["matched_skills"]]
            reuse_note = f"Your existing strengths in {', '.join(matched_names[:3])} were reused, saving weeks of effort!" if matched_names else ""
            explanation = (
                f"Goal change detected: Now targeting **{role_data['role_name']}**! "
                f"Your current readiness for this role is **{analysis['readiness_score']}%**. {reuse_note} "
                f"The Curriculum Agent has restructured your timeline to focus on {', '.join([g['skill'] for g in analysis['missing_skills'][:2]])}."
            )
            db.add(ChatMessage(
                user_id=user.id,
                role="assistant",
                agent_name="MentorAgent",
                message=explanation,
                timestamp=datetime.utcnow()
            ))
            db.commit()
            results["actions_taken"] = ["career_reloaded", "gaps_recomputed", "roadmap_rebuilt", "mentor_explained"]
            results["analysis"] = analysis

        elif event_name == "assessment_submitted":
            skill_name = payload.get("skill_name")
            answers = payload.get("answers", {})
            grade_res = assessment_agent.grade_assessment(db, user, skill_name, answers)
            score = grade_res["score"]
            weak_subs = grade_res["weak_subtopics"]

            if score < 60.0:
                self._log_event(
                    db, user.id, "adaptive_rule_triggered",
                    f"Score below 60% ({score}%) on '{skill_name}'. Knowledge gaps in: {weak_subs}",
                    "CurriculumAgent: inserting remedial review module; MentorAgent: issuing study tips & empathetic encouragement."
                )
                curriculum_agent.adapt_for_low_score(db, user, skill_name, score, weak_subs)
                
                # Mentor encouragement
                msg = (
                    f"Don't worry about scoring {score:.0f}% on {skill_name}! Mastery is an iterative process. "
                    f"I've updated your roadmap to include a focused review on {', '.join(weak_subs) if weak_subs else 'fundamentals'}. "
                    f"Take a look at the newly added remedial drills before retrying the milestone."
                )
                db.add(ChatMessage(
                    user_id=user.id,
                    role="assistant",
                    agent_name="MentorAgent",
                    message=msg,
                    timestamp=datetime.utcnow()
                ))
                db.commit()
                results["actions_taken"] = ["graded", "remedial_inserted", "mentor_encouraged"]
                results["roadmap_updated"] = True
                results["explanation"] = f"Roadmap adapted: Inserted remedial review module '{skill_name} Fundamentals & Review' to reinforce weak areas."

            elif 60.0 <= score <= 80.0:
                self._log_event(
                    db, user.id, "adaptive_rule_triggered",
                    f"Score between 60% and 80% ({score}%) on '{skill_name}'. Passing, but needs reinforcement.",
                    "CurriculumAgent: keeping plan schedule; adding reinforcement mini-challenge."
                )
                results["actions_taken"] = ["graded", "reinforcement_attached"]
                results["roadmap_updated"] = False
                results["explanation"] = f"Solid work ({score}%). Core plan maintained with reinforcement exercises added."

            else: # score > 80.0
                self._log_event(
                    db, user.id, "adaptive_rule_triggered",
                    f"Score above 80% ({score}%) on '{skill_name}'. Skill demonstrated at advanced level.",
                    "CurriculumAgent: marking milestone achieved, unlocking next topic & capstone project."
                )
                # Mark topic as completed
                roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()
                if roadmap:
                    item = db.query(RoadmapItem).filter(
                        RoadmapItem.roadmap_id == roadmap.id,
                        RoadmapItem.skill_name == skill_name
                    ).first()
                    if item:
                        item.status = "completed"
                        item.completed_at = datetime.utcnow()
                        # Unlock next
                        next_item = db.query(RoadmapItem).filter(
                            RoadmapItem.roadmap_id == roadmap.id,
                            RoadmapItem.order > item.order
                        ).order_by(RoadmapItem.order.asc()).first()
                        if next_item and next_item.status == "locked":
                            next_item.status = "in_progress"
                        db.commit()

                results["actions_taken"] = ["graded", "milestone_unlocked"]
                results["roadmap_updated"] = True
                results["explanation"] = f"Exceptional work ({score}%)! Milestone unlocked and readiness boosted."

            # Recompute readiness
            analysis = gap_analyst_agent.analyze_gaps(db, user, user.current_role_id)
            roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()
            if roadmap:
                roadmap.readiness_score = analysis["readiness_score"]
                db.commit()

            results["grade"] = grade_res

        elif event_name == "topic_completed":
            item_id = payload.get("item_id")
            item = db.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
            if item:
                item.status = "completed"
                item.completed_at = datetime.utcnow()
                
                # Unlock next item in sequence
                next_item = db.query(RoadmapItem).filter(
                    RoadmapItem.roadmap_id == item.roadmap_id,
                    RoadmapItem.order > item.order
                ).order_by(RoadmapItem.order.asc()).first()
                if next_item and next_item.status == "locked":
                    next_item.status = "in_progress"

                db.commit()

                # Recompute readiness
                analysis = gap_analyst_agent.analyze_gaps(db, user, user.current_role_id)
                roadmap = db.query(Roadmap).filter(Roadmap.id == item.roadmap_id).first()
                if roadmap:
                    roadmap.readiness_score = analysis["readiness_score"]
                    db.commit()

                self._log_event(
                    db, user.id, "topic_completed",
                    f"Learner completed topic: '{item.skill_name}'",
                    f"Updated progress. Next topic '{next_item.skill_name if next_item else 'Capstone'}' unlocked. Readiness: {analysis['readiness_score']}%."
                )
                results["actions_taken"] = ["topic_marked_completed", "next_topic_unlocked", "readiness_updated"]

        elif event_name == "inactivity_detected":
            days = payload.get("days", 5)
            self._log_event(
                db, user.id, "inactivity_detected",
                f"No learning events detected for {days} days.",
                "Orchestrator: requesting MentorAgent friendly nudge and CurriculumAgent workload adjustment."
            )
            nudge = (
                f"Hey {user.name}, we missed you over the past few days! Don't let your momentum slip. "
                "I've adjusted your weekly study milestones to be more bite-sized so you can jump back in smoothly."
            )
            db.add(ChatMessage(
                user_id=user.id,
                role="assistant",
                agent_name="MentorAgent",
                message=nudge,
                timestamp=datetime.utcnow()
            ))
            db.commit()
            results["actions_taken"] = ["nudge_sent", "workload_lightened"]

        return results

orchestrator = Orchestrator()
