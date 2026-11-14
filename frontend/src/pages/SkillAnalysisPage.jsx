import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Radar as RadarIcon, CheckCircle2, AlertTriangle, FileText, Upload, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const SkillAnalysisPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const loadAnalysis = async () => {
    try {
      const data = await api.getAnalysis();
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setUploading(true);
    try {
      await api.uploadResume(resumeText);
      showToast('Resume parsed by Profile Agent! Gaps and roadmap updated.', 'success', 'Evidence Verified');
      setResumeText('');
      loadAnalysis();
    } catch (err) {
      console.error(err);
      showToast('Failed to parse resume text.', 'warning', 'Upload Error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-indigo-400">Loading comprehensive skill graph...</div>;
  }

  const radarData = analysis?.radar_data || [];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <RadarIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Diagnostic Evaluation
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Skill Graph & Evidence Verification</h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous skill verification combining code assessments, GitHub repositories, and certifications.
          </p>
        </div>

        <div className="p-3 rounded-xl glass-panel border border-slate-800 flex items-center gap-4 text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Job Readiness</div>
            <div className="text-xl font-bold text-indigo-400">{analysis?.readiness_score}%</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Verified Gaps</div>
            <div className="text-xl font-bold text-amber-400">{analysis?.missing_skills?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Radar Chart & Strengths Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm text-white">Competency Radar: Current vs Required</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Current Level
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Required Level
              </span>
            </div>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Required" dataKey="required" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-bold text-sm text-white mb-3">Diagnostic Analysis</h2>

            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Strengths</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(analysis?.strengths || ['Python', 'SQL']).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Priority Gaps (Needs Mastery)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(analysis?.weaknesses || ['JavaScript', 'React', 'Node.js']).map((w, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Resume Text Box */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-2">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Evidence Parser (Resume / GitHub)</span>
            </div>
            <form onSubmit={handleResumeSubmit} className="space-y-2">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste new resume bullet points, GitHub repo descriptions, or certificate titles..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none resize-none"
              />
              <button
                type="submit"
                disabled={uploading || !resumeText.trim()}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Parsing Evidence...' : 'Extract & Update Skills'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Evidence Breakdown Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="font-bold text-sm text-white mb-4">Granular Evidence Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Skill</th>
                <th className="py-3 px-4">Proficiency</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Logged Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(analysis?.evidence_breakdown || []).map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{ev.skill}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-indigo-400">{ev.current_level}%</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{ev.required_level}%</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {ev.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{ev.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

