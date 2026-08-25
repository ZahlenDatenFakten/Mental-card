import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Link,
  ShieldCheck,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { generateShareUrl } from '../../lib/share-utils';

export const ShareModal: React.FC = () => {
  const {
    root,
    isShareOpen,
    setShareOpen,
    activeCaseId,
    cases,
  } = useMindMapStore();

  const [copied, setCopied] = useState(false);

  if (!isShareOpen) return null;

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];
  const shareUrl = generateShareUrl(root);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      onClick={() => setShareOpen(false)}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-[#30D158] rounded-2xl shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Поделиться ментальной картой дела
              </h2>
              <p className="text-xs text-zinc-400">
                Создайте автономную ссылку для передачи коллегам или клиенту
              </p>
            </div>
          </div>

          <button
            onClick={() => setShareOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Globe className="w-4 h-4 text-[#0A84FF]" />
              <span>Автономная ссылка с данными дела</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Вся структура дела, тезисы, доказательства и хронология упакованы прямо в ссылку (LZ-String компрессия). Получатель сразу откроет готовую интерактивную карту в браузере без регистрации.
            </p>
          </div>

          {/* Link Box */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5" />
              <span>Прямая ссылка на дело «{activeCase?.title}»</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-black/40 border border-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-xs font-mono select-all outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold apple-emerald-btn rounded-xl transition-all active:scale-[0.95] cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-[#30D158]" />
            <span>Конфиденциально: данные передаются напрямую через URL хэш</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 flex items-center justify-between">
          <span>Размер ссылки: ~{Math.round(shareUrl.length / 1024 * 10) / 10} КБ</span>
          <button
            onClick={() => setShareOpen(false)}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
