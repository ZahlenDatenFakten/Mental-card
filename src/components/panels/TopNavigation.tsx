import React from 'react';
import {
  Undo2,
  Redo2,
  Plus,
  Search,
  Download,
  HelpCircle,
  PanelRight,
  GitBranch,
  Scale,
  Calendar,
  FileText,
  Share2,
  FolderOpen,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { Kbd } from '../ui/Kbd';
import { LegalNodeType } from '../../types/mindmap';

export const TopNavigation: React.FC = () => {
  const {
    root,
    selectedId,
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
    setTemplatesOpen,
    updateNode,
    filterNodeType,
    setFilterNodeType,
  } = useMindMapStore();

  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(root.id, { title: e.target.value });
  };

  const handleAddWithType = (type: LegalNodeType, title: string) => {
    addChildNode(selectedId || root.id, title, type);
    setIsAddMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 px-3 sm:px-4 bg-zinc-950/90 border-b border-zinc-850 backdrop-blur-md flex items-center justify-between select-none text-zinc-100">
      {/* Left Section: Legal Logo & Case Title */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-400 shadow-sm flex-shrink-0">
          <Scale className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={root.title}
            onChange={handleTitleChange}
            placeholder="Номер дела / Стороны спора..."
            className="bg-transparent hover:bg-zinc-900/60 focus:bg-zinc-900 text-zinc-100 text-sm font-semibold px-2 py-1 rounded-md outline-none border border-transparent focus:border-zinc-700 transition-colors w-44 sm:w-60 md:w-80 truncate"
          />

          <button
            onClick={() => setTemplatesOpen(true)}
            className="hidden md:flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Выбрать готовый шаблон дела"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Шаблоны</span>
          </button>
        </div>
      </div>

      {/* Center Section: Specialized Judicial Tools & Filter */}
      <div className="hidden lg:flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
        {/* Timeline Button */}
        <button
          onClick={() => setTimelineOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
          title="Открыть хронологию событий дела"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Хронология</span>
        </button>

        {/* Court Memorandum Button */}
        <button
          onClick={() => setCourtDocOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-violet-300 hover:text-violet-200 bg-violet-950/40 hover:bg-violet-950/70 border border-violet-800/60 rounded-lg transition-colors cursor-pointer"
          title="Сформировать судебный меморандум и реестр доказательств"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Позиция для суда</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />

        {/* Filter Dropdown */}
        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-3 h-3 text-zinc-500 ml-1" />
          <select
            value={filterNodeType}
            onChange={(e) => setFilterNodeType(e.target.value as LegalNodeType | 'all')}
            className="bg-transparent text-zinc-300 hover:text-white text-xs outline-none py-1 px-1 rounded cursor-pointer"
            title="Фильтр подсветки блоков на схеме"
          >
            <option value="all" className="bg-zinc-900 text-zinc-100">Все блоки</option>
            <option value="thesis" className="bg-zinc-900 text-zinc-100">Только Тезисы</option>
            <option value="fact_timeline" className="bg-zinc-900 text-zinc-100">Только Хронология</option>
            <option value="norm" className="bg-zinc-900 text-zinc-100">Только Нормы права</option>
            <option value="evidence" className="bg-zinc-900 text-zinc-100">Только Доказательства</option>
            <option value="counter_arg" className="bg-zinc-900 text-zinc-100">Только Оппонент</option>
            <option value="risk" className="bg-zinc-900 text-zinc-100">Только Риски</option>
          </select>
        </div>

        <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          title="Отменить действие (Ctrl+Z)"
          className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo()}
          title="Повторить действие (Ctrl+Shift+Z)"
          className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />

        {/* Quick Add with menu */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => addChildNode(selectedId || root.id)}
              title="Добавить дочерний элемент (Tab)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 rounded-l-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Блок</span>
            </button>
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="p-1 bg-emerald-950/50 hover:bg-emerald-950/80 border-y border-r border-emerald-800/60 rounded-r-lg text-emerald-400 transition-colors cursor-pointer"
              title="Выбрать юридический тип блока"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Dropdown Menu */}
          {isAddMenuOpen && (
            <div
              onClick={() => setIsAddMenuOpen(false)}
              className="absolute left-0 top-full mt-1.5 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-floating py-1.5 z-50 animate-scale-in"
            >
              <button
                onClick={() => handleAddWithType('thesis', 'Новый тезис')}
                className="w-full px-3 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span>+ Тезис / Позиция</span>
              </button>
              <button
                onClick={() => handleAddWithType('fact_timeline', 'Новый факт фабулы')}
                className="w-full px-3 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>+ Факт / Хронология</span>
              </button>
              <button
                onClick={() => handleAddWithType('norm', 'Новая статья закона')}
                className="w-full px-3 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>+ Норма права / Статья</span>
              </button>
              <button
                onClick={() => handleAddWithType('evidence', 'Новое доказательство')}
                className="w-full px-3 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>+ Доказательство</span>
              </button>
              <button
                onClick={() => handleAddWithType('counter_arg', 'Довод оппонента')}
                className="w-full px-3 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>+ Довод оппонента</span>
              </button>
              <button
                onClick={() => handleAddWithType('risk', 'Новый риск')}
                className="w-full px-3 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
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
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Соседний блок</span>
        </button>
      </div>

      {/* Right Section: Share, Search, Export, Help, Inspector */}
      <div className="flex items-center gap-2">
        {/* Share button */}
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          title="Поделиться картой дела (скопировать ссылку)"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Поделиться</span>
        </button>

        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <Kbd className="hidden sm:inline-flex">⌘F</Kbd>
        </button>

        {/* Export / Import button */}
        <button
          onClick={() => setExportImportOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors cursor-pointer shadow-sm"
          title="Экспорт (PNG, SVG, JSON, Markdown)"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Shortcuts Cheat Sheet */}
        <button
          onClick={() => setShortcutsOpen(true)}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-colors cursor-pointer"
          title="Справочник горячих клавиш (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sidebar Inspector Toggle */}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isSidebarOpen
              ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent hover:border-zinc-800'
          }`}
          title="Открыть/скрыть инспектор юридического блока (Cmd+B)"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
