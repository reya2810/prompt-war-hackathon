import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  CheckCircle2,
  Lock,
  PlayCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadRoadmap = async () => {
    try {
      const data = await api.getRoadmap();
      setRoadmap(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const handleMarkComplete = async (itemId, skillName) => {
    try {
      await api.completeRoadmapItem(itemId);
      showToast(`Milestone '${skillName}' completed! Dependents unlocked.`, 'success', 'Progress Updated');
      loadRoadmap();
    } catch (e) {
      console.error(e);
      showToast('Could not mark topic as completed.', 'warning', 'Error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-indigo-400">Loading dependency-ordered roadmap...</div>;
  }

  const items = roadmap?.items || [];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <GitBranch className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Topological Schedule
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Dependency-Ordered Learning Roadmap</h1>
          <p className="text-xs text-slate-400 mt-1">
            Strict prerequisite flow scheduled for {roadmap?.role_name || 'Full Stack Developer'} ({roadmap?.total_weeks} weeks).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/assessments"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
          >
            Take Active Quiz
          </Link>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-6 mt-8">
        {items.map((item, idx) => {
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';
          const isLocked = item.status === 'locked';
          const isRemedial = item.reason && (item.reason.toLowerCase().includes('remedial') || item.reason.toLowerCase().includes('low quiz score'));

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Marker Icon */}
              <div
                className={`absolute -left-[35px] sm:-left-[43px] top-4 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-400'
                    : isInProgress
                    ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isInProgress ? (
                  <PlayCircle className="w-4 h-4 animate-pulse" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Card Container */}
              <div
                className={`p-5 rounded-2xl glass-panel border transition-all ${
                  isRemedial
                    ? 'border-amber-500/40 bg-amber-950/20 ring-1 ring-amber-500/30'
                    : isInProgress
                    ? 'border-indigo-500/50 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                    : isCompleted
                    ? 'border-emerald-500/20 bg-emerald-950/10'
                    : 'border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Week {item.week}
                    </span>
                    <h3 className="font-bold text-base text-white">{item.skill_name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isRemedial && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Remedial Adaptation
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isInProgress
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Reason Tag */}
                {item.reason && (
                  <div className="text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Agent Rationale: {item.reason}</span>
                  </div>
                )}

                {/* Practice Task snippet */}
                {item.practice_task && (
                  <div className="text-xs text-slate-400 mb-4">
                    <strong className="text-slate-200">Practice Task: </strong>
                    {item.practice_task.description}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500">
                    {item.resources?.length || 0} Learning Resources Attached
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/learn"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Study Topics</span>
                    </Link>
                    {!isCompleted && !isLocked && (
                      <button
                        onClick={() => handleMarkComplete(item.id, item.skill_name)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

