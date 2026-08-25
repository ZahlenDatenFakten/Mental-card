import React, { useState } from 'react';
import {
  X,
  Upload,
  FileCode,
  FileImage,
  FileJson,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { calculateTreeLayout } from '../../lib/tree-layout';
import {
  exportLayoutToPng,
  exportLayoutToSvgString,
  exportTreeToJson,
  downloadFile,
} from '../../lib/export-utils';
import { exportTreeToMarkdown } from '../../lib/markdown-parser';

export const ExportImportModal: React.FC = () => {
  const {
    root,
    isExportImportOpen,
    setExportImportOpen,
    importFromMarkdown,
    importFromJson,
    resetToDefault,
  } = useMindMapStore();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [markdownInput, setMarkdownInput] = useState('');
  const [copiedMd, setCopiedMd] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isExportImportOpen) return null;

  const currentMarkdown = exportTreeToMarkdown(root);

  const handleExportPng = async () => {
    try {
      const layout = calculateTreeLayout(root);
      await exportLayoutToPng(layout, `${root.title || 'mindmap'}.png`);
    } catch (err) {
      console.error('PNG export failed', err);
    }
  };

  const handleExportSvg = () => {
    try {
      const layout = calculateTreeLayout(root);
      const svgStr = exportLayoutToSvgString(layout);
      downloadFile(svgStr, `${root.title || 'mindmap'}.svg`, 'image/svg+xml;charset=utf-8');
    } catch (err) {
      console.error('SVG export failed', err);
    }
  };

  const handleExportJson = () => {
    exportTreeToJson(root, `${root.title || 'mindmap'}.json`);
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(currentMarkdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed', err);
    }
  };

  const handleImportMarkdownSubmit = () => {
    if (!markdownInput.trim()) {
      setImportError('Пожалуйста, введите текст Markdown');
      return;
    }
    setImportError(null);
    importFromMarkdown(markdownInput);
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importFromJson(content);
      if (!success) {
        setImportError('Некорректный формат JSON файла карты');
      } else {
        setImportError(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onClick={() => setExportImportOpen(false)}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100"
      >
        {/* Header with Segmented Tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
            <button
              onClick={() => setActiveTab('export')}
              className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all active:scale-[0.96] cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-white/[0.15] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Экспорт схемы
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all active:scale-[0.96] cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-white/[0.15] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Импорт данных
            </button>
          </div>

          <button
            onClick={() => setExportImportOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              {/* Quick Format Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* PNG */}
                <button
                  onClick={handleExportPng}
                  className="flex flex-col items-start p-4.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl transition-all duration-150 group text-left shadow-apple-card active:scale-[0.97]"
                >
                  <div className="p-2.5 bg-emerald-500/15 text-[#30D158] border border-emerald-500/30 rounded-xl mb-3 group-hover:scale-105 transition-transform">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white mb-1 tracking-tight">
                    PNG (Hi-DPI)
                  </span>
                  <span className="text-xs text-zinc-400">
                    Растровое изображение 2x для презентаций и отчетов
                  </span>
                </button>

                {/* SVG */}
                <button
                  onClick={handleExportSvg}
                  className="flex flex-col items-start p-4.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl transition-all duration-150 group text-left shadow-apple-card active:scale-[0.97]"
                >
                  <div className="p-2.5 bg-sky-500/15 text-sky-400 border border-sky-500/30 rounded-xl mb-3 group-hover:scale-105 transition-transform">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white mb-1 tracking-tight">
                    Векторный SVG
                  </span>
                  <span className="text-xs text-zinc-400">
                    Бесконечная четкость без потери качества в Figma/Inkscape
                  </span>
                </button>

                {/* JSON */}
                <button
                  onClick={handleExportJson}
                  className="flex flex-col items-start p-4.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl transition-all duration-150 group text-left shadow-apple-card active:scale-[0.97]"
                >
                  <div className="p-2.5 bg-purple-500/15 text-[#BF5AF2] border border-purple-500/30 rounded-xl mb-3 group-hover:scale-105 transition-transform">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white mb-1 tracking-tight">
                    JSON Бекап
                  </span>
                  <span className="text-xs text-zinc-400">
                    Полная структура со всеми свойствами для восстановления
                  </span>
                </button>
              </div>

              {/* Markdown Preview & Copy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Экспорт в виде Markdown-списка
                  </label>
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.08] rounded-xl transition-all active:scale-[0.95]"
                  >
                    {copiedMd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#30D158]" />
                        <span>Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="w-full h-32 p-3.5 bg-black/40 border border-white/[0.08] rounded-2xl text-xs font-mono text-zinc-200 overflow-y-auto select-all leading-relaxed">
                  {currentMarkdown}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Markdown Import Textarea */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Вставьте Markdown список с отступами (табуляция или 2 пробела)
                </label>
                <textarea
                  value={markdownInput}
                  onChange={(e) => setMarkdownInput(e.target.value)}
                  placeholder={`# Главная цель\n  - Подзадача 1\n    - Деталь 1.1\n    - Деталь 1.2 [Ссылка](https://example.com) #frontend !high\n  - Подзадача 2\n    - Деталь 2.1`}
                  rows={6}
                  className="w-full p-3.5 bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] rounded-2xl text-xs font-mono text-white outline-none resize-none leading-relaxed transition-colors"
                />
              </div>

              {importError && (
                <div className="text-xs text-[#FF453A] bg-[#FF453A]/15 border border-[#FF453A]/30 p-3 rounded-xl">
                  {importError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {/* File Upload JSON */}
                  <label className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded-xl transition-all active:scale-[0.95]">
                    <Upload className="w-4 h-4" />
                    <span>Загрузить JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleJsonFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Reset to Default Demo */}
                  <button
                    onClick={() => {
                      resetToDefault();
                      setExportImportOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl transition-all active:scale-[0.95]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Демо-шаблон</span>
                  </button>
                </div>

                <button
                  onClick={handleImportMarkdownSubmit}
                  className="flex items-center gap-2 px-4.5 py-2 text-xs font-semibold apple-emerald-btn rounded-xl transition-all active:scale-[0.95]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Построить карту</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
