import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Flame,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sparkles,
  Bot
} from 'lucide-react';
import { api } from '../api/client';
import { ReadinessGauge } from '../components/ReadinessGauge';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [anData, rmData, prData, evData] = await Promise.all([
        api.getAnalysis(),
        api.getRoadmap(),
        api.getProgress(),
        api.getAgentActivity(),
      ]);
      setAnalysis(anData);
      setRoadmap(rmData);
      setProgress(prData);
      setRecentEvents(evData.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-indigo-400">
        <Bot className="w-8 h-8 animate-bounce mb-2" />
        <span className="ml-3 text-sm font-medium">Orchestrator synchronizing learner telemetry...</span>
      </div>
    );
  }

  const currentItem = roadmap?.items?.find((i) => i.status === 'in_progress') || roadmap?.items?.[0];
  const readiness = analysis?.readiness_score || 0;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-purple-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Target Role: {analysis?.role_name || 'Full Stack Developer'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {progress?.streak_days || 4} Day Streak
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Alex'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            The multi-agent system has prioritized <span className="text-indigo-300 font-semibold">{analysis?.missing_skills?.[0]?.skill || 'JavaScript'}</span> as your current prerequisite focus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/assessments"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <span>Take Skill Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/career-match"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold"
          >
            Switch Role
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Readiness Gauge Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <ReadinessGauge score={readiness} size={150} label="Job Ready" />
          <div className="text-[11px] text-slate-400 mt-2 text-center">
            Weighted across {analysis?.radar_data?.length || 8} role competencies
          </div>
        </div>

        {/* Current In-Progress Topic */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                Active Milestone Focus
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                Week {currentItem?.week || 1}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {currentItem?.skill_name || 'JavaScript Fundamentals'}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
              {currentItem?.practice_task?.description || 'Build functional patterns and verify asynchronous operations.'}
            </p>
            {currentItem?.reason && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                <AlertCircle className="w-3 h-3" />
                <span>{currentItem.reason}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/80">
            <Link
              to="/learn"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Resources ({currentItem?.resources?.length || 3})</span>
            </Link>
            <Link
              to={`/assessments`}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Verify Skill
            </Link>
          </div>
        </div>

        {/* Quick Telemetry Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Learning Velocity
            </span>
            <div className="mt-2 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Milestones</span>
                <span className="font-bold text-white">{progress?.total_milestones || 6}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Completed</span>
                <span className="font-bold text-emerald-400">{progress?.completed_milestones || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Weekly Target</span>
                <span className="font-bold text-indigo-300">{user?.hours_per_week || 10} hrs/wk</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Est. Duration</span>
                <span className="font-bold text-slate-200">{roadmap?.total_weeks || 12} weeks</span>
              </div>
            </div>
          </div>
          <Link
            to="/roadmap"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-between pt-2 border-t border-slate-800"
          >
            <span>View Full Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Live Multi-Agent Stream & Gaps Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Multi-Agent Activity Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Live Multi-Agent Collaboration Log</h2>
            </div>
            <Link
              to="/agents"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/30 transition-all flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                  {ev.agent_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{ev.agent_name}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-300 mt-0.5">{ev.event_type}</div>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">{ev.output_summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Skill Gaps */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h2 className="font-bold text-sm text-white">Identified Competency Gaps</h2>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {analysis?.missing_skills?.length || 0} Gaps
              </span>
            </div>

            <div className="space-y-2.5">
              {(analysis?.missing_skills || []).slice(0, 4).map((gap, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{gap.skill}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      Weight: {gap.weight}x
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full"
                      style={{ width: `${(gap.current_level / gap.required_level) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Current: {gap.current_level}%</span>
                    <span>Required: {gap.required_level}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/analysis"
            className="w-full mt-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold text-center block transition-colors"
          >
            Inspect Skill Radar & Evidence
          </Link>
        </div>
      </div>
    </div>
  );
};

