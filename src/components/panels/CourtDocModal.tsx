import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  Scale,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { generateCourtMemorandum } from '../../lib/court-doc-generator';
import { downloadFile } from '../../lib/export-utils';

export const CourtDocModal: React.FC = () => {
  const {
    root,
    isCourtDocOpen,
    setCourtDocOpen,
  } = useMindMapStore();

  const [copied, setCopied] = useState(false);

  if (!isCourtDocOpen) return null;

  const docText = generateCourtMemorandum(root);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(docText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    downloadFile(
      docText,
      `${root.title || 'Судебный_меморандум'}.md`,
      'text/markdown;charset=utf-8'
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${root.title} — Правовая позиция</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5; color: #000; padding: 40px; margin: 0; }
          h1 { font-size: 18pt; text-align: center; margin-bottom: 20px; font-weight: bold; text-transform: uppercase; }
          h2 { font-size: 15pt; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-top: 30px; font-weight: bold; }
          h3 { font-size: 14pt; margin-top: 15px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11pt; }
          th, td { border: 1px solid #000; padding: 6px 10px; text-align: left; vertical-align: top; }
          th { background: #f0f0f0; font-weight: bold; }
          blockquote { border-left: 3px solid #333; margin: 10px 0; padding-left: 15px; font-style: italic; }
          @media print {
            body { padding: 15mm; }
            @page { margin: 15mm; size: A4; }
          }
        </style>
      </head>
      <body>
        <pre style="white-space: pre-wrap; font-family: 'Times New Roman', serif;">${docText}</pre>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div
      onClick={() => setCourtDocOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-950/60 border border-violet-800/80 text-violet-400 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Судебный меморандум и правовая позиция
              </h2>
              <p className="text-xs text-zinc-400">
                Автоматически сформированный процессуальный документ на основе карты дела
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано' : 'Копировать'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Скачать документ в формате Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .md</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded-lg transition-colors cursor-pointer"
              title="Распечатать или сохранить в PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать / PDF</span>
            </button>

            <button
              onClick={() => setCourtDocOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-zinc-900/30 font-mono text-xs leading-relaxed text-zinc-200 select-text">
          <pre className="whitespace-pre-wrap font-mono p-4 bg-zinc-950/90 border border-zinc-855 rounded-xl">
            {docText}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-850 bg-zinc-900/40 text-xs text-zinc-500 flex items-center justify-between">
          <span>Документ включает: Фабулу, Тезисы, Нормы права, Реестр доказательств и Риски</span>
          <span className="font-mono">Готово для подготовки к судебному заседанию</span>
        </div>
      </div>
    </div>
  );
};
