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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in flex flex-col"
      >
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-850 bg-zinc-900/40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('export')}
              className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                activeTab === 'export'
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              Экспорт схемы
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                activeTab === 'import'
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              Импорт данных
            </button>
          </div>

          <button
            onClick={() => setExportImportOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors"
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
                  className="flex flex-col items-start p-4 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group text-left"
                >
                  <div className="p-2 bg-zinc-800 rounded-lg text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-100 mb-1">
                    PNG (Hi-DPI)
                  </span>
                  <span className="text-xs text-zinc-400">
                    Растровое изображение 2x для презентаций и отчетов
                  </span>
                </button>

                {/* SVG */}
                <button
                  onClick={handleExportSvg}
                  className="flex flex-col items-start p-4 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group text-left"
                >
                  <div className="p-2 bg-zinc-800 rounded-lg text-sky-400 mb-3 group-hover:scale-105 transition-transform">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-100 mb-1">
                    Векторный SVG
                  </span>
                  <span className="text-xs text-zinc-400">
                    Бесконечная четкость без потери качества в Figma/Inkscape
                  </span>
                </button>

                {/* JSON */}
                <button
                  onClick={handleExportJson}
                  className="flex flex-col items-start p-4 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group text-left"
                >
                  <div className="p-2 bg-zinc-800 rounded-lg text-violet-400 mb-3 group-hover:scale-105 transition-transform">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-100 mb-1">
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
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors"
                  >
                    {copiedMd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                <pre className="w-full h-32 p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 overflow-y-auto select-all leading-relaxed">
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
                  className="w-full p-3 bg-zinc-900/90 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs font-mono text-zinc-200 outline-none resize-none leading-relaxed transition-colors"
                />
              </div>

              {importError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-lg">
                  {importError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {/* File Upload JSON */}
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-colors">
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
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Демо-шаблон</span>
                  </button>
                </div>

                <button
                  onClick={handleImportMarkdownSubmit}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-colors"
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
