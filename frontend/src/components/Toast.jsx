import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Toast = () => {
  const { toast } = useAuth();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Sparkles className="w-5 h-5 text-indigo-400" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/80',
    warning: 'border-amber-500/30 bg-amber-950/80',
    info: 'border-indigo-500/30 bg-indigo-950/80',
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-bounce-in shadow-2xl">
      <div className={`p-4 rounded-xl border backdrop-blur-xl ${borders[toast.type] || borders.info} text-slate-100 flex items-start gap-3`}>
        <div className="p-1 rounded-lg bg-white/5">
          {icons[toast.type] || icons.info}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
            {toast.title}
          </div>
          <div className="text-sm text-slate-200 mt-0.5 leading-snug">
            {toast.message}
          </div>
        </div>
      </div>
    </div>
  );
};

