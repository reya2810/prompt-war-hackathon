const API_BASE = '';

const getHeaders = () => {
  const token = localStorage.getItem('skillpath_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Profile
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/profile`, { headers: getHeaders() });
    return res.json();
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  uploadResume: async (resumeText) => {
    const formData = new FormData();
    formData.append('resume_text', resumeText);
    const token = localStorage.getItem('skillpath_token');
    const res = await fetch(`${API_BASE}/profile/resume`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return res.json();
  },

  // Roles & Goals
  getRoles: async () => {
    const res = await fetch(`${API_BASE}/roles`, { headers: getHeaders() });
    return res.json();
  },

  setGoal: async (roleId) => {
    const res = await fetch(`${API_BASE}/goal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role_id: roleId }),
    });
    return res.json();
  },

  // Skill Analysis
  getAnalysis: async () => {
    const res = await fetch(`${API_BASE}/analysis`, { headers: getHeaders() });
    return res.json();
  },

  // Roadmap
  getRoadmap: async () => {
    const res = await fetch(`${API_BASE}/roadmap`, { headers: getHeaders() });
    return res.json();
  },

  completeRoadmapItem: async (itemId) => {
    const res = await fetch(`${API_BASE}/roadmap/${itemId}/complete`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Assessments
  getAssessment: async (skillName) => {
    const res = await fetch(`${API_BASE}/assessments/${encodeURIComponent(skillName)}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  submitAssessment: async (skillName, answers) => {
    const res = await fetch(`${API_BASE}/assessments/${encodeURIComponent(skillName)}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers }),
    });
    return res.json();
  },

  // Progress
  getProgress: async () => {
    const res = await fetch(`${API_BASE}/progress`, { headers: getHeaders() });
    return res.json();
  },

  // AI Mentor
  mentorChat: async (message) => {
    const res = await fetch(`${API_BASE}/mentor/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  getMentorHistory: async () => {
    const res = await fetch(`${API_BASE}/mentor/history`, { headers: getHeaders() });
    return res.json();
  },

  // Agent Activity
  getAgentActivity: async () => {
    const res = await fetch(`${API_BASE}/agents/activity`, { headers: getHeaders() });
    return res.json();
  },

  // Simulator
  simulateImpact: async (skillToAdd, targetLevel = 80, roleId = null) => {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        skill_to_add: skillToAdd,
        target_level: targetLevel,
        role_id: roleId,
      }),
    });
    return res.json();
  },

  // Admin
  getCohortAnalytics: async () => {
    const res = await fetch(`${API_BASE}/admin/cohort`, { headers: getHeaders() });
    return res.json();
  },
};

