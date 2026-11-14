from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models import User, Assessment, Attempt, UserSkill

class AssessmentAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="AssessmentAgent")

    def grade_assessment(self, db: Session, user: User, skill_name: str, answers: Dict[str, int]) -> Dict[str, Any]:
        assessment = db.query(Assessment).filter(Assessment.skill_name == skill_name).first()
        if not assessment:
            # Fallback mock assessment
            questions = [
                {
                    "id": 1,
                    "question": f"What is a primary best practice when developing with {skill_name}?",
                    "options": ["Monolithic coupling", "Modular architecture and separation of concerns", "Avoiding tests", "Hardcoding variables"],
                    "correct_answer": 1,
                    "subtopic": "Architecture"
                },
                {
                    "id": 2,
                    "question": f"How do you handle asynchronous operations in {skill_name}?",
                    "options": ["Blocking the main thread", "Promises / async-await patterns", "Infinite busy-wait loops", "Restarting the app"],
                    "correct_answer": 1,
                    "subtopic": "Asynchronous Control"
                },
                {
                    "id": 3,
                    "question": f"Which pattern is recommended for error resilience in {skill_name}?",
                    "options": ["Silently ignoring exceptions", "Structured try/catch and error boundary handlers", "Crashing immediately", "Disabling logs"],
                    "correct_answer": 1,
                    "subtopic": "Error Handling"
                }
            ]
        else:
            questions = assessment.questions or []

        total_questions = len(questions)
        correct_count = 0
        weak_subtopics_set = set()

        for q in questions:
            q_id_str = str(q["id"])
            correct_idx = q.get("correct_answer", 0)
            user_ans = answers.get(q_id_str)

            if user_ans is not None and int(user_ans) == int(correct_idx):
                correct_count += 1
            else:
                sub = q.get("subtopic", "Core Fundamentals")
                weak_subtopics_set.add(sub)

        score = (correct_count / total_questions * 100.0) if total_questions > 0 else 0.0
        score = round(score, 1)
        weak_subtopics = list(weak_subtopics_set)

        passed = score >= 60.0
        if score >= 80.0:
            feedback = f"Outstanding performance! You scored {score}% and demonstrated strong mastery of {skill_name}."
        elif score >= 60.0:
            feedback = f"Good effort! You scored {score}%. You understand the core, but would benefit from reinforcing {', '.join(weak_subtopics) if weak_subtopics else 'intermediate patterns'}."
        else:
            feedback = f"Needs review: scored {score}%. We detected knowledge gaps in: {', '.join(weak_subtopics) if weak_subtopics else 'fundamentals'}. Remedial exercises will be scheduled."

        # Save Attempt in DB
        attempt = Attempt(
            user_id=user.id,
            assessment_id=assessment.id if assessment else None,
            skill_name=skill_name,
            score=score,
            weak_subtopics=weak_subtopics,
            feedback=feedback,
            answers=answers
        )
        db.add(attempt)

        # Update UserSkill proficiency level based on assessment
        user_skill = db.query(UserSkill).filter(
            UserSkill.user_id == user.id,
            UserSkill.skill_name == skill_name
        ).first()

        new_level = int(score)
        if user_skill:
            user_skill.level = new_level
            user_skill.evidence = f"Scored {score:.0f}% on auto-graded assessment. Weak subtopics: {', '.join(weak_subtopics) if weak_subtopics else 'none'}."
            user_skill.source = "quiz"
        else:
            new_skill = UserSkill(
                user_id=user.id,
                skill_name=skill_name,
                level=new_level,
                evidence=f"Scored {score:.0f}% on assessment.",
                source="quiz"
            )
            db.add(new_skill)

        db.commit()

        input_desc = f"Grading attempt for '{skill_name}': {len(answers)} answers submitted against {total_questions} questions."
        output_desc = f"Result: {score}% ({'PASSED' if passed else 'FAILED'}). Identified weak subtopics: {weak_subtopics}. Level updated to {new_level}."
        self.log(db, user.id, "assessment_graded", input_desc, output_desc)

        return {
            "skill_name": skill_name,
            "score": score,
            "passed": passed,
            "weak_subtopics": weak_subtopics,
            "feedback": feedback
        }

assessment_agent = AssessmentAgent()

