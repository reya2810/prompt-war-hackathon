import React, { useState } from 'react';
import { Sliders, Sparkles, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import { ReadinessGauge } from '../components/ReadinessGauge';

export const CareerSimulatorPage = () => {
  const [selectedSkill, setSelectedSkill] = useState('JavaScript');
  const [targetLevel, setTargetLevel] = useState(85);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const popularSkills = [
    'JavaScript',
    'React',
    'Node.js',
    'Docker',
    'Kubernetes',
    'Machine Learning',
    'REST APIs',
    'TypeScript',
  ];

  const handleSimulate = async (skill = selectedSkill, level = targetLevel) => {
    setLoading(true);
    try {
      const res = await api.simulateImpact(skill, level);
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sliders className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Predictive Modeling
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Career What-If Simulator</h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate how mastering a new skill directly moves your job readiness needle before committing weeks of study.
        </p>
      </div>

      {/* Simulator Control Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Select Competency to Simulate
          </label>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((sk) => (
              <button
                key={sk}
                onClick={() => {
                  setSelectedSkill(sk);
                  handleSimulate(sk, targetLevel);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedSkill === sk
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            <span>Projected Proficiency Level</span>
            <span className="font-mono text-indigo-400 font-bold">{targetLevel}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            step="5"
            value={targetLevel}
            onChange={(e) => {
              setTargetLevel(Number(e.target.value));
            }}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Fundamental (30%)</span>
            <span>Working Knowledge (60%)</span>
            <span>Advanced Production (85%)</span>
            <span>Mastery (100%)</span>
          </div>
        </div>

        <button
          onClick={() => handleSimulate()}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>{loading ? 'Simulating Career Graph...' : `Calculate Readiness Impact for ${selectedSkill}`}</span>
        </button>
      </div>

      {/* Simulation Result Presentation */}
      {simResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 animate-bounce-in space-y-6">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Projected Outcome for {simResult.skill_added} @ {simResult.target_level}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Before Gauge */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <ReadinessGauge score={simResult.current_readiness} size={140} label="Current" />
              <div className="text-[11px] text-slate-400 mt-2 font-medium">Baseline Readiness</div>
            </div>

            {/* Delta Shift Indicator */}
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                +{simResult.delta.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-1">Readiness Surge</div>
            </div>

            {/* After Gauge */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-slate-900/60 border border-indigo-500/30">
              <ReadinessGauge score={simResult.projected_readiness} size={140} label="Projected" />
              <div className="text-[11px] text-indigo-300 mt-2 font-medium">With {simResult.skill_added}</div>
            </div>
          </div>

          {/* Impact narrative */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-indigo-400">Strategic Impact: </strong>
            {simResult.impact_description}
          </div>
        </div>
      )}
    </div>
  );
};

