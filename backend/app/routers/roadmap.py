from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Roadmap, RoadmapItem
from app.schemas import RoadmapResponse
from app.security import get_current_user
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

@router.get("", response_model=RoadmapResponse)
def get_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Roadmap.target_role_id == current_user.current_role_id
    ).first()

    if not roadmap:
        # If not built yet, run profile_created to ensure it is generated
        orchestrator.handle_event("profile_created", db, current_user)
        roadmap = db.query(Roadmap).filter(
            Roadmap.user_id == current_user.id,
            Roadmap.target_role_id == current_user.current_role_id
        ).first()

    items = db.query(RoadmapItem).filter(RoadmapItem.roadmap_id == roadmap.id).order_by(RoadmapItem.order.asc()).all()
    
    return {
        "id": roadmap.id,
        "user_id": roadmap.user_id,
        "target_role_id": roadmap.target_role_id,
        "role_name": roadmap.role_name,
        "total_weeks": roadmap.total_weeks,
        "readiness_score": roadmap.readiness_score,
        "items": items
    }

@router.post("/{item_id}/complete")
def complete_roadmap_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap topic item not found")

    res = orchestrator.handle_event("topic_completed", db, current_user, {"item_id": item_id})
    return {"message": f"Topic '{item.skill_name}' marked as complete", "result": res}

