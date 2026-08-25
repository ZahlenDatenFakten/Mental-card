import React, { useState } from 'react';
import {
  X,
  FileText,
  Link,
  Tag,
  Palette,
  Trash2,
  Calendar,
  ExternalLink,
  Scale,
  BookOpen,
  FileCheck,
  ShieldAlert,
  Zap,
  AlertTriangle,
  Gavel,
  Star,
  Copy,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { findNodeInTree } from '../../lib/tree-layout';
import {
  LegalNodeType,
  EvidenceStatus,
  EvidenceType,
} from '../../types/mindmap';

const PRESET_COLORS = [
  '#38bdf8', // sky-400 (арбитраж / общий)
  '#34d399', // emerald-400 (хронология / доказательства)
  '#a78bfa', // violet-400 (тезисы / позиция)
  '#fb923c', // orange-400 (оппонент)
  '#f472b6', // pink-400 (требования)
  '#facc15', // amber-400 (опровержения)
  '#f43f5e', // rose-500 (риски)
  '#94a3b8', // slate-400 (нейтральный)
];

const LEGAL_TYPES: { type: LegalNodeType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'thesis', label: 'Тезис / Позиция', icon: <Scale className="w-4 h-4 text-violet-400" />, desc: 'Ключевое утверждение стороны' },
  { type: 'fact_timeline', label: 'Факт / Хронология', icon: <Calendar className="w-4 h-4 text-amber-400" />, desc: 'Юридический факт с датой' },
  { type: 'norm', label: 'Норма права', icon: <BookOpen className="w-4 h-4 text-sky-400" />, desc: 'Статья закона, пленум ВС, прецедент' },
  { type: 'evidence', label: 'Доказательство', icon: <FileCheck className="w-4 h-4 text-emerald-400" />, desc: 'Документ, экспертиза, том/л.д.' },
  { type: 'counter_arg', label: 'Довод оппонента', icon: <ShieldAlert className="w-4 h-4 text-orange-400" />, desc: 'Возражение противной стороны' },
  { type: 'rebuttal', label: 'Опровержение', icon: <Zap className="w-4 h-4 text-yellow-400" />, desc: 'Контр-позиция и доказательства' },
  { type: 'risk', label: 'Риск / Уязвимость', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, desc: 'Слабое место позиции в суде' },
  { type: 'remedy', label: 'Требование иска', icon: <Gavel className="w-4 h-4 text-pink-400" />, desc: 'Просительная часть' },
  { type: 'general', label: 'Общий блок', icon: <FileText className="w-4 h-4 text-zinc-400" />, desc: 'Вспомогательная ветка' },
];

