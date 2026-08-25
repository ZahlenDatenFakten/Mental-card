import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { ToastMessage } from '../../types/mindmap';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMindMapStore();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 bg-zinc-950/95';
      case 'error':
        return 'border-rose-500/40 bg-zinc-950/95';
      case 'warning':
        return 'border-amber-500/40 bg-zinc-950/95';
      default:
        return 'border-sky-500/40 bg-zinc-950/95';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-floating backdrop-blur-md animate-scale-in transition-all ${getBorderColor(
            toast.type
          )}`}
        >
          <div className="mt-0.5">{getIcon(toast.type)}</div>

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-semibold text-zinc-100 leading-tight">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
