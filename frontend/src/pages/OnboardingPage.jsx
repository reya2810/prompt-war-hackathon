import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Sliders, Briefcase, Clock, Award, FolderGit2, Check, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const OnboardingPage = () => {
  const { user, refreshUser, showToast } = useAuth();
  const navigate = useNavigate();

  const [hours, setHours] = useState(10);
  const [style, setStyle] = useState('project-first');
  const [targetRole, setTargetRole] = useState('full-stack-developer');
  const [githubUrl, setGithubUrl] = useState('');
  
  const [skills, setSkills] = useState([
    { skill_name: 'Python', level: 75, source: 'project', evidence: 'Data scripting and CLI tools' },
    { skill_name: 'SQL', level: 70, source: 'certificate', evidence: 'Relational schema design' },
    { skill_name: 'HTML/CSS', level: 60, source: 'self', evidence: 'Responsive Flexbox layouts' },
    { skill_name: 'JavaScript', level: 20, source: 'self', evidence: 'Basic syntax' },
    { skill_name: 'React', level: 0, source: 'none', evidence: 'Not yet started' },
    { skill_name: 'Node.js', level: 0, source: 'none', evidence: 'Not yet started' },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setHours(user.hours_per_week || 10);
      setStyle(user.learning_style || 'project-first');
      setTargetRole(user.current_role_id || 'full-stack-developer');
    }
  }, [user]);

  const handleSkillLevelChange = (index, newLevel) => {
    setSkills((prev) => {
      const updated = [...prev];
      updated[index].level = Number(newLevel);
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        hours_per_week: hours,
        learning_style: style,
        target_role_id: targetRole,
        skills: skills,
      });
      showToast('Profile updated! Agent team re-calculated your roadmap.', 'success', 'Saved');
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast('Error saving profile changes.', 'warning', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <User className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Learner Configuration
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Skill Baseline & Pacing Setup</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure your baseline skills and weekly availability to calibrate the Curriculum Agent.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Parameters */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="font-bold text-sm text-white">Target Career & Study Commitment</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Career Goal</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
              >
                <option value="full-stack-developer">Full Stack Developer</option>
                <option value="data-scientist">Data Scientist</option>
                <option value="cloud-engineer">Cloud & DevOps Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Learning Style Preference</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
              >
                <option value="project-first">Project-First (Hands-on code challenges)</option>
                <option value="video-first">Video-First (Lectures & visual walkthroughs)</option>
                <option value="text-first">Text-First (Official docs & tutorials)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
              <span>Weekly Availability</span>
              <span className="font-mono text-indigo-400 font-bold">{hours} hours / week</span>
            </div>
            <input
              type="range"
              min="4"
              max="40"
              step="2"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Skill Proficiency Baseline Sliders */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">Baseline Skill Self-Ratings</h2>
            <span className="text-[11px] text-slate-400">0% = None, 100% = Production Master</span>
          </div>

          <div className="space-y-4 pt-2">
            {skills.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">{s.skill_name}</span>
                  <span className="font-mono text-xs font-bold text-indigo-400">{s.level}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={s.level}
                  onChange={(e) => handleSkillLevelChange(idx, e.target.value)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <span>{saving ? 'Calibrating Multi-Agent Pipeline...' : 'Save Settings & Update Roadmap'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

