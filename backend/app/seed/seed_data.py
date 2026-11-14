import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import (
    User, Skill, UserSkill, Certification, Project,
    JobRole, Resource, Assessment, Roadmap, RoadmapItem, AgentEvent, ChatMessage
)
from app.security import hash_password
from app.agents.orchestrator import orchestrator

SKILLS_SEED = [
    # Frontend
    {"name": "HTML/CSS", "category": "Frontend", "description": "Semantic markup, CSS Grid, Flexbox, and responsive styling", "prerequisites": []},
    {"name": "JavaScript", "category": "Frontend", "description": "Modern ES6+, DOM manipulation, closures, and async programming", "prerequisites": ["HTML/CSS"]},
    {"name": "TypeScript", "category": "Frontend", "description": "Typed JavaScript syntax, interfaces, and compiler configurations", "prerequisites": ["JavaScript"]},
    {"name": "React", "category": "Frontend", "description": "Component architecture, hooks, state management, and Virtual DOM", "prerequisites": ["JavaScript", "HTML/CSS"]},
    {"name": "Next.js", "category": "Frontend", "description": "Full-stack React framework with SSR, ISR, and API routing", "prerequisites": ["React"]},
    {"name": "Tailwind CSS", "category": "Frontend", "description": "Utility-first CSS framework for rapid UI engineering", "prerequisites": ["HTML/CSS"]},
    {"name": "Vue.js", "category": "Frontend", "description": "Progressive JavaScript framework for building user interfaces", "prerequisites": ["JavaScript"]},
    {"name": "Web Accessibility (a11y)", "category": "Frontend", "description": "WCAG compliance, ARIA standards, and screen reader UX", "prerequisites": ["HTML/CSS"]},

    # Backend
    {"name": "Python", "category": "Backend", "description": "Core syntax, OOP, standard libraries, and backend scripting", "prerequisites": []},
    {"name": "Node.js", "category": "Backend", "description": "V8 runtime, event loop, asynchronous I/O, and npm ecosystem", "prerequisites": ["JavaScript"]},
    {"name": "Express.js", "category": "Backend", "description": "Fast, unopinionated minimalist web framework for Node.js", "prerequisites": ["Node.js"]},
    {"name": "FastAPI", "category": "Backend", "description": "High-performance Python API framework using type hints and OpenAPI", "prerequisites": ["Python"]},
    {"name": "REST APIs", "category": "Backend", "description": "RESTful resource design, HTTP methods, status codes, and security", "prerequisites": ["JavaScript", "Python"]},
    {"name": "GraphQL", "category": "Backend", "description": "Schema definition, queries, mutations, and resolvers", "prerequisites": ["REST APIs"]},
    {"name": "Java", "category": "Backend", "description": "Object-oriented systems programming and Spring Boot ecosystem", "prerequisites": []},
    {"name": "Go (Golang)", "category": "Backend", "description": "Concurrent microservices, goroutines, and channels", "prerequisites": []},
    {"name": "Authentication & JWT", "category": "Backend", "description": "Stateless sessions, OAuth2, password hashing, and token refresh", "prerequisites": ["REST APIs"]},

    # Database
    {"name": "SQL", "category": "Database", "description": "Relational queries, joins, indexes, aggregate functions, and schemas", "prerequisites": []},
    {"name": "PostgreSQL", "category": "Database", "description": "Advanced relational engine, JSONB support, indexing, and transactions", "prerequisites": ["SQL"]},
    {"name": "MongoDB", "category": "Database", "description": "NoSQL document store, aggregation pipelines, and sharding", "prerequisites": ["JavaScript"]},
    {"name": "Redis", "category": "Database", "description": "In-memory key-value data store, caching strategies, and pub/sub", "prerequisites": ["SQL"]},
    {"name": "Database Indexing & Optimization", "category": "Database", "description": "Query plan analysis, B-trees, indexing, and connection pooling", "prerequisites": ["SQL"]},

    # DevOps & Cloud
    {"name": "Git", "category": "DevOps", "description": "Branching, rebasing, merge conflict resolution, and pull requests", "prerequisites": []},
    {"name": "Linux & Bash", "category": "DevOps", "description": "Unix shell scripting, permissions, process management, and networking", "prerequisites": []},
    {"name": "Docker", "category": "DevOps", "description": "Container virtualization, Dockerfiles, multi-stage builds, and Compose", "prerequisites": ["Linux & Bash"]},
    {"name": "Kubernetes", "category": "DevOps", "description": "Container orchestration, pods, services, ingress, and deployments", "prerequisites": ["Docker"]},
    {"name": "CI/CD", "category": "DevOps", "description": "Automated build, test, and deployment workflows with GitHub Actions", "prerequisites": ["Git", "Docker"]},
    {"name": "AWS Cloud Services", "category": "DevOps", "description": "EC2, S3, RDS, Lambda, IAM, and VPC cloud infrastructure", "prerequisites": ["Linux & Bash", "Docker"]},
    {"name": "Terraform (IaC)", "category": "DevOps", "description": "Declarative infrastructure provisioning and state management", "prerequisites": ["AWS Cloud Services"]},
    {"name": "Monitoring & Logging", "category": "DevOps", "description": "Prometheus, Grafana, OpenTelemetry, and centralized logging", "prerequisites": ["Docker"]},

    # Data Science & AI
    {"name": "Statistics & Probability", "category": "Data Science", "description": "Hypothesis testing, distributions, Bayes theorem, and variance", "prerequisites": []},
    {"name": "Pandas & NumPy", "category": "Data Science", "description": "Data wrangling, matrix computation, and DataFrame analysis", "prerequisites": ["Python"]},
    {"name": "Data Visualization", "category": "Data Science", "description": "Matplotlib, Seaborn, interactive charting, and storytelling", "prerequisites": ["Pandas & NumPy"]},
    {"name": "Machine Learning", "category": "Data Science", "description": "Supervised/unsupervised algorithms, scikit-learn, cross-validation", "prerequisites": ["Statistics & Probability", "Pandas & NumPy"]},
    {"name": "Deep Learning", "category": "Data Science", "description": "Neural networks, PyTorch, backpropagation, and loss functions", "prerequisites": ["Machine Learning"]},
    {"name": "Natural Language Processing", "category": "Data Science", "description": "Transformers, tokenization, embeddings, and LLM fine-tuning", "prerequisites": ["Deep Learning"]},
    {"name": "MLOps", "category": "Data Science", "description": "Model registry, experiment tracking with MLflow, and serving", "prerequisites": ["Machine Learning", "Docker"]},

    # Systems & Soft Skills
    {"name": "Data Structures & Algorithms", "category": "Computer Science", "description": "Trees, graphs, dynamic programming, sorting, and Big-O", "prerequisites": ["Python", "JavaScript"]},
    {"name": "System Design", "category": "Architecture", "description": "Scalability, microservices, load balancing, caching, and CAP theorem", "prerequisites": ["REST APIs", "SQL", "Docker"]},
    {"name": "Cybersecurity Basics", "category": "Security", "description": "OWASP Top 10, CORS, CSRF, XSS, and encryption", "prerequisites": ["REST APIs"]}
]

