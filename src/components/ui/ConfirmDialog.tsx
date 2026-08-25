import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { Kbd } from './Kbd';

export const ConfirmDialog: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useMindMapStore();

  useEffect(() => {
    if (!confirmDialog.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        confirmDialog.onCancel?.();
        closeConfirmDialog();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        confirmDialog.onConfirm();
        closeConfirmDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog, closeConfirmDialog]);

  if (!confirmDialog.isOpen) return null;

  const getVariantStyles = () => {
    switch (confirmDialog.variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-400" />,
          btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50',
          iconBg: 'bg-rose-950/60 border-rose-800/80',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          btn: 'bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold shadow-amber-950/50',
          iconBg: 'bg-amber-950/60 border-amber-800/80',
        };
      default:
        return {
          icon: <Info className="w-6 h-6 text-emerald-400" />,
          btn: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-emerald-950/50',
          iconBg: 'bg-emerald-950/60 border-emerald-800/80',
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirmDialog();
  };

  const handleCancel = () => {
    confirmDialog.onCancel?.();
    closeConfirmDialog();
  };

  return (
    <div
      onClick={handleCancel}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in flex flex-col text-zinc-100"
      >
        {/* Header with Icon */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className={`p-3 rounded-xl border flex-shrink-0 ${styles.iconBg}`}>
            {styles.icon}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base font-semibold text-zinc-100 leading-snug">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              {confirmDialog.message}
            </p>
          </div>

          <button
            onClick={handleCancel}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Kbd>Enter</Kbd> Подтвердить
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd> Отмена
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              {confirmDialog.cancelLabel || 'Отмена'}
            </button>

            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer ${styles.btn}`}
            >
              {confirmDialog.confirmLabel || 'Подтвердить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
