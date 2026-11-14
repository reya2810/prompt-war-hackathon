from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Assessment
from app.schemas import AssessmentResponse, QuizSubmitRequest, QuizResultResponse
from app.security import get_current_user
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("/{skill_name}", response_model=AssessmentResponse)
def get_assessment(skill_name: str, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.skill_name.ilike(skill_name)).first()
    if not assessment:
        # Generate dynamic template if not seeded
        return {
            "id": 999,
            "skill_name": skill_name,
            "title": f"{skill_name} Concept Mastery & Code Assessment",
            "difficulty": "intermediate",
            "questions": [
                {
                    "id": 1,
                    "question": f"Which pattern represents the core architecture of {skill_name}?",
                    "options": [
                        "Direct coupling between all modules",
                        "Modular separation of concerns and single responsibility",
                        "Avoiding error handling",
                        "Hardcoded synchronous locks"
                    ],
                    "subtopic": "Architecture & Clean Code"
                },
                {
                    "id": 2,
                    "question": f"How should edge cases and exceptions be handled in {skill_name}?",
                    "options": [
                        "Ignore exceptions silently",
                        "Structured try-catch blocks with contextual logging and recovery",
                        "Terminate process immediately without cleanup",
                        "Disable logging in production"
                    ],
                    "subtopic": "Error Resilience"
                },
                {
                    "id": 3,
                    "question": f"What is the best practice for testing logic in {skill_name}?",
                    "options": [
                        "Manual testing only on production",
                        "Automated unit, integration, and contract tests",
                        "Assuming code works if it compiles",
                        "Removing assertion libraries"
                    ],
                    "subtopic": "Testing & Verification"
                }
            ]
        }

    return {
        "id": assessment.id,
        "skill_name": assessment.skill_name,
        "title": assessment.title,
        "difficulty": assessment.difficulty,
        "questions": assessment.questions
    }

@router.post("/{skill_name}/submit", response_model=QuizResultResponse)
def submit_assessment(
    skill_name: str,
    submission: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = orchestrator.handle_event(
        "assessment_submitted",
        db,
        current_user,
        {"skill_name": skill_name, "answers": submission.answers}
    )

    grade = result.get("grade", {})
    return {
        "skill_name": skill_name,
        "score": grade.get("score", 0.0),
        "passed": grade.get("passed", False),
        "weak_subtopics": grade.get("weak_subtopics", []),
        "feedback": grade.get("feedback", ""),
        "roadmap_updated": result.get("roadmap_updated", False),
        "explanation": result.get("explanation", "")
    }

