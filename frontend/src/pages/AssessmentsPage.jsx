import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Bot
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const AssessmentsPage = () => {
  const [skillName, setSkillName] = useState('JavaScript');
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  const skillsList = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];

  const loadAssessment = async (targetSkill) => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const data = await api.getAssessment(targetSkill);
      setAssessment(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment(skillName);
  }, [skillName]);

  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionIdx,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(skillName, answers);
      setResult(res);
      if (res.roadmap_updated) {
        showToast(
          res.explanation || 'Assessment graded! Roadmap adapted dynamically.',
          res.passed ? 'success' : 'warning',
          'Agent Adaptation'
        );
      } else {
        showToast(`Graded: Score ${res.score}%`, 'info', 'Quiz Result');
      }
    } catch (err) {
      console.error(err);
      showToast('Error submitting assessment answers.', 'warning', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFailDemo = async () => {
    // Select index 0 for all questions on JavaScript to intentionally fail for the judges demo
    const wrongAnswers = {};
    (assessment?.questions || []).forEach((q) => {
      wrongAnswers[String(q.id)] = 0;
    });
    setAnswers(wrongAnswers);
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(skillName, wrongAnswers);
      setResult(res);
      showToast(
        "Low score trigger: CurriculumAgent inserted remedial review module & Mentor explains why!",
        "warning",
        "Adaptive Trigger Activated"
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPassDemo = async () => {
    // Select correct answers (all index 1 in seeded bank)
    const passAnswers = {};
    (assessment?.questions || []).forEach((q) => {
      passAnswers[String(q.id)] = 1;
    });
    setAnswers(passAnswers);
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(skillName, passAnswers);
      setResult(res);
      showToast(
        "Score > 80%: Mastery achieved! Milestone unlocked and readiness boosted.",
        "success",
        "Milestone Mastered"
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <CheckSquare className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Verification Engine
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Skill Assessments & Adaptive Quizzes</h1>
        <p className="text-xs text-slate-400 mt-1">
          Auto-graded evaluations that trigger dynamic curriculum re-planning and detect weak subtopics.
        </p>
      </div>

      {/* Skill Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        {skillsList.map((s) => (
          <button
            key={s}
            onClick={() => setSkillName(s)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              skillName === s
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Demo Fast Triggers */}
      <div className="p-4 rounded-xl glass-panel border border-indigo-500/30 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-indigo-300">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>
            <strong>Judges Demo Shortcut:</strong> Test adaptive re-planning instantly:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickFailDemo}
            disabled={submitting}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors"
          >
            Fail Quiz (&lt; 60%)
          </button>
          <button
            onClick={handleQuickPassDemo}
            disabled={submitting}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
          >
            Pass with 100%
          </button>
        </div>
      </div>

      {/* Result Card if submitted */}
      {result && (
        <div
          className={`p-6 rounded-2xl glass-panel border animate-bounce-in ${
            result.passed
              ? 'border-emerald-500/40 bg-emerald-950/20'
              : 'border-amber-500/40 bg-amber-950/20'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {result.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <span className="font-bold text-base text-white">
                  Assessment Result: {result.score.toFixed(0)}% ({result.passed ? 'PASSED' : 'NEEDS REMEDIATION'})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">{result.feedback}</p>

              {result.weak_subtopics?.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-amber-300 mb-1">Detected Knowledge Gaps:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.weak_subtopics.map((sub, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[10px]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.explanation && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
                  <Bot className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>{result.explanation}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Quiz Questions */}
      {loading ? (
        <div className="p-8 text-center text-xs text-indigo-400">Loading questions from bank...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {(assessment?.questions || []).map((q, qIndex) => {
            const currentSelected = answers[String(q.id)];
            return (
              <div key={q.id} className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-indigo-400 font-bold">Question {qIndex + 1}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {q.subtopic || 'General'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white leading-relaxed">{q.question}</h3>

                <div className="space-y-2 pt-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = currentSelected === optIndex;
                    return (
                      <button
                        type="button"
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, optIndex)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                            : 'bg-slate-900/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            isSelected
                              ? 'bg-indigo-500 border-indigo-400 text-white'
                              : 'border-slate-700 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || Object.keys(answers).length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Assessment Agent Grading...' : 'Submit Answers & Trigger Agent Evaluation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

