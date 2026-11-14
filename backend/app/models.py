from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="learner") # learner, admin
    hours_per_week = Column(Integer, default=10)
    learning_style = Column(String(50), default="project-first") # video-first, text-first, project-first
    cohort_id = Column(String(50), default="cohort-2026-alpha")
    current_role_id = Column(String(100), default="full-stack-developer")
    created_at = Column(DateTime, default=datetime.utcnow)

    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="user", cascade="all, delete-orphan")
    agent_events = relationship("AgentEvent", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False) # Frontend, Backend, Database, DevOps, Data Science, etc.
    description = Column(Text, nullable=True)
    prerequisites = Column(JSON, default=list) # List of prerequisite skill names (e.g., ["JavaScript"] for React)

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), index=True, nullable=False)
    level = Column(Integer, default=50) # 0 to 100
    evidence = Column(Text, nullable=True)
    source = Column(String(50), default="self") # self, quiz, project, certificate
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="skills")

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    issuer = Column(String(100), nullable=False)
    issue_date = Column(String(50), nullable=True)
    credential_url = Column(String(300), nullable=True)
    skills_covered = Column(JSON, default=list)

    user = relationship("User", back_populates="certifications")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    repo_url = Column(String(300), nullable=True)
    live_url = Column(String(300), nullable=True)
    skills_used = Column(JSON, default=list)

    user = relationship("User", back_populates="projects")

class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(String(100), primary_key=True) # e.g. "full-stack-developer"
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    # List of {"skill": "JavaScript", "weight": 5, "required_level": 80}
    required_skills = Column(JSON, nullable=False, default=list)

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_role_id = Column(String(100), nullable=False)
    role_name = Column(String(150), nullable=False)
    total_weeks = Column(Integer, default=12)
    readiness_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")
    items = relationship("RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapItem.order")

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    order = Column(Integer, default=1)
    week = Column(Integer, default=1)
    status = Column(String(20), default="locked") # locked, in_progress, completed
    reason = Column(String(255), nullable=True) # e.g. "Core requirement", "Inserted remedial topic: Low quiz score (45%)"
    practice_task = Column(JSON, nullable=True) # {title, description, test_criteria, starter_code}
    resources = Column(JSON, default=list) # [{title, type, url, difficulty, duration}]
    completed_at = Column(DateTime, nullable=True)

    roadmap = relationship("Roadmap", back_populates="items")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False) # course, tutorial, video, docs, exercise
    url = Column(String(300), nullable=False)
    skill_name = Column(String(100), index=True, nullable=False)
    difficulty = Column(String(50), default="beginner") # beginner, intermediate, advanced
    duration = Column(String(50), default="2 hours")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String(100), index=True, nullable=False)
    difficulty = Column(String(50), default="intermediate")
    title = Column(String(200), nullable=False)
    # List of {id: int, question: str, options: [str], correct_answer: int, explanation: str, subtopic: str}
    questions = Column(JSON, nullable=False, default=list)

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    skill_name = Column(String(100), nullable=False)
    score = Column(Float, nullable=False) # 0 to 100
    weak_subtopics = Column(JSON, default=list)
    feedback = Column(Text, nullable=True)
    answers = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="attempts")

class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String(100), nullable=False) # profile_created, goal_changed, assessment_submitted, etc.
    agent_name = Column(String(100), nullable=False) # ProfileAgent, CareerAgent, GapAnalyst, CurriculumAgent, etc.
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)

    user = relationship("User", back_populates="agent_events")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant, system
    agent_name = Column(String(50), default="MentorAgent")
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")

