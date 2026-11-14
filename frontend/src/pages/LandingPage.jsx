import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight, CheckCircle2, Shield, Cpu, Layers, GitMerge } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoStudentLogin = async () => {
    try {
      await login('student@skillpath.ai', 'password123');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDemoAdminLogin = async () => {
    try {
      await login('admin@skillpath.ai', 'admin123');
      navigate('/admin');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-8 py-5 flex items-center justify-between glass-panel">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">SkillPath <span className="text-indigo-400">AI</span></span>
            <span className="text-[10px] ml-2 font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Autonomous Multi-Agent System
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
            >
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={handleDemoStudentLogin}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch Demo Learner</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Real Multi-Agent Collaboration & Dependency Graphs</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Know your gaps. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Learn what matters.
          </span> <br />
          Get job-ready.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Traditional platforms lock you into generic catalogs and checkbox quizzes. SkillPath AI deploys a team of 7 collaborating AI agents to verify evidence, topologically schedule prerequisite roadmaps, and dynamically adapt when you stumble.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleDemoStudentLogin}
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-105"
          >
            <span>Try Live Scenario (Alex Rivera)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleDemoAdminLogin}
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all"
          >
            Admin Cohort Dashboard
          </button>
        </div>

        {/* 7 Agents Architecture Showcase */}
        <div className="mt-16 w-full text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 text-center">
            Autonomous 7-Agent Architecture
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { name: 'Profile Agent', desc: 'Parses GitHub, resumes, & certifications into proficiency evidence.', icon: Cpu },
              { name: 'Career Agent', desc: 'Maintains live skill ontology & weighted requirements for industry roles.', icon: Layers },
              { name: 'Gap Analyst', desc: 'Calculates mathematical readiness & prioritizes prerequisite gaps.', icon: GitMerge },
              { name: 'Curriculum Agent', desc: 'Topologically schedules prerequisite roadmaps with custom weekly pacing.', icon: CheckCircle2 },
              { name: 'Assessment Agent', desc: 'Auto-grades code tasks & detects nuanced sub-topic weaknesses.', icon: Shield },
              { name: 'Mentor Agent', desc: 'Explains every adaptation, motivates, and guides live in chat.', icon: Bot },
              { name: 'Orchestrator', desc: 'Event-driven coordinator managing triggers, re-planning, & audit logs.', icon: Sparkles },
              { name: 'Career Simulator', desc: 'Interactive What-if modeling showing exact readiness percentage shifts.', icon: ArrowRight },
            ].map((ag, i) => {
              const Icon = ag.icon;
              return (
                <div key={i} className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-xs text-white">{ag.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{ag.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-8 text-center text-xs text-slate-500">
        SkillPath AI &bull; Built with FastAPI, SQLite, Multi-Agent Orchestration, and React &bull; Offline & Fallback Ready
      </footer>
    </div>
  );
};

