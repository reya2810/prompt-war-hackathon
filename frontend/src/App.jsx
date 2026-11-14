import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MentorDrawer } from './components/MentorDrawer';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SkillAnalysisPage } from './pages/SkillAnalysisPage';
import { CareerMatchPage } from './pages/CareerMatchPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LearnPage } from './pages/LearnPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { ProgressPage } from './pages/ProgressPage';
import { AgentActivityPage } from './pages/AgentActivityPage';
import { CareerSimulatorPage } from './pages/CareerSimulatorPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Protected Layout with Navigation
const AppLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const [isMentorOpen, setIsMentorOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-indigo-400">
        Authenticating agent session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenMentor={() => setIsMentorOpen(true)} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <MentorDrawer isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} />
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Dashboard Routes */}
          <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
          <Route path="/onboarding" element={<AppLayout><OnboardingPage /></AppLayout>} />
          <Route path="/analysis" element={<AppLayout><SkillAnalysisPage /></AppLayout>} />
          <Route path="/career-match" element={<AppLayout><CareerMatchPage /></AppLayout>} />
          <Route path="/roadmap" element={<AppLayout><RoadmapPage /></AppLayout>} />
          <Route path="/learn" element={<AppLayout><LearnPage /></AppLayout>} />
          <Route path="/assessments" element={<AppLayout><AssessmentsPage /></AppLayout>} />
          <Route path="/progress" element={<AppLayout><ProgressPage /></AppLayout>} />
          <Route path="/agents" element={<AppLayout><AgentActivityPage /></AppLayout>} />
          <Route path="/simulator" element={<AppLayout><CareerSimulatorPage /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><AdminDashboardPage /></AppLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

