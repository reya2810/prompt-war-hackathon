import unittest
from app.database import SessionLocal
from app.models import User, Roadmap, RoadmapItem, AgentEvent
from app.agents.orchestrator import orchestrator
from app.agents.gap_analyst_agent import gap_analyst_agent
from app.agents.career_agent import career_agent
from app.agents.curriculum_agent import curriculum_agent
from app.agents.assessment_agent import assessment_agent
from app.routers.simulate import simulate_career_impact
from app.routers.admin import get_cohort_analytics
from app.schemas import SimulationRequest

class TestSkillPathAI(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()
        self.user = self.db.query(User).filter(User.email == "student@skillpath.ai").first()
        self.assertIsNotNone(self.user, "Demo student should exist in seeded database")
        # Ensure fresh baseline for full-stack-developer
        self.user.current_role_id = "full-stack-developer"
        self.db.commit()
        orchestrator.handle_event("profile_created", self.db, self.user)

    def tearDown(self):
        self.db.close()

    def test_01_profile_and_gap_analysis(self):
        """Phase 1 & 2: Verify Alex Rivera has gaps in JavaScript, React, Node.js and readiness is calculated."""
        analysis = gap_analyst_agent.analyze_gaps(self.db, self.user, "full-stack-developer")
        
        self.assertEqual(analysis["role_id"], "full-stack-developer")
        self.assertGreater(analysis["readiness_score"], 15.0)
        self.assertLess(analysis["readiness_score"], 60.0)
        
        missing_names = [m["skill"] for m in analysis["missing_skills"]]
        self.assertIn("JavaScript", missing_names)
        self.assertIn("React", missing_names)
        self.assertIn("Node.js", missing_names)
        
        # Verify matched skills for Full Stack include HTML/CSS and SQL
        matched_names = [m["skill"] for m in analysis["matched_skills"]]
        self.assertIn("HTML/CSS", matched_names)
        self.assertIn("SQL", matched_names)
        print(f"[TEST 1 PASS] Readiness: {analysis['readiness_score']}%, Missing Gaps: {missing_names}")

    def test_02_dependency_ordered_roadmap(self):
        """Phase 3: Verify CurriculumAgent produces a topologically sorted roadmap (JS before React & Node)."""
        roadmap = self.db.query(Roadmap).filter(
            Roadmap.user_id == self.user.id,
            Roadmap.target_role_id == "full-stack-developer"
        ).first()
        self.assertIsNotNone(roadmap)
        
        items = self.db.query(RoadmapItem).filter(RoadmapItem.roadmap_id == roadmap.id).order_by(RoadmapItem.order.asc()).all()
        item_names = [i.skill_name for i in items]
        
        # Prerequisite check: JavaScript must precede React and Node.js
        self.assertIn("JavaScript", item_names)
        self.assertIn("React", item_names)
        self.assertIn("Node.js", item_names)
        
        js_idx = item_names.index("JavaScript")
        react_idx = item_names.index("React")
        node_idx = item_names.index("Node.js")
        
        self.assertLess(js_idx, react_idx, "JavaScript must be ordered before React")
        self.assertLess(js_idx, node_idx, "JavaScript must be ordered before Node.js")
        print(f"[TEST 2 PASS] Topological roadmap order verified: {item_names}")

    def test_03_assessment_adaptation_for_low_score(self):
        """Phase 4 & 5: Take JavaScript quiz, fail on purpose (< 60%), verify remedial insertion and agent event."""
        wrong_answers = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        result = orchestrator.handle_event(
            "assessment_submitted",
            self.db,
            self.user,
            {"skill_name": "JavaScript", "answers": wrong_answers}
        )
        
        self.assertTrue(result["roadmap_updated"])
        self.assertIn("remedial", result["explanation"].lower())
        
        # Verify remedial item inserted in roadmap
        roadmap = self.db.query(Roadmap).filter(Roadmap.user_id == self.user.id).first()
        items = self.db.query(RoadmapItem).filter(RoadmapItem.roadmap_id == roadmap.id).order_by(RoadmapItem.order.asc()).all()
        item_names = [i.skill_name for i in items]
        
        has_remedial = any("Fundamentals & Review" in name for name in item_names)
        self.assertTrue(has_remedial, f"Roadmap must include remedial topic after failing quiz. Found: {item_names}")
        print(f"[TEST 3 PASS] Low score triggered adaptation. Remedial item inserted: {item_names}")

    def test_04_goal_change_replan_and_reuse(self):
        """Phase 5: Change goal to Data Scientist, verify plan re-routes and reuses Python and SQL."""
        result = orchestrator.handle_event(
            "goal_changed",
            self.db,
            self.user,
            {"new_role_id": "data-scientist"}
        )
        
        self.assertIn("career_reloaded", result["actions_taken"])
        self.assertIn("roadmap_rebuilt", result["actions_taken"])
        
        # Verify new roadmap role is Data Scientist
        roadmap = self.db.query(Roadmap).filter(Roadmap.user_id == self.user.id).first()
        self.assertEqual(roadmap.target_role_id, "data-scientist")
        
        # Verify analysis reuses Python and SQL
        analysis = gap_analyst_agent.analyze_gaps(self.db, self.user, "data-scientist")
        matched = [m["skill"] for m in analysis["matched_skills"]]
        self.assertIn("Python", matched)
        self.assertIn("SQL", matched)
        print(f"[TEST 4 PASS] Re-planned for Data Scientist! Reused skills: {matched}. Readiness: {analysis['readiness_score']}%")

    def test_05_career_simulator_and_admin(self):
        """Phase 8: Test Career simulator (+what-if delta) and Admin cohort heatmap."""
        # Switch back to full-stack
        self.user.current_role_id = "full-stack-developer"
        self.db.commit()
        
        sim_res = simulate_career_impact(
            SimulationRequest(skill_to_add="JavaScript", target_level=85),
            current_user=self.user,
            db=self.db
        )
        self.assertGreater(sim_res["delta"], 0.0)
        print(f"[TEST 5A PASS] Career Simulator: Adding JavaScript boosted readiness by +{sim_res['delta']}%!")
        
        admin_res = get_cohort_analytics(current_user=self.user, db=self.db)
        self.assertGreaterEqual(admin_res["total_students"], 1)
        self.assertGreaterEqual(len(admin_res["skill_heatmap"]), 5)
        print(f"[TEST 5B PASS] Admin Cohort: {admin_res['total_students']} students, Heatmap items: {len(admin_res['skill_heatmap'])}")

if __name__ == "__main__":
    unittest.main()
