from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str
    role: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "learner"
    hours_per_week: Optional[int] = 10
    learning_style: Optional[str] = "project-first"
    target_role_id: Optional[str] = "full-stack-developer"

class UserLogin(BaseModel):
    email: str
    password: str

class UserSkillItem(BaseModel):
    skill_name: str
    level: int # 0 to 100
    evidence: Optional[str] = "Self-assessed"
    source: Optional[str] = "self"

class CertificationItem(BaseModel):
    title: str
    issuer: str
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None
    skills_covered: Optional[List[str]] = []

class ProjectItem(BaseModel):
    title: str
    description: Optional[str] = None
    repo_url: Optional[str] = None
    live_url: Optional[str] = None
    skills_used: Optional[List[str]] = []

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    hours_per_week: Optional[int] = None
    learning_style: Optional[str] = None
    target_role_id: Optional[str] = None
    skills: Optional[List[UserSkillItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    projects: Optional[List[ProjectItem]] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    hours_per_week: int
    learning_style: str
    cohort_id: str
    current_role_id: str
    skills: List[UserSkillItem] = []
    certifications: List[CertificationItem] = []
    projects: List[ProjectItem] = []

    class Config:
        from_attributes = True

# Role Schemas
class RoleSkillReq(BaseModel):
    skill: str
    weight: int
    required_level: int

class JobRoleResponse(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str]
    required_skills: List[RoleSkillReq]

# Analysis Schemas
class SkillEvidence(BaseModel):
    skill: str
    level: int
    required_level: int
    evidence: str
    source: str
    status: str # "matched", "gap", "advanced"

class GapItem(BaseModel):
    skill: str
    weight: int
    current_level: int
    required_level: int
    gap_score: float
    is_prerequisite: bool
    prerequisites: List[str] = []

class SkillAnalysisResponse(BaseModel):
    role_id: str
    role_name: str
    readiness_score: float # 0 to 100
    radar_data: List[Dict[str, Any]] # [{skill: "JS", current: 30, required: 80, fullMark: 100}]
    strengths: List[str]
    weaknesses: List[str]
    matched_skills: List[SkillEvidence]
    missing_skills: List[GapItem]
    evidence_breakdown: List[Dict[str, Any]]

# Roadmap Schemas
class PracticeTaskSchema(BaseModel):
    title: str
    description: str
    starter_code: Optional[str] = None
    instructions: Optional[List[str]] = []

class ResourceItem(BaseModel):
    title: str
    type: str # course, video, docs, tutorial, exercise
    url: str
    difficulty: str
    duration: str

class RoadmapItemResponse(BaseModel):
    id: int
    skill_name: str
    order: int
    week: int
    status: str # locked, in_progress, completed
    reason: Optional[str]
    practice_task: Optional[PracticeTaskSchema]
    resources: List[ResourceItem] = []
    completed_at: Optional[datetime] = None

class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    target_role_id: str
    role_name: str
    total_weeks: int
    readiness_score: float
    items: List[RoadmapItemResponse] = []

# Assessment Schemas
class QuizQuestionSchema(BaseModel):
    id: int
    question: str
    options: List[str]
    subtopic: str

class AssessmentResponse(BaseModel):
    id: int
    skill_name: str
    title: str
    difficulty: str
    questions: List[QuizQuestionSchema]

class QuizSubmitRequest(BaseModel):
    answers: Dict[str, int] # question_id (as str) -> selected_option_index

class QuizResultResponse(BaseModel):
    skill_name: str
    score: float
    passed: bool
    weak_subtopics: List[str]
    feedback: str
    roadmap_updated: bool
    explanation: str

# Mentor Chat
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    agent_name: str = "MentorAgent"
    timestamp: datetime

# Agent Activity
class AgentEventResponse(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    agent_name: str
    input_summary: Optional[str]
    output_summary: Optional[str]

# Simulation
class SimulationRequest(BaseModel):
    skill_to_add: str
    target_level: int = 80
    role_id: Optional[str] = None

class SimulationResponse(BaseModel):
    skill_added: str
    target_level: int
    current_readiness: float
    projected_readiness: float
    delta: float
    impact_description: str

# Admin Cohort
class HeatmapCell(BaseModel):
    skill: str
    avg_level: float
    gap_percentage: float
    at_risk_students: int

class AdminCohortResponse(BaseModel):
    cohort_id: str
    total_students: int
    avg_readiness: float
    top_skill_gaps: List[Dict[str, Any]]
    at_risk_learners: List[Dict[str, Any]]
    role_distribution: Dict[str, int]
    skill_heatmap: List[HeatmapCell]

