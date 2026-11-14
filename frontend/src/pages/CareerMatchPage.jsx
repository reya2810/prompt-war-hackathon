import React, { useState, useEffect } from 'react';
import { Briefcase, Check, ArrowRight, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CareerMatchPage = () => {
  const [roles, setRoles] = useState([]);
  const [currentRoleId, setCurrentRoleId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const { showToast, refreshUser } = useAuth();

  const loadData = async () => {
    try {
      const [rolesData, anData] = await Promise.all([
        api.getRoles(),
        api.getAnalysis()
      ]);
      setRoles(rolesData);
      setAnalysis(anData);
      setCurrentRoleId(anData.role_id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitchRole = async (newRoleId) => {
    if (newRoleId === currentRoleId || switching) return;
    setSwitching(true);
    try {
      const res = await api.setGoal(newRoleId);
      setCurrentRoleId(newRoleId);
      showToast(
        `Goal switched to ${newRoleId.replace(/-/g, ' ')}! Agents re-planned the dependency roadmap.`,
        'success',
        'Goal Changed'
      );
      await refreshUser();
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to switch career goal.', 'warning', 'Error');
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-indigo-400">Loading career ontologies & target roles...</div>;
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Target Career Alignment
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Role Matching & Adaptive Goal Switching</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Judges demo trigger: Switching your goal re-routes the entire plan. Existing competencies (such as Python & SQL) are automatically reused to accelerate readiness.
        </p>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {roles.map((r) => {
          const isSelected = r.id === currentRoleId;
          return (
            <div
              key={r.id}
              className={`p-6 rounded-2xl glass-panel border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold">
                  <Check className="w-3 h-3" />
                  <span>Active Goal</span>
                </div>
              )}

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {r.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 mb-2">{r.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {r.description}
                </p>

                <div className="text-xs font-semibold text-slate-300 mb-2">Core Competencies:</div>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {r.required_skills.map((req, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {req.skill}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSwitchRole(r.id)}
                disabled={isSelected || switching}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                {isSelected ? (
                  <span>Currently Tracking</span>
                ) : (
                  <>
                    <span>Switch Goal to {r.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Matched vs Missing Skills breakdown for currently active role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Matched Skills */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">
              Transferable & Matched Competencies ({analysis?.matched_skills?.length || 0})
            </h2>
          </div>
          <div className="space-y-3">
            {(analysis?.matched_skills || []).length === 0 ? (
              <div className="text-xs text-slate-400 p-4 bg-slate-900/50 rounded-xl text-center">
                No matching skills found for this role yet. Complete beginner milestones to build foundational competencies!
              </div>
            ) : (
              (analysis?.matched_skills || []).map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white">{m.skill}</div>
                    <div className="text-[10px] text-slate-400">{m.evidence}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-emerald-400">{m.level}%</div>
                    <div className="text-[9px] text-slate-500">Req: {m.required_level}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing Skills with Priority */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm text-white">
              Targeted Skill Gaps & Prerequisites ({analysis?.missing_skills?.length || 0})
            </h2>
          </div>
          <div className="space-y-3">
            {(analysis?.missing_skills || []).map((gap, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <span>{gap.skill}</span>
                    {gap.is_prerequisite && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Prerequisite
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Gap Priority: {gap.gap_score} (Weight: {gap.weight}x)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-amber-400">{gap.current_level}%</div>
                  <div className="text-[9px] text-slate-500">Req: {gap.required_level}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

