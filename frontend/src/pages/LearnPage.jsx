import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Video,
  FileCode,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Code
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const LearnPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadData = async () => {
    try {
      const data = await api.getRoadmap();
      setRoadmap(data);
      const active = data?.items?.find((i) => i.status === 'in_progress') || data?.items?.[0];
      setSelectedItem(active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (item) => {
    try {
      await api.completeRoadmapItem(item.id);
      showToast(`Completed milestone: ${item.skill_name}`, 'success', 'Topic Completed');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-indigo-400">Loading learning modules...</div>;
  }

  const items = roadmap?.items || [];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Hands-on Resource Hub
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Curated Resources & Hands-on Milestones</h1>
        <p className="text-xs text-slate-400 mt-1">
          Targeted tutorials, exercises, and micro-projects curated by the Curriculum Agent.
        </p>
      </div>

      {/* Main Layout: Topic selector on left, content on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Topic Selector */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider px-2 py-1">
            Roadmap Milestones
          </div>
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setSelectedItem(it)}
              className={`w-full text-left p-3 rounded-xl transition-all border ${
                selectedItem?.id === it.id
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">{it.skill_name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  W{it.week}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{it.resources?.length || 3} resources</span>
                <span
                  className={`font-semibold capitalize ${
                    it.status === 'completed'
                      ? 'text-emerald-400'
                      : it.status === 'in_progress'
                      ? 'text-indigo-400'
                      : 'text-slate-500'
                  }`}
                >
                  {it.status.replace('_', ' ')}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Active Topic Details */}
        <div className="lg:col-span-2 space-y-5">
          {selectedItem && (
            <>
              {/* Active Topic Banner */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                      Week {selectedItem.week}
                    </span>
                    <span className="text-xs text-slate-400">
                      Status: {selectedItem.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{selectedItem.skill_name}</h2>
                  {selectedItem.reason && (
                    <p className="text-xs text-amber-300/90 mt-1">
                      {selectedItem.reason}
                    </p>
                  )}
                </div>

                {selectedItem.status !== 'completed' && (
                  <button
                    onClick={() => handleComplete(selectedItem)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete & Unlock Next</span>
                  </button>
                )}
              </div>

              {/* Resource List */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Curated Learning Materials</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(selectedItem.resources || []).map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                            {res.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{res.duration}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {res.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                        <span className="capitalize">{res.difficulty}</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:text-indigo-400" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Practice Milestone Task */}
              {selectedItem.practice_task && (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">
                      {selectedItem.practice_task.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {selectedItem.practice_task.description}
                  </p>

                  {selectedItem.practice_task.starter_code && (
                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                      <pre>{selectedItem.practice_task.starter_code}</pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

