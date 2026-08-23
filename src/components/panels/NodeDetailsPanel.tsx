import React, { useState } from 'react';
import {
  X,
  FileText,
  Link,
  Tag,
  AlertCircle,
  Palette,
  Trash2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { findNodeInTree } from '../../lib/tree-layout';
import { PriorityLevel } from '../../types/mindmap';

const PRESET_COLORS = [
  '#38bdf8', // sky-400
  '#34d399', // emerald-400
  '#a78bfa', // violet-400
  '#fb923c', // orange-400
  '#f472b6', // pink-400
  '#facc15', // amber-400
  '#2dd4bf', // teal-400
  '#818cf8', // indigo-400
  '#94a3b8', // slate-400
];

export const NodeDetailsPanel: React.FC = () => {
  const {
    root,
    selectedId,
    isSidebarOpen,
    setSidebarOpen,
    updateNode,
    deleteNode,
  } = useMindMapStore();

  const [tagInput, setTagInput] = useState('');

  if (!isSidebarOpen) return null;

  const currentNode = selectedId ? findNodeInTree(root, selectedId) : null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedId) updateNode(selectedId, { title: e.target.value });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedId) updateNode(selectedId, { notes: e.target.value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedId) updateNode(selectedId, { url: e.target.value });
  };

  const handlePriorityChange = (priority?: PriorityLevel) => {
    if (selectedId) updateNode(selectedId, { priority });
  };

  const handleColorChange = (color?: string) => {
    if (selectedId) updateNode(selectedId, { color });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && selectedId && currentNode) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      const existing = currentNode.tags || [];
      if (!existing.includes(cleanTag)) {
        updateNode(selectedId, { tags: [...existing, cleanTag] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (selectedId && currentNode && currentNode.tags) {
      updateNode(selectedId, {
        tags: currentNode.tags.filter((t) => t !== tagToRemove),
      });
    }
  };

  return (
    <aside className="fixed top-14 right-0 bottom-0 z-30 w-80 sm:w-96 bg-zinc-950/95 border-l border-zinc-850 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto backdrop-blur-md animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: currentNode?.color || (currentNode?.id === root.id ? '#10b981' : '#71717a'),
              }}
            />
            <h2 className="text-sm font-semibold text-zinc-100">
              Свойства узла
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!currentNode ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            Выберите узел на холсте для редактирования свойств
          </div>
        ) : (
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Заголовок
              </label>
              <input
                type="text"
                value={currentNode.title}
                onChange={handleTitleChange}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              />
            </div>

            {/* Accent Color */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                <Palette className="w-3.5 h-3.5" />
                Цвет ветки
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleColorChange(undefined)}
                  title="По умолчанию"
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] text-zinc-400 ${
                    !currentNode.color ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  ✕
                </button>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      currentNode.color === color
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Приоритет
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                {(['none', 'low', 'medium', 'high'] as const).map((p) => {
                  const isSelected =
                    p === 'none' ? !currentNode.priority : currentNode.priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePriorityChange(p === 'none' ? undefined : p)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                        isSelected
                          ? p === 'high'
                            ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                            : p === 'medium'
                            ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                            : p === 'low'
                            ? 'bg-sky-950/80 border-sky-700 text-sky-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                      }`}
                    >
                      {p === 'none'
                        ? 'Нет'
                        : p === 'low'
                        ? 'Низкий'
                        : p === 'medium'
                        ? 'Средний'
                        : 'Высокий'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                <Tag className="w-3.5 h-3.5" />
                Теги (Enter для добавления)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {currentNode.tags?.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md"
                  >
                    #{t}
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Добавить тег..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-1.5 rounded-lg text-xs outline-none transition-colors"
              />
            </div>

            {/* External URL Reference */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                <Link className="w-3.5 h-3.5" />
                Ссылка на источник
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  value={currentNode.url || ''}
                  onChange={handleUrlChange}
                  placeholder="https://..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-lg text-xs outline-none transition-colors"
                />
                {currentNode.url && (
                  <a
                    href={currentNode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors"
                    title="Открыть ссылку"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Markdown Notes */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                Заметки (Markdown)
              </label>
              <textarea
                value={currentNode.notes || ''}
                onChange={handleNotesChange}
                rows={5}
                placeholder="Подробное описание или заметки к узлу..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 p-3 rounded-lg text-xs font-mono outline-none resize-y transition-colors leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Delete Action */}
      {currentNode && (
        <div className="pt-4 mt-6 border-t border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
            <Calendar className="w-3 h-3" />
            <span>ID: {currentNode.id.slice(0, 10)}</span>
          </div>

          {currentNode.id !== root.id && (
            <button
              onClick={() => deleteNode(currentNode.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:text-white bg-rose-950/30 hover:bg-rose-900/60 border border-rose-900/60 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
