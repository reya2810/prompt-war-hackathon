import React, { useState, useEffect } from 'react';
import { Activity, Bot, Filter, RefreshCw, Sparkles, CheckCircle2, Layers } from 'lucide-react';
import { api } from '../api/client';

export const AgentActivityPage = () => {
  const [events, setEvents] = useState([]);
  const [filterAgent, setFilterAgent] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const data = await api.getAgentActivity();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 6000);
    return () => clearInterval(interval);
  }, []);

  const agentBadges = {
    ProfileAgent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CareerAgent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    GapAnalyst: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CurriculumAgent: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    AssessmentAgent: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    MentorAgent: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Orchestrator: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  const agentList = [
    'ALL',
    'Orchestrator',
    'ProfileAgent',
    'CareerAgent',
    'GapAnalyst',
    'CurriculumAgent',
    'AssessmentAgent',
    'MentorAgent',
  ];

  const filteredEvents =
    filterAgent === 'ALL'
      ? events
      : events.filter((e) => e.agent_name.toLowerCase() === filterAgent.toLowerCase());

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Autonomous Agent Bus
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Live Multi-Agent Collaboration Log</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inter-agent messaging, trigger events, and re-planning audit trail for judges.
          </p>
        </div>

        <button
          onClick={loadEvents}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        {agentList.map((agent) => (
          <button
            key={agent}
            onClick={() => setFilterAgent(agent)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterAgent === agent
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {agent}
          </button>
        ))}
      </div>

      {/* Events Stream */}
      {loading ? (
        <div className="p-8 text-center text-xs text-indigo-400">Loading live agent events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-800">
          No agent events logged for this filter yet.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredEvents.map((ev) => {
            const badgeClass = agentBadges[ev.agent_name] || 'bg-slate-800 text-slate-300 border-slate-700';
            return (
              <div
                key={ev.id}
                className="p-5 rounded-2xl glass-panel border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${badgeClass}`}
                    >
                      <Bot className="w-3.5 h-3.5" />
                      {ev.agent_name}
                    </span>
                    <span className="text-xs font-mono text-indigo-300 font-semibold">
                      {ev.event_type}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(ev.timestamp).toLocaleString()}
                  </span>
                </div>

                {ev.input_summary && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-900 text-xs text-slate-400">
                    <strong className="text-slate-300">Context / Input: </strong>
                    {ev.input_summary}
                  </div>
                )}

                {ev.output_summary && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-200">
                    <strong className="text-indigo-400">Agent Decision / Output: </strong>
                    {ev.output_summary}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

