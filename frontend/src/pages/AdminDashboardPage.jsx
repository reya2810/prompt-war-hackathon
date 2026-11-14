import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, TrendingUp, BookOpen, ShieldAlert, Award, Sparkles } from 'lucide-react';
import { api } from '../api/client';

export const AdminDashboardPage = () => {
  const [cohortData, setCohortData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCohort = async () => {
      try {
        const data = await api.getCohortAnalytics();
        setCohortData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCohort();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-indigo-400">Loading cohort telemetry & heatmap...</div>;
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Users className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Institutional Oversight
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Cohort Skill Heatmap & At-Risk Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cohort ID: <span className="font-mono text-indigo-300 font-bold">{cohortData?.cohort_id}</span> &bull; 
          Empowering universities and enterprise HR to proactively schedule workshops before learners fall behind.
        </p>
      </div>

      {/* Top Cohort Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Enrolled Learners</div>
          <div className="text-3xl font-extrabold text-white">{cohortData?.total_students || 5}</div>
          <div className="text-[11px] text-slate-500 mt-1">Autonomous tracking active</div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Cohort Mean Job Readiness</div>
          <div className="text-3xl font-extrabold text-indigo-400">{cohortData?.avg_readiness || 45}%</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">+14.2% across 30 days</div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">At-Risk Learners Requiring Support</div>
          <div className="text-3xl font-extrabold text-amber-400">{cohortData?.at_risk_learners?.length || 0}</div>
          <div className="text-[11px] text-amber-300 mt-1">Nudges & remedial pathways assigned</div>
        </div>
      </div>

      {/* Skill Heatmap Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-sm text-white">Cohort Competency Heatmap</h2>
            <p className="text-xs text-slate-400">Distribution of proficiency levels and gap density across the cohort.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(cohortData?.skill_heatmap || []).map((cell, idx) => {
            const isHighGap = cell.gap_percentage >= 50;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isHighGap
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">{cell.skill}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHighGap
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {cell.gap_percentage}% Gap
                  </span>
                </div>
                <div className="text-xs text-slate-300 mb-1">
                  Avg Proficiency: <strong className="text-indigo-400">{cell.avg_level}%</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  {cell.at_risk_students} students below benchmark
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Workshops & Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h2 className="font-bold text-sm text-white">Recommended Cohort Workshops</h2>
          </div>
          <div className="space-y-3">
            {(cohortData?.top_skill_gaps || []).map((gap, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{gap.skill} Workshop</span>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold">
                    {gap.gap_percentage}% of cohort lacks proficiency
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{gap.recommended_action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Learners Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm text-white">Learners Requiring Intervention</h2>
          </div>
          <div className="space-y-3">
            {(cohortData?.at_risk_learners || []).map((learner) => (
              <div key={learner.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{learner.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                      {learner.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{learner.email} &bull; Targeting {learner.role}</div>
                  <div className="text-xs text-indigo-300 mt-1">Recommended: {learner.recommended_nudge}</div>
                </div>
                <div className="font-mono text-sm font-bold text-amber-400">
                  {learner.readiness_score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

