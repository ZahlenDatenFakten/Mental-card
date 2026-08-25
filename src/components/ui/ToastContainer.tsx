import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { ToastType } from '../../types/mindmap';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMindMapStore();

  if (toasts.length === 0) return null;

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#30D158]" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-[#FF453A]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#FF9F0A]" />;
      default:
        return <Info className="w-4 h-4 text-[#0A84FF]" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col gap-2.5 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto apple-glass-card rounded-2xl p-3.5 shadow-apple-hud border border-white/[0.12] flex items-start gap-3 text-zinc-100 animate-apple-scale-in transition-all"
        >
          <div className="p-1 rounded-lg bg-white/[0.06] flex-shrink-0 mt-0.5">
            {getToastIcon(toast.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white tracking-tight">
              {toast.title}
            </div>
            {toast.message && (
              <div className="text-[11px] text-zinc-300 mt-0.5 leading-snug font-sans">
                {toast.message}
              </div>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-all active:scale-[0.9] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
