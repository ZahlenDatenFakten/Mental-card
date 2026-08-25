import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { generateShareUrl } from '../../lib/share-utils';

export const ShareModal: React.FC = () => {
  const {
    root,
    isShareOpen,
    setShareOpen,
  } = useMindMapStore();

  const [copied, setCopied] = useState(false);

  if (!isShareOpen) return null;

  const shareUrl = generateShareUrl(root);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={() => setShareOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 rounded-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Поделиться юридической картой
              </h2>
              <p className="text-xs text-zinc-400">
                Отправьте ссылку коллеге, доверителю или партнеру в один клик
              </p>
            </div>
          </div>

          <button
            onClick={() => setShareOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Share Link Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Уникальная ссылка на дело (все данные зашифрованы в ссылке)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 outline-none select-all truncate"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-md flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
              </button>
            </div>
          </div>

          {/* Privacy & Technology Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Globe className="w-4 h-4" />
                <span>Работает без регистрации</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Получатель ссылки сразу увидит полное интерактивное дерево, хронологию и реестр доказательств в браузере.
              </p>
            </div>

            <div className="p-3.5 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <Lock className="w-4 h-4" />
                <span>Безопасность данных</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Структура дела упакована сжатием LZ-String. Данные не передаются на сторонние серверы и хранятся на вашем устройстве.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-850 bg-zinc-900/40 text-xs text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Ссылка готова для отправки в Telegram, почту или мессенджер
          </span>
        </div>
      </div>
    </div>
  );
};
