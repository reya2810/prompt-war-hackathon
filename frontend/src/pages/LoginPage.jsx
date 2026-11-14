import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Sparkles, User, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('full-stack-developer');
  const [hours, setHours] = useState(10);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          target_role_id: role,
          hours_per_week: Number(hours),
          role: 'learner'
        });
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudent = async () => {
    setLoading(true);
    try {
      await login('student@skillpath.ai', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setLoading(true);
    try {
      await login('admin@skillpath.ai', 'admin123');
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">SkillPath <span className="text-indigo-400">AI</span></span>
          </Link>
          <p className="text-xs text-slate-400">
            {isRegister ? "Join the AI-adapted learning cohort" : "Sign in to access your continuous roadmap"}
          </p>
        </div>

        {/* Quick Demo Credentials Card */}
        <div className="mb-6 p-4 rounded-2xl glass-panel border border-indigo-500/30 bg-indigo-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hackathon Demo Fast Pass</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickStudent}
              disabled={loading}
              className="p-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-left text-xs transition-colors"
            >
              <div className="font-bold text-white flex items-center justify-between">
                <span>Demo Student</span>
                <span className="text-[10px] text-indigo-300 font-mono">Alex</span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">Python, SQL &rarr; Full Stack</div>
            </button>
            <button
              type="button"
              onClick={handleQuickAdmin}
              disabled={loading}
              className="p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-left text-xs transition-colors"
            >
              <div className="font-bold text-white flex items-center justify-between">
                <span>Demo Director</span>
                <span className="text-[10px] text-purple-300 font-mono">Admin</span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">Cohort Heatmap & Gaps</div>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="flex rounded-xl bg-slate-900 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                !isRegister ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isRegister ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@skillpath.ai"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Career Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="full-stack-developer">Full Stack Developer</option>
                    <option value="data-scientist">Data Scientist</option>
                    <option value="cloud-engineer">Cloud & DevOps Engineer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Weekly Study Hours ({hours} hrs/week)</label>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    step="2"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "Processing..." : isRegister ? "Initialize Profile & Deploy Agents" : "Sign In to Platform"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

