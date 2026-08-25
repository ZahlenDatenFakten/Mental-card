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
  Check,
  ArrowLeft,
  BookOpen,
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
    setCurrentView,
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
    setNewCaseOpen,
    setLawArticleOpen,
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
          icon: <Building2 className="w-3.5 h-3.5 text-[#0A84FF]" />,
          style: 'bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#64D2FF]',
        };
      case 'appellate':
        return {
          label: '2. Апелляционная инстанция',
          short: 'Апелляционный суд',
          icon: <Scale className="w-3.5 h-3.5 text-[#BF5AF2]" />,
          style: 'bg-[#BF5AF2]/15 border-[#BF5AF2]/30 text-[#E0B0FF]',
        };
      case 'supreme':
        return {
          label: '3. Верховная инстанция',
          short: 'Верховный Суд',
          icon: <Crown className="w-3.5 h-3.5 text-[#30D158]" />,
          style: 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]',
        };
    }
  };

  const currentBadge = getInstanceBadge(activeCase?.instance || 'district');

  const handleAddWithType = (type: LegalNodeType, title: string) => {
    addChildNode(selectedId || root.id, title, type);
    setIsAddMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-13 px-3.5 apple-vibrant-bar flex items-center justify-between select-none text-[#F5F5F7]">
      {/* Left: Back to Portfolio & Case Selector */}
      <div className="flex items-center gap-2.5" ref={caseMenuRef}>
        {/* Back to All Projects / Portfolio Button */}
        <button
          onClick={() => setCurrentView('portfolio')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EBEBF5] hover:text-white apple-btn-secondary transition-all active:scale-[0.95] cursor-pointer shadow-apple-card"
          title="Вернуться на страницу выбора дел и портфеля"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#0A84FF]" />
          <span className="font-semibold">Все дела</span>
        </button>

        {/* Case Switcher Glass Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsCaseMenuOpen(!isCaseMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.18] transition-all duration-120 active:scale-[0.97] cursor-pointer text-left shadow-apple-card"
          >
            <div className="flex items-center justify-center p-1 rounded-lg bg-white/[0.08] border border-white/[0.1]">
              {currentBadge.icon}
            </div>

            <div className="max-w-[120px] sm:max-w-[180px] md:max-w-[220px] truncate">
              <div className="text-xs font-semibold text-white truncate leading-tight tracking-tight">
                {activeCase?.title || 'Судебное дело'}
              </div>
              <div className="text-[10px] text-[#8E8E93] truncate">
                {currentBadge.label} • {activeCase?.courtName}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93] ml-0.5 flex-shrink-0" />
          </button>

          {/* Cases Fast Switcher Dropdown (macOS Glass Sheet Style) */}
          {isCaseMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-84 apple-sheet-window py-2 z-50 animate-apple-spring-in max-h-96 overflow-y-auto">
              <div className="px-4 py-2 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider border-b border-white/[0.08] flex items-center justify-between">
                <span>Портфель дел ({cases.length})</span>
                <button
                  onClick={() => {
                    setIsCaseMenuOpen(false);
                    setCurrentView('portfolio');
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
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        isAct
                          ? 'bg-[#0A84FF]/20 text-white font-medium border-l-2 border-[#0A84FF]'
                          : 'text-[#EBEBF5] hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1 rounded-lg bg-white/[0.08] flex-shrink-0">
                          {b.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{c.title}</div>
                          <div className="text-[10.5px] text-[#8E8E93] truncate font-mono">
                            {b.label}
                          </div>
                        </div>
                      </div>

                      {isAct && <Check className="w-4 h-4 text-[#0A84FF] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="px-3 pt-2 border-t border-white/[0.08] mt-1">
                <button
                  onClick={() => {
                    setIsCaseMenuOpen(false);
                    setNewCaseOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold apple-btn-green transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Создать новое дело</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: macOS Segmented Controls */}
      <div className="hidden lg:flex items-center gap-1.5 p-1 apple-segmented-track">
        {/* Timeline Button */}
        <button
          onClick={() => setTimelineOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#FFD60A] hover:text-white bg-[#FF9F0A]/15 hover:bg-[#FF9F0A]/25 border border-[#FF9F0A]/30 rounded-lg transition-all active:scale-[0.96] cursor-pointer"
          title="Открыть хронологию событий дела"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Хронология</span>
        </button>

        {/* Court Memorandum Button */}
        <button
          onClick={() => setCourtDocOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#E0B0FF] hover:text-white bg-[#BF5AF2]/15 hover:bg-[#BF5AF2]/25 border border-[#BF5AF2]/30 rounded-lg transition-all active:scale-[0.96] cursor-pointer"
          title="Сформировать судебный меморандум и реестр доказательств"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Позиция для суда</span>
        </button>

        {/* Smart Law Articles Database Button */}
        <button
          onClick={() => setLawArticleOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#64D2FF] hover:text-white bg-[#0A84FF]/15 hover:bg-[#0A84FF]/25 border border-[#0A84FF]/30 rounded-lg transition-all active:scale-[0.96] cursor-pointer"
          title="Открыть базу статей и законов (ГК РФ, АПК РФ, Пленумы ВС РФ)"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Нормы (ст.)</span>
        </button>

        <div className="w-[1px] h-4 bg-white/[0.15] mx-0.5" />

        {/* Filter Dropdown */}
        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-3 h-3 text-[#8E8E93] ml-1" />
          <select
            value={filterNodeType}
            onChange={(e) => setFilterNodeType(e.target.value as LegalNodeType | 'all')}
            className="bg-transparent text-white text-xs outline-none py-1 px-1.5 rounded-lg cursor-pointer"
            title="Фильтр подсветки блоков на схеме"
          >
            <option value="all" className="bg-[#1c1c1e] text-white">Все блоки</option>
            <option value="thesis" className="bg-[#1c1c1e] text-white">Только Тезисы</option>
            <option value="fact_timeline" className="bg-[#1c1c1e] text-white">Только Хронология</option>
            <option value="norm" className="bg-[#1c1c1e] text-white">Только Нормы права</option>
            <option value="evidence" className="bg-[#1c1c1e] text-white">Только Доказательства</option>
            <option value="counter_arg" className="bg-[#1c1c1e] text-white">Только Оппонент</option>
            <option value="risk" className="bg-[#1c1c1e] text-white">Только Риски</option>
          </select>
        </div>

        <div className="w-[1px] h-4 bg-white/[0.15] mx-0.5" />

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          title="Отменить действие (⌘Z)"
          className="p-1.5 text-[#8E8E93] hover:text-white hover:bg-white/[0.1] disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all active:scale-[0.92] cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo()}
          title="Повторить действие (⌘⇧Z)"
          className="p-1.5 text-[#8E8E93] hover:text-white hover:bg-white/[0.1] disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all active:scale-[0.92] cursor-pointer"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/[0.15] mx-0.5" />

        {/* Quick Add with menu */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => addChildNode(selectedId || root.id)}
              title="Добавить дочерний элемент (Tab)"
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#0A84FF] hover:bg-[#2491FF] border border-[#0A84FF] rounded-l-lg transition-all active:scale-[0.96] cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Блок</span>
            </button>
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="p-1 bg-[#0A84FF] hover:bg-[#2491FF] border-y border-r border-[#0A84FF] rounded-r-lg text-white transition-all cursor-pointer"
              title="Выбрать категорию блока"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Dropdown Menu */}
          {isAddMenuOpen && (
            <div
              onClick={() => setIsAddMenuOpen(false)}
              className="absolute left-0 top-full mt-2 w-56 apple-sheet-window py-2 z-50 animate-apple-spring-in"
            >
              <button
                onClick={() => handleAddWithType('thesis', 'Новый тезис')}
                className="w-full px-3.5 py-2 text-left text-xs text-[#EBEBF5] hover:bg-white/[0.1] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#BF5AF2]" />
                <span>+ Тезис / Позиция</span>
              </button>
              <button
                onClick={() => handleAddWithType('fact_timeline', 'Новый факт фабулы')}
                className="w-full px-3.5 py-2 text-left text-xs text-[#EBEBF5] hover:bg-white/[0.1] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" />
                <span>+ Факт / Хронология</span>
              </button>
              <button
                onClick={() => handleAddWithType('norm', 'Новая статья закона')}
                className="w-full px-3.5 py-2 text-left text-xs text-[#EBEBF5] hover:bg-white/[0.1] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#0A84FF]" />
                <span>+ Норма права / Статья</span>
              </button>
              <button
                onClick={() => handleAddWithType('evidence', 'Новое доказательство')}
                className="w-full px-3.5 py-2 text-left text-xs text-[#EBEBF5] hover:bg-white/[0.1] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]" />
                <span>+ Доказательство</span>
              </button>
              <button
                onClick={() => handleAddWithType('counter_arg', 'Довод оппонента')}
                className="w-full px-3.5 py-2 text-left text-xs text-[#EBEBF5] hover:bg-white/[0.1] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" />
                <span>+ Довод оппонента</span>
              </button>
              <button
                onClick={() => handleAddWithType('risk', 'Новый риск')}
                className="w-full px-3.5 py-2 text-left text-xs text-[#EBEBF5] hover:bg-white/[0.1] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
                <span>+ Риск / Уязвимость</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Sibling Node */}
        <button
          onClick={() => addSiblingNode(selectedId || root.id)}
          title="Добавить соседний блок (Enter)"
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#EBEBF5] hover:text-white hover:bg-white/[0.1] rounded-lg transition-all active:scale-[0.96] cursor-pointer"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Ветка</span>
        </button>
      </div>

      {/* Right: Apple Primary Share, Spotlight Search, Export, Help, Inspector */}
      <div className="flex items-center gap-2">
        {/* Apple Primary Share Button */}
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold apple-btn-green transition-all active:scale-[0.96] cursor-pointer"
          title="Поделиться картой дела (скопировать ссылку)"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Поделиться</span>
        </button>

        {/* Search button (Apple Spotlight Trigger) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#8E8E93] hover:text-white apple-btn-secondary transition-all active:scale-[0.96] cursor-pointer shadow-apple-card"
        >
          <Search className="w-3.5 h-3.5 text-[#0A84FF]" />
          <Kbd className="hidden sm:inline-flex">⌘F</Kbd>
        </button>

        {/* Export / Import button */}
        <button
          onClick={() => setExportImportOpen(true)}
          className="p-2 text-[#EBEBF5] hover:text-white apple-btn-secondary transition-all active:scale-[0.96] cursor-pointer shadow-apple-card"
          title="Экспорт (PNG, SVG, JSON, Markdown)"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Shortcuts Cheat Sheet */}
        <button
          onClick={() => setShortcutsOpen(true)}
          className="p-2 text-[#8E8E93] hover:text-white hover:bg-white/[0.1] rounded-xl transition-all active:scale-[0.94] cursor-pointer"
          title="Справочник горячих клавиш (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sidebar Inspector Toggle */}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl transition-all active:scale-[0.94] cursor-pointer ${
            isSidebarOpen
              ? 'bg-[#0A84FF]/25 text-[#0A84FF] border border-[#0A84FF]/50 shadow-sm'
              : 'text-[#8E8E93] hover:text-white hover:bg-white/[0.1] border border-transparent'
          }`}
          title="Открыть/скрыть инспектор юридического блока (⌘B)"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
