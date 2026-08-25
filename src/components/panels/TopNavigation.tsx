import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  Plus,
  Search,
  Download,
  HelpCircle,
  PanelRight,
  GitBranch,
  Calendar,
  FileText,
  Share2,
  ChevronDown,
  Filter,
  Building2,
  Scale,
  Crown,
  FolderKanban,
  Check,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { Kbd } from '../ui/Kbd';
import { LegalNodeType, JudicialInstance } from '../../types/mindmap';

export const TopNavigation: React.FC = () => {
  const {
    root,
    selectedId,
    cases,
    activeCaseId,
    switchCase,
    addChildNode,
    addSiblingNode,
    undo,
    redo,
    canUndo,
    canRedo,
    setSearchOpen,
    setExportImportOpen,
    setShortcutsOpen,
    toggleSidebar,
    isSidebarOpen,
    setTimelineOpen,
    setCourtDocOpen,
    setShareOpen,
    setPortfolioOpen,
    setNewCaseOpen,
    filterNodeType,
    setFilterNodeType,
  } = useMindMapStore();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isCaseMenuOpen, setIsCaseMenuOpen] = useState(false);
  const caseMenuRef = useRef<HTMLDivElement>(null);

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (caseMenuRef.current && !caseMenuRef.current.contains(e.target as Node)) {
        setIsCaseMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInstanceBadge = (inst: JudicialInstance) => {
    switch (inst) {
      case 'district':
        return {
          label: '1. Окружная инстанция',
          short: 'Окружной суд',
          icon: <Building2 className="w-3.5 h-3.5 text-sky-400" />,
          style: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
        };
      case 'appellate':
        return {
          label: '2. Апелляционная инстанция',
          short: 'Апелляционный суд',
          icon: <Scale className="w-3.5 h-3.5 text-purple-400" />,
          style: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
        };
      case 'supreme':
        return {
          label: '3. Верховная инстанция',
          short: 'Верховный Суд',
          icon: <Crown className="w-3.5 h-3.5 text-emerald-400" />,
          style: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        };
    }
  };

  const currentBadge = getInstanceBadge(activeCase?.instance || 'district');

  const handleAddWithType = (type: LegalNodeType, title: string) => {
    addChildNode(selectedId || root.id, title, type);
    setIsAddMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-13 px-3 sm:px-4 apple-glass border-b border-white/[0.08] flex items-center justify-between select-none text-zinc-100 transition-all">
      {/* Left Section: macOS Case Switcher & Instance Pill */}
      <div className="flex items-center gap-2" ref={caseMenuRef}>
        {/* Case Switcher Glass Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsCaseMenuOpen(!isCaseMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-150 active:scale-[0.97] cursor-pointer text-left shadow-apple-card"
          >
            <div className="flex items-center justify-center p-1 rounded-lg bg-white/[0.06] border border-white/[0.08]">
              {currentBadge.icon}
            </div>

            <div className="max-w-[140px] sm:max-w-[190px] md:max-w-[240px] truncate">
              <div className="text-xs font-semibold text-zinc-100 truncate leading-tight tracking-tight">
                {activeCase?.title || 'Судебное дело'}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {currentBadge.label} • {activeCase?.courtName}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5 flex-shrink-0" />
          </button>

          {/* Cases Fast Switcher Dropdown (macOS Glass Sheet Style) */}
          {isCaseMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 apple-glass-card rounded-2xl shadow-apple-modal py-2 z-50 animate-apple-scale-in max-h-96 overflow-y-auto">
              <div className="px-3.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/[0.06] flex items-center justify-between">
                <span>Портфель дел ({cases.length})</span>
                <button
                  onClick={() => {
                    setIsCaseMenuOpen(false);
                    setPortfolioOpen(true);
                  }}
                  className="text-[#0A84FF] hover:underline cursor-pointer font-medium"
                >
                  Все дела →
                </button>
              </div>

              <div className="py-1 space-y-0.5">
                {cases.map((c) => {
                  const isAct = c.id === activeCaseId;
                  const b = getInstanceBadge(c.instance);
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        switchCase(c.id);
                        setIsCaseMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isAct
                          ? 'bg-[#0A84FF]/15 text-white font-medium border-l-2 border-[#0A84FF]'
                          : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1 rounded-lg bg-white/[0.06] flex-shrink-0">
                          {b.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{c.title}</div>
                          <div className="text-[10px] text-zinc-400 truncate font-mono">
                            {b.label}
                          </div>
                        </div>
                      </div>

                      {isAct && <Check className="w-4 h-4 text-[#0A84FF] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="px-2.5 pt-1.5 border-t border-white/[0.06] mt-1">
                <button
                  onClick={() => {
                    setIsCaseMenuOpen(false);
                    setNewCaseOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold apple-emerald-btn transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Создать новое дело</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Button */}
        <button
          onClick={() => setPortfolioOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all active:scale-[0.97] cursor-pointer shadow-apple-card"
          title="Открыть реестр дел всех инстанций"
        >
          <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
          <span>Портфель дел</span>
        </button>
      </div>

      {/* Center Section: macOS Unified Toolbar Segmented Tools */}
      <div className="hidden lg:flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl shadow-apple-card backdrop-blur-lg">
        {/* Timeline Button */}
        <button
          onClick={() => setTimelineOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-all active:scale-[0.96] cursor-pointer"
          title="Открыть хронологию событий дела"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Хронология</span>
        </button>

        {/* Court Memorandum Button */}
        <button
          onClick={() => setCourtDocOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all active:scale-[0.96] cursor-pointer"
          title="Сформировать судебный меморандум и реестр доказательств"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Позиция для суда</span>
        </button>

        <div className="w-[1px] h-4 bg-white/[0.1] mx-0.5" />

        {/* Filter Dropdown */}
        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-3 h-3 text-zinc-400 ml-1" />
          <select
            value={filterNodeType}
            onChange={(e) => setFilterNodeType(e.target.value as LegalNodeType | 'all')}
            className="bg-transparent text-zinc-200 hover:text-white text-xs outline-none py-1 px-1.5 rounded-lg cursor-pointer"
            title="Фильтр подсветки блоков на схеме"
          >
            <option value="all" className="bg-[#1c1c1e] text-zinc-100">Все блоки</option>
            <option value="thesis" className="bg-[#1c1c1e] text-zinc-100">Только Тезисы</option>
            <option value="fact_timeline" className="bg-[#1c1c1e] text-zinc-100">Только Хронология</option>
            <option value="norm" className="bg-[#1c1c1e] text-zinc-100">Только Нормы права</option>
            <option value="evidence" className="bg-[#1c1c1e] text-zinc-100">Только Доказательства</option>
            <option value="counter_arg" className="bg-[#1c1c1e] text-zinc-100">Только Оппонент</option>
            <option value="risk" className="bg-[#1c1c1e] text-zinc-100">Только Риски</option>
          </select>
        </div>

        <div className="w-[1px] h-4 bg-white/[0.1] mx-0.5" />

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          title="Отменить действие (Ctrl+Z)"
          className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all active:scale-[0.92] cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo()}
          title="Повторить действие (Ctrl+Shift+Z)"
          className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all active:scale-[0.92] cursor-pointer"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/[0.1] mx-0.5" />

        {/* Quick Add with menu */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => addChildNode(selectedId || root.id)}
              title="Добавить дочерний элемент (Tab)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-l-xl transition-all active:scale-[0.96] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Блок</span>
            </button>
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="p-1 bg-emerald-500/15 hover:bg-emerald-500/25 border-y border-r border-emerald-500/30 rounded-r-xl text-emerald-300 transition-all cursor-pointer"
              title="Выбрать категорию блока"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Dropdown Menu */}
          {isAddMenuOpen && (
            <div
              onClick={() => setIsAddMenuOpen(false)}
              className="absolute left-0 top-full mt-2 w-52 apple-glass-card rounded-2xl shadow-apple-modal py-1.5 z-50 animate-apple-scale-in"
            >
              <button
                onClick={() => handleAddWithType('thesis', 'Новый тезис')}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>+ Тезис / Позиция</span>
              </button>
              <button
                onClick={() => handleAddWithType('fact_timeline', 'Новый факт фабулы')}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>+ Факт / Хронология</span>
              </button>
              <button
                onClick={() => handleAddWithType('norm', 'Новая статья закона')}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>+ Норма права / Статья</span>
              </button>
              <button
                onClick={() => handleAddWithType('evidence', 'Новое доказательство')}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>+ Доказательство</span>
              </button>
              <button
                onClick={() => handleAddWithType('counter_arg', 'Довод оппонента')}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>+ Довод оппонента</span>
              </button>
              <button
                onClick={() => handleAddWithType('risk', 'Новый риск')}
                className="w-full px-3 py-2 text-left text-xs text-zinc-200 hover:bg-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>+ Риск / Уязвимость</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Sibling Node */}
        <button
          onClick={() => addSiblingNode(selectedId || root.id)}
          title="Добавить соседний блок (Enter)"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.96] cursor-pointer"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Соседний блок</span>
        </button>
      </div>

      {/* Right Section: Share, Search, Export, Help, Inspector */}
      <div className="flex items-center gap-2">
        {/* Apple Primary Share Button */}
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold apple-emerald-btn rounded-xl transition-all active:scale-[0.96] cursor-pointer"
          title="Поделиться картой дела (скопировать ссылку)"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Поделиться</span>
        </button>

        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all active:scale-[0.96] cursor-pointer shadow-apple-card"
        >
          <Search className="w-3.5 h-3.5" />
          <Kbd className="hidden sm:inline-flex">⌘F</Kbd>
        </button>

        {/* Export / Import button */}
        <button
          onClick={() => setExportImportOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all active:scale-[0.96] cursor-pointer shadow-apple-card"
          title="Экспорт (PNG, SVG, JSON, Markdown)"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Shortcuts Cheat Sheet */}
        <button
          onClick={() => setShortcutsOpen(true)}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.94] cursor-pointer"
          title="Справочник горячих клавиш (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sidebar Inspector Toggle */}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-xl border transition-all active:scale-[0.94] cursor-pointer ${
            isSidebarOpen
              ? 'bg-[#0A84FF]/20 text-[#0A84FF] border-[#0A84FF]/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] border-transparent'
          }`}
          title="Открыть/скрыть инспектор юридического блока (Cmd+B)"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
