from typing import List, Dict, Any, Set
from collections import defaultdict, deque
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models import User, Roadmap, RoadmapItem, Skill, Resource, JobRole

class CurriculumAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="CurriculumAgent")

    def _topological_sort(self, skills_to_order: List[str], skill_prereqs_map: Dict[str, List[str]]) -> List[str]:
        """
        Orders skills so that prerequisites always come before dependent skills.
        """
        # Graph construction
        in_degree = {s: 0 for s in skills_to_order}
        graph = defaultdict(list)
        skills_set = set(skills_to_order)

        for s in skills_to_order:
            prereqs = skill_prereqs_map.get(s, [])
            for p in prereqs:
                if p in skills_set:
                    graph[p].append(s)
                    in_degree[s] += 1

        # Kahn's algorithm
        queue = deque([s for s in skills_to_order if in_degree[s] == 0])
        ordered = []

        while queue:
            node = queue.popleft()
            ordered.append(node)
            for neighbor in graph[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Fallback if circular dependency or remaining items
        for s in skills_to_order:
            if s not in ordered:
                ordered.append(s)

        return ordered

    def build_roadmap(self, db: Session, user: User, role_id: str, missing_skills: List[Dict[str, Any]], readiness_score: float) -> Roadmap:
        # Load skill objects and prerequisites
        all_skills = {s.name: s for s in db.query(Skill).all()}
        skill_prereqs_map = {name: s.prerequisites or [] for name, s in all_skills.items()}

        skill_names = [m["skill"] for m in missing_skills]
        
        # If user has few or no missing skills, add advanced/project topics
        if not skill_names:
            skill_names = ["Advanced System Design", "Production CI/CD Pipelines", "Capstone Portfolio Project"]

        # Topologically sort
        ordered_skills = self._topological_sort(skill_names, skill_prereqs_map)

        # Fetch or create user's active roadmap
        roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()

        job_role = db.query(JobRole).filter(JobRole.id == role_id).first()
        role_name = job_role.name if job_role else "Target Role"

        if not roadmap:
            roadmap = Roadmap(
                user_id=user.id,
                target_role_id=role_id,
                role_name=role_name,
                total_weeks=max(len(ordered_skills), 4),
                readiness_score=readiness_score
            )
            db.add(roadmap)
            db.commit()
            db.refresh(roadmap)
        else:
            roadmap.target_role_id = role_id
            roadmap.role_name = role_name
            roadmap.readiness_score = readiness_score
            # Clear old items to rebuild
            db.query(RoadmapItem).filter(RoadmapItem.roadmap_id == roadmap.id).delete()
            db.commit()

        # Build items week-by-week
        # Factor in weekly hours: standard topic ~ 8-10 hours. If hours_per_week < 8, spread topics.
        pace_multiplier = max(1, round(10 / max(user.hours_per_week, 4)))

        items = []
        for idx, skill_name in enumerate(ordered_skills):
            week_num = (idx * pace_multiplier) + 1
            status = "in_progress" if idx == 0 else "locked"
            
            # Prereq reason tag
            prereqs = skill_prereqs_map.get(skill_name, [])
            reason = f"Prerequisite for {', '.join(prereqs[:2])}" if prereqs else "Core requirement for role"
            
            # Fetch resources for this skill
            skill_res = db.query(Resource).filter(Resource.skill_name == skill_name).all()
            resources_data = [
                {
                    "title": r.title,
                    "type": r.type,
                    "url": r.url,
                    "difficulty": r.difficulty,
                    "duration": r.duration
                } for r in skill_res
            ]
            if not resources_data:
                resources_data = [
                    {"title": f"Complete {skill_name} Guide", "type": "docs", "url": f"https://developer.mozilla.org/en-US/search?q={skill_name}", "difficulty": "intermediate", "duration": "2 hours"},
                    {"title": f"Building with {skill_name}", "type": "video", "url": f"https://youtube.com/results?search_query={skill_name}+crash+course", "difficulty": "beginner", "duration": "1.5 hours"},
                    {"title": f"{skill_name} Interactive Exercises", "type": "exercise", "url": "https://exercism.org", "difficulty": "beginner", "duration": "3 hours"}
                ]

            practice_task = {
                "title": f"Hands-on Milestone: {skill_name}",
                "description": f"Build a practical micro-project demonstrating {skill_name} core patterns and state handling.",
                "starter_code": f"// Starter template for {skill_name}\nfunction initTask() {{\n  console.log('Implement {skill_name} challenge');\n}}\ninitTask();",
                "instructions": [
                    f"Implement the fundamental data structures and logic for {skill_name}.",
                    "Ensure edge cases and error handling are accounted for.",
                    "Verify with local unit tests or mini-server execution."
                ]
            }

            item = RoadmapItem(
                roadmap_id=roadmap.id,
                skill_name=skill_name,
                order=idx + 1,
                week=week_num,
                status=status,
                reason=reason,
                practice_task=practice_task,
                resources=resources_data
            )
            db.add(item)
            items.append(item)

        roadmap.total_weeks = items[-1].week if items else 12
        db.commit()

        input_desc = f"Building dependency roadmap for {len(ordered_skills)} skills with weekly load {user.hours_per_week}h/wk."
        output_desc = f"Generated {len(items)}-week topological path. Initial topic: '{ordered_skills[0] if ordered_skills else 'N/A'}' (in_progress)."
        self.log(db, user.id, "roadmap_generated", input_desc, output_desc)

        return roadmap

    def adapt_for_low_score(self, db: Session, user: User, skill_name: str, score: float, weak_subtopics: List[str]):
        """
        Inserts remedial review topics and easier resources before advancing.
        """
        roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).first()
        if not roadmap:
            return

        remedial_title = f"{skill_name} Fundamentals & Review"
        existing_remedial = db.query(RoadmapItem).filter(
            RoadmapItem.roadmap_id == roadmap.id,
            RoadmapItem.skill_name == remedial_title
        ).first()

        if not existing_remedial:
            # Find the target item
            target_item = db.query(RoadmapItem).filter(
                RoadmapItem.roadmap_id == roadmap.id,
                RoadmapItem.skill_name == skill_name
            ).first()

            insert_order = target_item.order if target_item else 1
            insert_week = target_item.week if target_item else 1

            # Shift subsequent items
            subsequent = db.query(RoadmapItem).filter(
                RoadmapItem.roadmap_id == roadmap.id,
                RoadmapItem.order >= insert_order
            ).all()
            for s in subsequent:
                s.order += 1
                s.week += 1

            weak_text = f" ({', '.join(weak_subtopics)})" if weak_subtopics else ""
            remedial_item = RoadmapItem(
                roadmap_id=roadmap.id,
                skill_name=remedial_title,
                order=insert_order,
                week=insert_week,
                status="in_progress",
                reason=f"Inserted remedial topic: Low quiz score ({score:.0f}%){weak_text}",
                practice_task={
                    "title": f"Targeted Drills: {skill_name} Core Concepts",
                    "description": f"Focused remediation on {', '.join(weak_subtopics) if weak_subtopics else 'foundational patterns'}.",
                    "starter_code": f"// Remedial exercises for {skill_name}\n// Fix the implementation to master fundamentals\n",
                    "instructions": ["Step-by-step interactive breakdown", "Review guided code walkthrough"]
                },
                resources=[
                    {"title": f"{skill_name} Made Simple: Deep Dive", "type": "video", "url": "https://youtube.com", "difficulty": "beginner", "duration": "45 mins"},
                    {"title": f"{skill_name} Interactive Playground Drills", "type": "exercise", "url": "https://exercism.org", "difficulty": "beginner", "duration": "1 hour"}
                ]
            )
            db.add(remedial_item)
            roadmap.total_weeks += 1
            db.commit()

            input_desc = f"Learner scored {score:.1f}% on {skill_name} assessment. Weak areas: {weak_subtopics}."
            output_desc = f"Inserted '{remedial_title}' at week {insert_week} with reason: 'Low quiz score ({score:.0f}%)'. Subsequent topics postponed by 1 week."
            self.log(db, user.id, "curriculum_remedial_inserted", input_desc, output_desc)

curriculum_agent = CurriculumAgent()
