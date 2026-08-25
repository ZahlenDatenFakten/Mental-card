import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';

export const ConfirmDialog: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useMindMapStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!confirmDialog.isOpen) return;

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

  const getVariantIcon = () => {
    switch (confirmDialog.variant) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-[#FF453A]" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-[#FF9F0A]" />;
      default:
        return <Info className="w-5 h-5 text-[#0A84FF]" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (confirmDialog.variant) {
      case 'danger':
        return 'bg-[#FF453A] hover:bg-[#ff5b52] text-white shadow-sm border border-[#FF453A]';
      case 'warning':
        return 'bg-[#FF9F0A] hover:bg-[#ffaa2b] text-black font-semibold shadow-sm border border-[#FF9F0A]';
      default:
        return 'apple-primary-btn';
    }
  };

  return (
    <div
      onClick={() => {
        confirmDialog.onCancel?.();
        closeConfirmDialog();
      }}
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] p-6 animate-apple-scale-in text-zinc-100 flex flex-col"
      >
        {/* Header with Icon */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/[0.08] shadow-sm">
              {getVariantIcon()}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight">
                {confirmDialog.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              confirmDialog.onCancel?.();
              closeConfirmDialog();
            }}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-zinc-300 leading-relaxed font-sans mb-6">
          {confirmDialog.message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              confirmDialog.onCancel?.();
              closeConfirmDialog();
            }}
            className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded-xl transition-all active:scale-[0.95] cursor-pointer"
          >
            {confirmDialog.cancelLabel || 'Отмена'}
          </button>

          <button
            type="button"
            onClick={() => {
              confirmDialog.onConfirm();
              closeConfirmDialog();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all active:scale-[0.95] cursor-pointer ${getConfirmButtonClass()}`}
          >
            {confirmDialog.confirmLabel || 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  );
};
