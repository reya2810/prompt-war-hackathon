import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Award, Flame, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../api/client';

export const ProgressPage = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await api.getProgress();
        setProgress(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-indigo-400">Loading learning progression telemetry...</div>;
  }

  const trendData = progress?.readiness_trend || [
    { day: 'Day 1', readiness: 20 },
    { day: 'Day 3', readiness: 28 },
    { day: 'Day 5', readiness: 36 },
    { day: 'Today', readiness: progress?.readiness_score || 42 },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Trajectory Analytics
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Progression Velocity & Assessment History</h1>
        <p className="text-xs text-slate-400 mt-1">
          Tracking your readiness score trend, completed milestones, and verified assessments.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Overall Readiness</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {progress?.readiness_score?.toFixed(1) || '42.0'}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">+18.5% this cohort</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Milestone Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {progress?.completion_percentage || 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {progress?.completed_milestones || 0} of {progress?.total_milestones || 0} milestones
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {progress?.streak_days || 4} Days
          </div>
          <div className="text-[11px] text-amber-300 mt-1 font-semibold">Keep momentum active!</div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Weekly Study Target</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {progress?.weekly_hours_target || 10} hrs/wk
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Adaptive pace scheduling</div>
        </div>
      </div>

      {/* Readiness Trend Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="font-bold text-sm text-white mb-2">Job-Readiness Progression Curve</h2>
        <p className="text-xs text-slate-400 mb-6">
          Dynamic readiness rating mapped across weekly practice milestones and assessments.
        </p>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="readiness"
                name="Job Readiness %"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#818cf8', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assessment History Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="font-bold text-sm text-white mb-4">Historical Assessment Submissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Skill Evaluated</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Submission Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(progress?.score_history || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No assessment attempts recorded yet. Head over to Assessments to take your first quiz!
                  </td>
                </tr>
              ) : (
                progress.score_history.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-bold text-white">{s.skill}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{s.score}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.score >= 60
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {s.score >= 60 ? 'PASSED' : 'REMEDIATED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{s.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