export const NodeDetailsPanel: React.FC = () => {
  const {
    root,
    selectedId,
    isSidebarOpen,
    setSidebarOpen,
    updateNode,
    deleteNode,
    duplicateNode,
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

  const handleTypeChange = (nodeType: LegalNodeType) => {
    if (selectedId) updateNode(selectedId, { nodeType });
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
    <aside className="h-full z-30 w-80 sm:w-96 bg-zinc-950/95 border-l border-zinc-850 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto backdrop-blur-md animate-fade-in text-zinc-100 flex-shrink-0">
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
              Инспектор юридического блока
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!currentNode ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            Выберите узел на схеме для настройки доказательств и правовой позиции
          </div>
        ) : (
          <div className="space-y-5">
            {/* Legal Entity Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Юридическая категория блока
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {LEGAL_TYPES.map((item) => {
                  const isCurrent = (currentNode.nodeType || 'general') === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleTypeChange(item.type)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-zinc-800 border-emerald-500/80 text-zinc-50 shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                      }`}
                    >
                      {item.icon}
                      <span className="truncate font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Формулировка / Заголовок
              </label>
              <input
                type="text"
                value={currentNode.title}
                onChange={handleTitleChange}
                placeholder="Сформулируйте тезис, факт или требование..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              />
            </div>

            {/* Law Article / Norm & Citation */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Норма права и закон</span>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Статья закона / Пленум ВС РФ
                </label>
                <input
                  type="text"
                  value={currentNode.lawArticle || ''}
                  onChange={(e) => selectedId && updateNode(selectedId, { lawArticle: e.target.value })}
                  placeholder="напр. ст. 309, 310 ГК РФ"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-sky-500 text-zinc-100 px-2.5 py-1.5 rounded-lg text-xs outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Цитата из закона / судебного акта
                </label>
                <textarea
                  value={currentNode.citation || ''}
                  onChange={(e) => selectedId && updateNode(selectedId, { citation: e.target.value })}
                  placeholder="Точная выдержка или правовая позиция..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-sky-500 text-zinc-100 p-2 rounded-lg text-xs outline-none resize-none transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* Evidence & Case File Details (Том, Лист дела) */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Материалы дела и доказательства</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Том дела
                  </label>
                  <input
                    type="text"
                    value={currentNode.caseVolume || ''}
                    onChange={(e) => selectedId && updateNode(selectedId, { caseVolume: e.target.value })}
                    placeholder="т. 1"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-2.5 py-1.5 rounded-lg text-xs outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Листы дела (л.д.)
                  </label>
                  <input
                    type="text"
                    value={currentNode.casePages || ''}
                    onChange={(e) => selectedId && updateNode(selectedId, { casePages: e.target.value })}
                    placeholder="л.д. 24-28"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-2.5 py-1.5 rounded-lg text-xs outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Evidence Status */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Статус приобщения к делу
                </label>
                <select
                  value={currentNode.evidenceStatus || 'attached'}
                  onChange={(e) => selectedId && updateNode(selectedId, { evidenceStatus: e.target.value as EvidenceStatus })}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-200 px-2.5 py-1.5 rounded-lg text-xs outline-none transition-colors"
                >
                  <option value="attached">Приобщено к материалам дела</option>
                  <option value="motion_pending">Заявлено ходатайство о приобщении</option>
                  <option value="to_request">Требуется истребовать через суд</option>
                  <option value="excluded">Исключено / Недопустимое</option>
                </select>
              </div>

              {/* Evidence Type */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Вид доказательства
                </label>
                <select
                  value={currentNode.evidenceType || 'written'}
                  onChange={(e) => selectedId && updateNode(selectedId, { evidenceType: e.target.value as EvidenceType })}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-200 px-2.5 py-1.5 rounded-lg text-xs outline-none transition-colors"
                >
                  <option value="written">Письменное доказательство (Договор/Акт/УПД)</option>
                  <option value="expertise">Судебная / Внесудебная экспертиза</option>
                  <option value="witness">Свидетельские показания</option>
                  <option value="electronic">Электронная переписка / Нотариальный осмотр</option>
                  <option value="audio_video">Аудио- / Видеозапись</option>
                </select>
              </div>

              {/* Strength Score (1-5) */}
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Весомость доказательства (1-5)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => selectedId && updateNode(selectedId, { strengthScore: score })}
                      className={`flex-1 py-1 rounded border text-xs font-mono flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                        (currentNode.strengthScore || 0) >= score
                          ? 'bg-amber-950/70 border-amber-600 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-850'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{score}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Event Date */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Дата в хронологии дела</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Дата события
                  </label>
                  <input
                    type="date"
                    value={currentNode.eventDate || ''}
                    onChange={(e) => selectedId && updateNode(selectedId, { eventDate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 px-2 py-1.5 rounded-lg text-xs outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Время (опц.)
                  </label>
                  <input
                    type="time"
                    value={currentNode.eventTime || ''}
                    onChange={(e) => selectedId && updateNode(selectedId, { eventTime: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-zinc-100 px-2 py-1.5 rounded-lg text-xs outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Opponent Argument & Counter-position */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Позиция оппонента и возражения</span>
              </div>
              <textarea
                value={currentNode.opponentStance || ''}
                onChange={(e) => selectedId && updateNode(selectedId, { opponentStance: e.target.value })}
                placeholder="Что заявляет или может заявить противная сторона..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 text-zinc-100 p-2 rounded-lg text-xs outline-none resize-none transition-colors leading-relaxed"
              />
            </div>

            {/* Accent Color */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-2">
                <Palette className="w-3.5 h-3.5" />
                Цветовой маркер ветки
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleColorChange(undefined)}
                  title="По умолчанию"
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] text-zinc-400 cursor-pointer ${
                    !currentNode.color ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  ✕
                </button>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                      currentNode.color === color
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Custom Tags */}
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
                      className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
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
                Ссылка (Kad.Arbitr, КонсультантПлюс, Карточка дела)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  value={currentNode.url || ''}
                  onChange={handleUrlChange}
                  placeholder="https://kad.arbitr.ru/..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-lg text-xs outline-none transition-colors"
                />
                {currentNode.url && (
                  <a
                    href={currentNode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title="Открыть карточку дела"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Markdown Legal Notes & Arguments */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                Юридические заметки и аргументация (Markdown)
              </label>
              <textarea
                value={currentNode.notes || ''}
                onChange={handleNotesChange}
                rows={5}
                placeholder="Развернутые комментарии, ссылки на обстоятельства, тактика доказывания..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 p-3 rounded-lg text-xs font-mono outline-none resize-y transition-colors leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions: Duplicate branch, Delete */}
      {currentNode && (
        <div className="pt-4 mt-6 border-t border-zinc-850 flex items-center justify-between gap-2">
          {currentNode.id !== root.id ? (
            <>
              <button
                onClick={() => duplicateNode(currentNode.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Дублировать текущую ветку"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Дублировать</span>
              </button>

              <button
                onClick={() => deleteNode(currentNode.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900/70 border border-rose-900/60 rounded-lg transition-colors cursor-pointer"
                title="Удалить блок и все дочерние элементы"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить блок</span>
              </button>
            </>
          ) : (
            <div className="text-[11px] text-zinc-500 font-mono">
              Корневой блок судебного дела
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
