import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radar,
  Briefcase,
  GitBranch,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Activity,
  Sliders,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analysis', label: 'Skill Analysis', icon: Radar },
    { to: '/career-match', label: 'Career Match', icon: Briefcase },
    { to: '/roadmap', label: 'Roadmap', icon: GitBranch },
    { to: '/learn', label: 'Learn Hub', icon: BookOpen },
    { to: '/assessments', label: 'Assessments', icon: CheckSquare },
    { to: '/progress', label: 'Progress & Trend', icon: TrendingUp },
    { to: '/simulator', label: 'Career Simulator', icon: Sliders },
    { to: '/agents', label: 'Agent Activity', icon: Activity, badge: 'Live' },
    { to: '/admin', label: 'Cohort Admin', icon: Users, adminOnly: false },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Learning Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Cohort status footer card */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mt-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-300">Cohort Status</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
            {user?.cohort_id || '2026-Alpha'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Adaptive re-planning active. Every quiz attempt and goal switch re-optimizes your timeline.
        </p>
      </div>
    </aside>
  );
};