JOB_ROLES_SEED = [
    {
        "id": "full-stack-developer",
        "name": "Full Stack Developer",
        "category": "Software Engineering",
        "description": "Architects and implements end-to-end web applications, interactive client frontends, and robust backend microservices.",
        "required_skills": [
            {"skill": "JavaScript", "weight": 5, "required_level": 80},
            {"skill": "React", "weight": 5, "required_level": 80},
            {"skill": "Node.js", "weight": 5, "required_level": 80},
            {"skill": "HTML/CSS", "weight": 3, "required_level": 80},
            {"skill": "SQL", "weight": 4, "required_level": 75},
            {"skill": "REST APIs", "weight": 4, "required_level": 80},
            {"skill": "Git", "weight": 3, "required_level": 70},
            {"skill": "Docker", "weight": 3, "required_level": 65}
        ]
    },
    {
        "id": "data-scientist",
        "name": "Data Scientist",
        "category": "Artificial Intelligence & Analytics",
        "description": "Discovers predictive insights, builds machine learning pipelines, and develops data-driven solutions for complex problems.",
        "required_skills": [
            {"skill": "Python", "weight": 5, "required_level": 85},
            {"skill": "SQL", "weight": 4, "required_level": 80},
            {"skill": "Pandas & NumPy", "weight": 4, "required_level": 85},
            {"skill": "Machine Learning", "weight": 5, "required_level": 80},
            {"skill": "Statistics & Probability", "weight": 4, "required_level": 80},
            {"skill": "Data Visualization", "weight": 3, "required_level": 75},
            {"skill": "Deep Learning", "weight": 4, "required_level": 70},
            {"skill": "Git", "weight": 2, "required_level": 65}
        ]
    },
    {
        "id": "cloud-engineer",
        "name": "Cloud & DevOps Engineer",
        "category": "Infrastructure & Operations",
        "description": "Automates resilient cloud infrastructure, oversees CI/CD pipelines, container orchestration, and multi-region reliability.",
        "required_skills": [
            {"skill": "Docker", "weight": 5, "required_level": 85},
            {"skill": "Kubernetes", "weight": 5, "required_level": 80},
            {"skill": "AWS Cloud Services", "weight": 5, "required_level": 85},
            {"skill": "Linux & Bash", "weight": 4, "required_level": 80},
            {"skill": "CI/CD", "weight": 4, "required_level": 80},
            {"skill": "Terraform (IaC)", "weight": 4, "required_level": 75},
            {"skill": "Git", "weight": 3, "required_level": 75},
            {"skill": "Python", "weight": 3, "required_level": 70}
        ]
    }
]

