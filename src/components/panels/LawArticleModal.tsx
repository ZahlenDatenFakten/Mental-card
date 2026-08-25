import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Plus,
  Copy,
  Check,
  Sparkles,
  BookMarked,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { LAW_DATABASE, LawArticleEntry } from '../../lib/law-database';

interface LawArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetParentId?: string;
}

export const LawArticleModal: React.FC<LawArticleModalProps> = ({
  isOpen,
  onClose,
  targetParentId,
}) => {
  const { root, selectedId, addChildNode, addToast } = useMindMapStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return LAW_DATABASE.filter((entry) => {
      const matchCat = selectedCategory === 'all' || entry.category === selectedCategory;
      const matchQ =
        !q ||
        entry.article.toLowerCase().includes(q) ||
        entry.title.toLowerCase().includes(q) ||
        entry.summary.toLowerCase().includes(q) ||
        entry.code.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleAddArticleToTree = (entry: LawArticleEntry) => {
    const parentId = targetParentId || selectedId || root.id;
    addChildNode(parentId, entry.article, 'norm');

    // Update the newly created node with rich metadata
    // (the store selects the new node on create)
    setTimeout(() => {
      const { selectedId: newId, updateNode } = useMindMapStore.getState();
      if (newId) {
        updateNode(newId, {
          lawArticle: entry.article,
          notes: `${entry.title}\n\n${entry.summary}`,
          citation: entry.fullCitation,
          priority: 'high',
          color: '#0A84FF',
        });
      }
    }, 50);

    addToast({
      type: 'success',
      title: 'Норма права добавлена',
      message: `Блок «${entry.article}» интегрирован в правовую позицию дела.`,
    });

    onClose();
  };

  const handleCopyCitation = (entry: LawArticleEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${entry.article}: ${entry.fullCitation}`);
    setCopiedId(entry.id);
    addToast({
      type: 'info',
      title: 'Цитата скопирована',
      message: 'Текст статьи скопирован в буфер обмена.',
      duration: 2000,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] apple-sheet-window flex flex-col overflow-hidden shadow-2xl animate-apple-spring-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                База правовых норм и судебной практики
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Интеграция норм ГК РФ, АПК РФ, ТК РФ и Пленумов ВС РФ в один клик
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8E8E93] hover:text-white hover:bg-white/[0.1] rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-5 border-b border-zinc-800/80 space-y-3 bg-[#161619]">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по номеру статьи, кодексу, названию или цитате..."
              className="w-full bg-black/60 border border-zinc-800 focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/25 text-white pl-10 pr-4 py-2.5 rounded-2xl text-xs outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#0A84FF] text-white shadow-sm'
                  : 'bg-white/[0.04] text-[#8E8E93] hover:text-white border border-zinc-800'
              }`}
            >
              Все нормы ({LAW_DATABASE.length})
            </button>

            <button
              onClick={() => setSelectedCategory('civil')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'civil'
                  ? 'bg-[#0A84FF] text-white shadow-sm'
                  : 'bg-white/[0.04] text-[#8E8E93] hover:text-white border border-zinc-800'
              }`}
            >
              Гражданский кодекс (ГК РФ)
            </button>

            <button
              onClick={() => setSelectedCategory('arbitration')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'arbitration'
                  ? 'bg-[#BF5AF2] text-white shadow-sm'
                  : 'bg-white/[0.04] text-[#8E8E93] hover:text-white border border-zinc-800'
              }`}
            >
              Арбитражный процесс (АПК РФ)
            </button>

            <button
              onClick={() => setSelectedCategory('supreme_plenum')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'supreme_plenum'
                  ? 'bg-[#30D158] text-black font-semibold shadow-sm'
                  : 'bg-white/[0.04] text-[#8E8E93] hover:text-white border border-zinc-800'
              }`}
            >
              Пленумы ВС РФ
            </button>

            <button
              onClick={() => setSelectedCategory('labor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'labor'
                  ? 'bg-[#FF9F0A] text-black font-semibold shadow-sm'
                  : 'bg-white/[0.04] text-[#8E8E93] hover:text-white border border-zinc-800'
              }`}
            >
              Трудовой кодекс (ТК РФ)
            </button>
          </div>
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[55vh]">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-[#8E8E93] space-y-2">
              <BookMarked className="w-8 h-8 mx-auto text-[#8E8E93]/60" />
              <p className="text-sm font-medium text-white">Статья не найдена</p>
              <p className="text-xs">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            filteredArticles.map((entry) => (
              <div
                key={entry.id}
                className="p-5 bg-[#18181b] hover:bg-[#202024] border border-zinc-800 hover:border-[#0A84FF]/60 rounded-2xl transition-all duration-150 space-y-3 group shadow-md"
              >
                {/* Top Row: Article badge & Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-xs font-mono font-bold text-[#64D2FF]">
                      {entry.article}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {entry.title}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#8E8E93] bg-white/[0.06] px-2 py-0.5 rounded-md border border-zinc-800">
                    {entry.code}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs text-[#EBEBF5] leading-relaxed font-sans">
                  {entry.summary}
                </p>

                {/* Official Citation Quote Box */}
                <div className="p-3 bg-black/40 border border-zinc-800/80 rounded-xl text-[11.5px] text-[#A1A1A6] font-serif italic leading-relaxed">
                  «{entry.fullCitation}»
                </div>

                {/* Instance Relevance Guidance */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD60A] flex-shrink-0" />
                  <span>{entry.instanceRelevance}</span>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => handleCopyCitation(entry, e)}
                    className="flex items-center gap-1 text-xs text-[#8E8E93] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    {copiedId === entry.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#30D158]" />
                        <span className="text-[#30D158]">Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Копировать цитату</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleAddArticleToTree(entry)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold apple-btn-primary rounded-xl transition-all active:scale-[0.96] cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить в схему</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
