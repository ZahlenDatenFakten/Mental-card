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
  '#0A84FF', // Apple Blue
  '#30D158', // Apple Green
  '#BF5AF2', // Apple Purple
  '#FF9F0A', // Apple Orange
  '#FF375F', // Apple Pink
  '#FFD60A', // Apple Yellow
  '#FF453A', // Apple Red
  '#64D2FF', // Apple Cyan / Teal
];

const LEGAL_TYPES: { type: LegalNodeType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'thesis', label: 'Тезис / Позиция', icon: <Scale className="w-4 h-4 text-[#BF5AF2]" />, desc: 'Ключевое утверждение стороны' },
  { type: 'fact_timeline', label: 'Факт / Хронология', icon: <Calendar className="w-4 h-4 text-[#FF9F0A]" />, desc: 'Юридический факт с датой' },
  { type: 'norm', label: 'Норма права', icon: <BookOpen className="w-4 h-4 text-[#0A84FF]" />, desc: 'Статья закона, пленум ВС, прецедент' },
  { type: 'evidence', label: 'Доказательство', icon: <FileCheck className="w-4 h-4 text-[#30D158]" />, desc: 'Документ, экспертиза, том/л.д.' },
  { type: 'counter_arg', label: 'Довод оппонента', icon: <ShieldAlert className="w-4 h-4 text-[#FF9F0A]" />, desc: 'Возражение противной стороны' },
  { type: 'rebuttal', label: 'Опровержение', icon: <Zap className="w-4 h-4 text-[#FFD60A]" />, desc: 'Контр-позиция и доказательства' },
  { type: 'risk', label: 'Риск / Уязвимость', icon: <AlertTriangle className="w-4 h-4 text-[#FF453A]" />, desc: 'Слабое место позиции в суде' },
  { type: 'remedy', label: 'Требование иска', icon: <Gavel className="w-4 h-4 text-[#FF375F]" />, desc: 'Просительная часть' },
  { type: 'general', label: 'Общий блок', icon: <FileText className="w-4 h-4 text-[#8E8E93]" />, desc: 'Вспомогательная ветка' },
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
    openConfirmDialog,
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

  const handleDeleteNode = () => {
    if (!currentNode) return;
    openConfirmDialog({
      title: 'Удалить юридический блок?',
      message: `Вы действительно хотите удалить блок «${currentNode.title}» и все вложенные материалы?`,
      confirmLabel: 'Удалить блок',
      variant: 'danger',
      onConfirm: () => {
        deleteNode(currentNode.id);
      },
    });
  };

  return (
    <aside className="h-full z-30 w-80 sm:w-96 apple-vibrant-panel p-5 flex flex-col justify-between overflow-y-auto text-[#F5F5F7] flex-shrink-0 animate-apple-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{
                backgroundColor: currentNode?.color || (currentNode?.id === root.id ? '#30D158' : '#8E8E93'),
              }}
            />
            <h2 className="text-[13px] font-semibold text-white tracking-tight">
              Инспектор юридического блока
            </h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-[#8E8E93] hover:text-white hover:bg-white/[0.08] rounded-lg transition-all active:scale-[0.92] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!currentNode ? (
          <div className="py-16 text-center text-[#8E8E93] text-xs">
            Выберите узел на схеме для настройки доказательств и правовой позиции
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legal Entity Type Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] mb-1.5 uppercase tracking-wider">
                Категория блока
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {LEGAL_TYPES.map((item) => {
                  const isCurrent = (currentNode.nodeType || 'general') === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleTypeChange(item.type)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#0A84FF]/25 border-[#0A84FF] text-white shadow-sm ring-1 ring-[#0A84FF]/50'
                          : 'bg-white/[0.04] border-white/[0.08] text-[#8E8E93] hover:bg-white/[0.08] hover:text-white'
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
              <label className="block text-[11px] font-medium text-[#8E8E93] mb-1">
                Формулировка / Заголовок
              </label>
              <input
                type="text"
                value={currentNode.title}
                onChange={handleTitleChange}
                placeholder="Сформулируйте тезис, факт или требование..."
                className="w-full bg-black/40 border border-white/[0.1] focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/25 text-white px-3 py-2 rounded-xl text-xs outline-none transition-all shadow-inner font-sans"
              />
            </div>

            {/* Law Article / Norm & Citation */}
            <div className="p-3.5 apple-inset-group space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64D2FF]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Норма права и закон</span>
                </div>

                <button
                  onClick={() => useMindMapStore.setState({ isLawArticleOpen: true })}
                  className="text-[11px] text-[#0A84FF] hover:underline font-medium cursor-pointer"
                >
                  База статей →
                </button>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {[
                  { tag: 'ст. 309 ГК', full: 'ст. 309 ГК РФ', title: 'Надлежащее исполнение обязательств', cit: 'Обязательства должны исполняться надлежащим образом в соответствии с условиями обязательства и требованиями закона.' },
                  { tag: 'ст. 310 ГК', full: 'ст. 310 ГК РФ', title: 'Недопустимость одностороннего отказа', cit: 'Односторонний отказ от исполнения обязательства и одностороннее изменение его условий не допускаются.' },
                  { tag: 'ст. 395 ГК', full: 'ст. 395 ГК РФ', title: 'Проценты за пользование чужими средствами', cit: 'В случаях неправомерного удержания денежных средств, уклонения от их возврата подлежат уплате проценты на сумму долга.' },
                  { tag: 'ст. 506 ГК', full: 'ст. 506 ГК РФ', title: 'Договор поставки', cit: 'Поставщик обязуется передать в обусловленный срок производимые или закупаемые им товары покупателю.' },
                  { tag: 'ст. 65 АПК', full: 'ст. 65 АПК РФ', title: 'Обязанность доказывания', cit: 'Каждое лицо, участвующее в деле, должно доказать обстоятельства, на которые оно ссылается.' },
                  { tag: 'ст. 71 АПК', full: 'ст. 71 АПК РФ', title: 'Оценка доказательств судом', cit: 'Арбитражный суд оценивает доказательства по своему внутреннему убеждению, основанному на всестороннем исследовании.' },
                  { tag: 'ст. 270 АПК', full: 'ст. 270 АПК РФ', title: 'Основания отмены в апелляции', cit: 'Основаниями для изменения или отмены решения суда первой инстанции являются неполное выяснение обстоятельств дела.' },
                  { tag: 'Пленум ВС №7', full: 'Пленум ВС РФ № 7', title: 'Ответственность за нарушение обязательств', cit: 'Должник обязан возместить кредитору убытки, причиненные неисполнением обязательства.' },
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (selectedId) {
                        updateNode(selectedId, {
                          lawArticle: sug.full,
                          citation: sug.cit,
                          nodeType: 'norm',
                          notes: currentNode.notes ? `${currentNode.notes}\n\n${sug.title}` : sug.title,
                        });
                      }
                    }}
                    title={`${sug.full}: ${sug.title}`}
                    className="px-2 py-0.5 rounded-lg bg-[#0A84FF]/10 hover:bg-[#0A84FF]/25 border border-[#0A84FF]/30 text-[10.5px] font-mono text-[#64D2FF] transition-all cursor-pointer active:scale-[0.95]"
                  >
                    + {sug.tag}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                  Статья закона / Пленум ВС РФ
                </label>
                <input
                  type="text"
                  value={currentNode.lawArticle || ''}
                  onChange={(e) => selectedId && updateNode(selectedId, { lawArticle: e.target.value })}
                  placeholder="напр. ст. 309, 310 ГК РФ"
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] text-white px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                  Цитата из закона / судебного акта
                </label>
                <textarea
                  value={currentNode.citation || ''}
                  onChange={(e) => selectedId && updateNode(selectedId, { citation: e.target.value })}
                  placeholder="Точная выдержка или правовая позиция..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] text-white p-2 rounded-xl text-xs outline-none resize-none transition-all leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Evidence & Case File Details (Том, Лист дела) */}
            <div className="p-3.5 apple-inset-group space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#30D158]">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Материалы дела и доказательства</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                    Том дела
                  </label>
                  <input
                    type="text"
                    value={currentNode.caseVolume || ''}
                    onChange={(e) => selectedId && updateNode(selectedId, { caseVolume: e.target.value })}
                    placeholder="т. 1"
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-[#30D158] text-white px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                    Листы дела (л.д.)
                  </label>
                  <input
                    type="text"
                    value={currentNode.casePages || ''}
                    onChange={(e) => selectedId && updateNode(selectedId, { casePages: e.target.value })}
                    placeholder="л.д. 24-28"
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-[#30D158] text-white px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
              </div>

              {/* Evidence Status */}
              <div>
                <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                  Статус приобщения к делу
                </label>
                <select
                  value={currentNode.evidenceStatus || 'attached'}
                  onChange={(e) => selectedId && updateNode(selectedId, { evidenceStatus: e.target.value as EvidenceStatus })}
                  className="w-full bg-[#1c1c1e] border border-white/[0.08] focus:border-[#30D158] text-white px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
                >
                  <option value="attached">Приобщено к материалам дела</option>
                  <option value="motion_pending">Заявлено ходатайство о приобщении</option>
                  <option value="to_request">Требуется истребовать через суд</option>
                  <option value="excluded">Исключено / Недопустимое</option>
                </select>
              </div>

              {/* Evidence Type */}
              <div>
                <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                  Вид доказательства
                </label>
                <select
                  value={currentNode.evidenceType || 'written'}
                  onChange={(e) => selectedId && updateNode(selectedId, { evidenceType: e.target.value as EvidenceType })}
                  className="w-full bg-[#1c1c1e] border border-white/[0.08] focus:border-[#30D158] text-white px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
                >
                  <option value="written">Письменное доказательство</option>
                  <option value="expertise">Судебная экспертиза</option>
                  <option value="witness">Свидетельские показания</option>
                  <option value="electronic">Электронная переписка</option>
                  <option value="audio_video">Аудио- / Видеозапись</option>
                </select>
              </div>

              {/* Strength Score (1-5) */}
              <div>
                <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                  Весомость доказательства
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => selectedId && updateNode(selectedId, { strengthScore: score })}
                      className={`flex-1 py-1 rounded-lg border text-xs font-mono flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.92] ${
                        (currentNode.strengthScore || 0) >= score
                          ? 'bg-[#FF9F0A]/20 border-[#FF9F0A]/50 text-[#FFD60A]'
                          : 'bg-white/[0.04] border-white/[0.08] text-[#8E8E93] hover:bg-white/[0.08]'
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
            <div className="p-3.5 apple-inset-group space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF9F0A]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Дата в хронологии</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                    Дата события
                  </label>
                  <input
                    type="date"
                    value={currentNode.eventDate || ''}
                    onChange={(e) => selectedId && updateNode(selectedId, { eventDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-[#FF9F0A] text-white px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-[#8E8E93] mb-1">
                    Время (опц.)
                  </label>
                  <input
                    type="time"
                    value={currentNode.eventTime || ''}
                    onChange={(e) => selectedId && updateNode(selectedId, { eventTime: e.target.value })}
                    className="w-full bg-black/40 border border-white/[0.08] focus:border-[#FF9F0A] text-white px-2.5 py-1.5 rounded-xl text-xs outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Opponent Argument & Counter-position */}
            <div className="p-3.5 apple-inset-group space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF9F0A]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Позиция оппонента и возражения</span>
              </div>
              <textarea
                value={currentNode.opponentStance || ''}
                onChange={(e) => selectedId && updateNode(selectedId, { opponentStance: e.target.value })}
                placeholder="Что заявляет или может заявить противная сторона..."
                rows={2}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-[#FF9F0A] text-white p-2 rounded-xl text-xs outline-none resize-none transition-all leading-relaxed font-sans"
              />
            </div>

            {/* Accent Color Picker */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#EBEBF5] mb-2">
                <Palette className="w-3.5 h-3.5 text-[#0A84FF]" />
                Цветовой маркер ветки
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleColorChange(undefined)}
                  title="По умолчанию"
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] text-[#8E8E93] cursor-pointer transition-all active:scale-[0.9] ${
                    !currentNode.color ? 'border-[#0A84FF] ring-2 ring-[#0A84FF]/40' : 'border-white/[0.2] hover:border-white/[0.5]'
                  }`}
                >
                  ✕
                </button>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer active:scale-[0.9] ${
                      currentNode.color === color
                        ? 'ring-2 ring-white scale-110 shadow-md'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Custom Tags */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#EBEBF5] mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0A84FF]" />
                Теги (Enter для добавления)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {currentNode.tags?.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[#EBEBF5] bg-white/[0.08] border border-white/[0.1] px-2 py-0.5 rounded-lg"
                  >
                    #{t}
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="text-[#8E8E93] hover:text-[#FF453A] transition-colors cursor-pointer"
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
                className="w-full bg-black/40 border border-white/[0.1] focus:border-[#0A84FF] text-white px-3 py-1.5 rounded-xl text-xs outline-none transition-all font-sans"
              />
            </div>

            {/* External URL Reference */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#EBEBF5] mb-1.5">
                <Link className="w-3.5 h-3.5 text-[#0A84FF]" />
                Ссылка (Kad.Arbitr, Карточка дела)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  value={currentNode.url || ''}
                  onChange={handleUrlChange}
                  placeholder="https://kad.arbitr.ru/..."
                  className="flex-1 bg-black/40 border border-white/[0.1] focus:border-[#0A84FF] text-white px-3 py-2 rounded-xl text-xs outline-none transition-all font-sans"
                />
                {currentNode.url && (
                  <a
                    href={currentNode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 apple-btn-secondary transition-all active:scale-[0.92] cursor-pointer"
                    title="Открыть карточку дела"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Markdown Legal Notes */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#EBEBF5] mb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0A84FF]" />
                Юридические заметки (Markdown)
              </label>
              <textarea
                value={currentNode.notes || ''}
                onChange={handleNotesChange}
                rows={4}
                placeholder="Развернутые комментарии, ссылки на обстоятельства, тактика доказывания..."
                className="w-full bg-black/40 border border-white/[0.1] focus:border-[#0A84FF] text-white p-3 rounded-2xl text-xs font-mono outline-none resize-y transition-all leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {currentNode && (
        <div className="pt-3.5 mt-5 border-t border-white/[0.08] flex items-center justify-between gap-2">
          {currentNode.id !== root.id ? (
            <>
              <button
                onClick={() => duplicateNode(currentNode.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium apple-btn-secondary transition-all active:scale-[0.94] cursor-pointer"
                title="Дублировать текущую ветку"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Дублировать</span>
              </button>

              <button
                onClick={handleDeleteNode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FF453A] hover:text-white bg-[#FF453A]/15 hover:bg-[#FF453A] border border-[#FF453A]/30 rounded-xl transition-all active:scale-[0.94] cursor-pointer"
                title="Удалить блок и все дочерние элементы"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить блок</span>
              </button>
            </>
          ) : (
            <div className="text-[11px] text-[#8E8E93] font-mono">
              Корневой блок судебного дела
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