RESOURCES_SEED = [
    # JavaScript
    {"title": "Eloquent JavaScript - 4th Edition", "type": "docs", "url": "https://eloquentjavascript.net", "skill_name": "JavaScript", "difficulty": "intermediate", "duration": "4 hours"},
    {"title": "JavaScript: Understanding the Weird Parts", "type": "video", "url": "https://youtube.com", "skill_name": "JavaScript", "difficulty": "intermediate", "duration": "3.5 hours"},
    {"title": "MDN Asynchronous JavaScript Guide", "type": "tutorial", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous", "skill_name": "JavaScript", "difficulty": "beginner", "duration": "2 hours"},
    {"title": "JavaScript 30: 30 Day Vanilla JS Challenge", "type": "exercise", "url": "https://javascript30.com", "skill_name": "JavaScript", "difficulty": "beginner", "duration": "5 hours"},
    {"title": "Full Stack Open: Deep Dive into Modern Web Dev", "type": "course", "url": "https://fullstackopen.com/en/", "skill_name": "JavaScript", "difficulty": "advanced", "duration": "10 hours"},

    # React
    {"title": "Official React 19 Documentation & Interactive Labs", "type": "docs", "url": "https://react.dev", "skill_name": "React", "difficulty": "intermediate", "duration": "4 hours"},
    {"title": "Building Production React Apps with Hooks & Context", "type": "tutorial", "url": "https://react.dev/learn/describing-the-ui", "skill_name": "React", "difficulty": "intermediate", "duration": "3 hours"},
    {"title": "React State Management Masterclass", "type": "video", "url": "https://youtube.com", "skill_name": "React", "difficulty": "advanced", "duration": "2.5 hours"},
    {"title": "React Practice: 10 Interactive Micro-Components", "type": "exercise", "url": "https://reactchallenges.com", "skill_name": "React", "difficulty": "beginner", "duration": "4 hours"},

    # Node.js
    {"title": "Node.js Design Patterns & Event-Driven Architecture", "type": "docs", "url": "https://nodejs.org/en/learn", "skill_name": "Node.js", "difficulty": "intermediate", "duration": "4 hours"},
    {"title": "Building High-Throughput REST APIs with Express", "type": "tutorial", "url": "https://expressjs.com", "skill_name": "Node.js", "difficulty": "intermediate", "duration": "3 hours"},
    {"title": "Node.js Streams, Buffers, and Concurrency", "type": "video", "url": "https://youtube.com", "skill_name": "Node.js", "difficulty": "advanced", "duration": "2 hours"},
    {"title": "Node.js Backend Milestone: Build an Auth Microservice", "type": "exercise", "url": "https://exercism.org", "skill_name": "Node.js", "difficulty": "intermediate", "duration": "4 hours"},

    # Python
    {"title": "Automate the Boring Stuff with Python", "type": "tutorial", "url": "https://automatetheboringstuff.com", "skill_name": "Python", "difficulty": "beginner", "duration": "5 hours"},
    {"title": "Official Python 3 Documentation", "type": "docs", "url": "https://docs.python.org/3/", "skill_name": "Python", "difficulty": "intermediate", "duration": "3 hours"},

    # SQL
    {"title": "SQLZoo Interactive SQL Tutorial", "type": "exercise", "url": "https://sqlzoo.net", "skill_name": "SQL", "difficulty": "beginner", "duration": "3 hours"},
    {"title": "PostgreSQL Tutorial for Developers", "type": "tutorial", "url": "https://postgresqltutorial.com", "skill_name": "SQL", "difficulty": "intermediate", "duration": "4 hours"},

    # Docker
    {"title": "Docker Curriculum for Web Developers", "type": "tutorial", "url": "https://docker-curriculum.com", "skill_name": "Docker", "difficulty": "beginner", "duration": "2.5 hours"},
    {"title": "Docker Deep Dive - Multi-container orchestration", "type": "video", "url": "https://youtube.com", "skill_name": "Docker", "difficulty": "intermediate", "duration": "3 hours"}
]

ASSESSMENTS_SEED = [
    {
        "skill_name": "JavaScript",
        "title": "JavaScript Core & Asynchronous Proficiency Quiz",
        "difficulty": "intermediate",
        "questions": [
            {
                "id": 1,
                "question": "What is the key difference between `let`, `const`, and `var` in modern JavaScript?",
                "options": [
                    "They are completely interchangeable with identical scoping",
                    "`var` is function-scoped while `let` and `const` are block-scoped; `const` cannot be reassigned",
                    "`const` allows variables to leak into the global object automatically",
                    "`let` variables are hoisted without the temporal dead zone"
                ],
                "correct_answer": 1,
                "explanation": "`var` is function-scoped and hoisted with undefined, while `let` and `const` honor block scoping and enforce the temporal dead zone.",
                "subtopic": "Variable Scoping & Closures"
            },
            {
                "id": 2,
                "question": "What will `console.log(typeof null)` output in JavaScript?",
                "options": ["null", "undefined", "object", "boolean"],
                "correct_answer": 2,
                "explanation": "Due to a historical bug in the first version of JS, `typeof null` returns 'object'.",
                "subtopic": "Type System & Primitives"
            },
            {
                "id": 3,
                "question": "What happens when an unhandled Promise rejection occurs in modern Node.js?",
                "options": [
                    "The Promise automatically retries 3 times",
                    "The process prints a warning and terminates with a non-zero exit code",
                    "It converts into a synchronous exception silently",
                    "Node.js ignores it and moves to the next tick"
                ],
                "correct_answer": 1,
                "explanation": "Unhandled promise rejections terminate Node.js processes to prevent zombie or corrupted memory states.",
                "subtopic": "Promises & Async Control"
            },
            {
                "id": 4,
                "question": "Which method is the modern standard for making HTTP requests in client-side JavaScript?",
                "options": ["XMLHttpRequest", "fetch()", "http.get()", "curl()"],
                "correct_answer": 1,
                "explanation": "`fetch()` is the modern built-in Promise-based Web API for network requests.",
                "subtopic": "Web APIs & Fetch"
            },
            {
                "id": 5,
                "question": "How does the JavaScript Event Loop handle microtasks (e.g. `Promise.then`) compared to macrotasks (e.g. `setTimeout`)?",
                "options": [
                    "Macrotasks always execute before microtasks",
                    "The microtask queue is drained completely after the current task and before the next macrotask runs",
                    "They run in parallel on separate operating system threads",
                    "Microtasks are delayed until user interaction occurs"
                ],
                "correct_answer": 1,
                "explanation": "Microtasks have higher priority and drain immediately after the current synchronous frame finishes, before executing the next macrotask.",
                "subtopic": "Event Loop & Concurrency"
            }
        ]
    },
    {
        "skill_name": "React",
        "title": "React Component Architecture & State Handling",
        "difficulty": "intermediate",
        "questions": [
            {
                "id": 1,
                "question": "What is the primary rule when declaring React Hooks like `useState` or `useEffect`?",
                "options": [
                    "They must only be called inside loops or if-statements",
                    "They must only be called at the top level of React function components or custom hooks",
                    "They must be called inside the constructor",
                    "They can only be called from plain JavaScript utility functions"
                ],
                "correct_answer": 1,
                "explanation": "Hooks must be called at the top level to guarantee that hook state corresponds to the exact same order on every render.",
                "subtopic": "Hooks & Component Lifecycle"
            },
            {
                "id": 2,
                "question": "Why is giving an array index as a `key` prop in a dynamic list considered an anti-pattern?",
                "options": [
                    "React throws a compiler error immediately",
                    "If items are inserted, deleted, or reordered, index keys cause buggy state retention and slow reconciliation",
                    "Index keys consume too much RAM in the browser",
                    "Keys must always be integers greater than 100"
                ],
                "correct_answer": 1,
                "explanation": "Index keys break reconciliation when items shift positions, binding old component state to the wrong data.",
                "subtopic": "Virtual DOM & Reconciliation"
            },
            {
                "id": 3,
                "question": "What is the purpose of `useCallback` in React?",
                "options": [
                    "To execute an HTTP request on mount",
                    "To memoize a callback function instance between renders to prevent unnecessary child re-renders",
                    "To catch runtime JavaScript errors in child components",
                    "To bind `this` to class components"
                ],
                "correct_answer": 1,
                "explanation": "`useCallback` caches a function definition between renders unless its dependencies change.",
                "subtopic": "Performance Optimization"
            }
        ]
    },
    {
        "skill_name": "Node.js",
        "title": "Node.js Runtime & Microservices Assessment",
        "difficulty": "intermediate",
        "questions": [
            {
                "id": 1,
                "question": "Which mechanism enables Node.js to perform non-blocking I/O operations despite running on a single main thread?",
                "options": [
                    "Creating a new operating system process for each HTTP request",
                    "The libuv event loop and thread pool for background filesystem/network operations",
                    "Compiling all code directly into C++ binary shared libraries",
                    "Disabling hardware interrupts"
                ],
                "correct_answer": 1,
                "explanation": "Node.js leverages libuv's event loop to offload heavy I/O tasks to background worker threads while keeping JavaScript single-threaded.",
                "subtopic": "Libuv & Event Loop"
            },
            {
                "id": 2,
                "question": "What middleware function signature does Express.js use for centralized error handling?",
                "options": [
                    "(req, res, next)",
                    "(err, req, res, next)",
                    "(err, res)",
                    "(req, res, errorCallback)"
                ],
                "correct_answer": 1,
                "explanation": "Express identifies error-handling middleware by its 4-parameter signature `(err, req, res, next)`.",
                "subtopic": "Express.js Architecture"
            }
        ]
    }
]

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Skill).count() == 0:
            print("[Seed] Seeding Skills...")
            for s in SKILLS_SEED:
                db.add(Skill(
                    name=s["name"],
                    category=s["category"],
                    description=s["description"],
                    prerequisites=s["prerequisites"]
                ))
            db.commit()

        if db.query(JobRole).count() == 0:
            print("[Seed] Seeding Job Roles...")
            for r in JOB_ROLES_SEED:
                db.add(JobRole(
                    id=r["id"],
                    name=r["name"],
                    category=r["category"],
                    description=r["description"],
                    required_skills=r["required_skills"]
                ))
            db.commit()

        if db.query(Resource).count() == 0:
            print("[Seed] Seeding Resources...")
            for res in RESOURCES_SEED:
                db.add(Resource(
                    title=res["title"],
                    type=res["type"],
                    url=res["url"],
                    skill_name=res["skill_name"],
                    difficulty=res["difficulty"],
                    duration=res["duration"]
                ))
            db.commit()

        if db.query(Assessment).count() == 0:
            print("[Seed] Seeding Assessments...")
            for a in ASSESSMENTS_SEED:
                db.add(Assessment(
                    skill_name=a["skill_name"],
                    title=a["title"],
                    difficulty=a["difficulty"],
                    questions=a["questions"]
                ))
            db.commit()

        # Seed Demo Student: Alex Rivera (Python, SQL, HTML/CSS -> Full Stack Developer)
        demo_student = db.query(User).filter(User.email == "student@skillpath.ai").first()
        if not demo_student:
            print("[Seed] Creating Demo Student: student@skillpath.ai...")
            demo_student = User(
                name="Alex Rivera",
                email="student@skillpath.ai",
                hashed_password=hash_password("password123"),
                role="learner",
                hours_per_week=10,
                learning_style="project-first",
                cohort_id="cohort-2026-alpha",
                current_role_id="full-stack-developer"
            )
            db.add(demo_student)
            db.commit()
            db.refresh(demo_student)

            # Assign seed skills: Python (75), SQL (70), HTML/CSS (60)
            db.add(UserSkill(user_id=demo_student.id, skill_name="Python", level=75, evidence="Built automated data scraping scripts and CLI utilities.", source="project"))
            db.add(UserSkill(user_id=demo_student.id, skill_name="SQL", level=70, evidence="Completed SQL Database Design Certificate; joins, indexing, and schema design.", source="certificate"))
            db.add(UserSkill(user_id=demo_student.id, skill_name="HTML/CSS", level=60, evidence="Self-rated basic web layouts and Flexbox components.", source="self"))
            
            # Projects
            db.add(Project(
                user_id=demo_student.id,
                title="Python Data Scraper & Aggregator",
                description="Engineered a multithreaded scraper processing 10k items with SQLite storage.",
                repo_url="https://github.com/alex-rivera/scraper-pro",
                skills_used=["Python", "SQL"]
            ))

            # Certifications
            db.add(Certification(
                user_id=demo_student.id,
                title="Relational Database Architecture",
                issuer="Stanford Online",
                issue_date="2026-02-15",
                skills_covered=["SQL", "PostgreSQL"]
            ))
            db.commit()

            # Run Orchestrator to initialize roadmap, gap analysis, and mentor welcome!
            orchestrator.handle_event("profile_created", db, demo_student)

        # Seed Demo Admin: Dr. Evelyn Reed
        demo_admin = db.query(User).filter(User.email == "admin@skillpath.ai").first()
        if not demo_admin:
            print("[Seed] Creating Demo Admin: admin@skillpath.ai...")
            demo_admin = User(
                name="Dr. Evelyn Reed",
                email="admin@skillpath.ai",
                hashed_password=hash_password("admin123"),
                role="admin",
                hours_per_week=20,
                learning_style="cohort-review",
                cohort_id="cohort-2026-alpha",
                current_role_id="full-stack-developer"
            )
            db.add(demo_admin)
            db.commit()

        # Seed additional cohort students for rich cohort heatmap and analytics
        cohort_students_data = [
            ("Jordan Lee", "jordan@university.edu", 12, "full-stack-developer", [("HTML/CSS", 80), ("JavaScript", 40), ("React", 30), ("Node.js", 20)]),
            ("Priya Sharma", "priya@university.edu", 15, "data-scientist", [("Python", 85), ("SQL", 80), ("Pandas & NumPy", 75), ("Machine Learning", 60)]),
            ("Marcus Chen", "marcus@university.edu", 8, "cloud-engineer", [("Linux & Bash", 85), ("Git", 80), ("Docker", 45), ("Kubernetes", 25)]),
            ("Sarah Jenkins", "sarah@university.edu", 10, "full-stack-developer", [("Python", 60), ("SQL", 50), ("JavaScript", 35), ("React", 20)])
        ]

        for s_name, s_email, s_hrs, s_role, s_skills in cohort_students_data:
            if not db.query(User).filter(User.email == s_email).first():
                u = User(
                    name=s_name,
                    email=s_email,
                    hashed_password=hash_password("password123"),
                    role="learner",
                    hours_per_week=s_hrs,
                    learning_style="project-first",
                    cohort_id="cohort-2026-alpha",
                    current_role_id=s_role
                )
                db.add(u)
                db.commit()
                db.refresh(u)
                for sk_name, sk_lvl in s_skills:
                    db.add(UserSkill(user_id=u.id, skill_name=sk_name, level=sk_lvl, evidence="Self-rated baseline", source="self"))
                db.commit()
                # Run orchestrator
                orchestrator.handle_event("profile_created", db, u)

        print("[Seed] Database initialization complete!")

    finally:
        db.close()

if __name__ == "__main__":
    init_db()

