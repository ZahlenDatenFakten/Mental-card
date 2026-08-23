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
  Network,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { Kbd } from '../ui/Kbd';

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
    updateNode,
  } = useMindMapStore();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(root.id, { title: e.target.value });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 px-4 bg-zinc-950/85 border-b border-zinc-850 backdrop-blur-md flex items-center justify-between select-none">
      {/* Left Section: App Logo & Mind Map Root Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 shadow-sm">
          <Network className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={root.title}
            onChange={handleTitleChange}
            placeholder="Название карты..."
            className="bg-transparent hover:bg-zinc-900/60 focus:bg-zinc-900 text-zinc-100 text-sm font-semibold px-2 py-1 rounded-md outline-none border border-transparent focus:border-zinc-700 transition-colors w-48 sm:w-64 truncate"
          />
          <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-zinc-500 bg-zinc-900 rounded border border-zinc-800">
            v1.0
          </span>
        </div>
      </div>

      {/* Center Section: Quick Actions (Undo, Redo, Add Child, Add Sibling) */}
      <div className="hidden lg:flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl">
        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          title="Отменить действие (Ctrl+Z)"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Отмена</span>
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo()}
          title="Повторить действие (Ctrl+Shift+Z)"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors"
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span>Повтор</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

        {/* Add Child Node */}
        <button
          onClick={() => addChildNode(selectedId || root.id)}
          title="Добавить дочерний узел (Tab)"
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Дочерний узел</span>
          <Kbd className="text-[10px] bg-emerald-900/50 border-emerald-700/60 text-emerald-300">Tab</Kbd>
        </button>

        {/* Add Sibling Node */}
        <button
          onClick={() => addSiblingNode(selectedId || root.id)}
          title="Добавить соседний узел (Enter)"
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Соседний узел</span>
          <Kbd className="text-[10px]">Enter</Kbd>
        </button>
      </div>

      {/* Right Section: Search, Export/Import, Help, Details Inspector */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Поиск</span>
          <Kbd className="hidden sm:inline-flex">⌘F</Kbd>
        </button>

        {/* Export / Import button */}
        <button
          onClick={() => setExportImportOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors shadow-sm"
          title="Экспорт и импорт (Markdown, PNG, SVG, JSON)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Экспорт</span>
        </button>

        {/* Shortcuts Cheat Sheet */}
        <button
          onClick={() => setShortcutsOpen(true)}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-colors"
          title="Справочник горячих клавиш (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sidebar Inspector Toggle */}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg border transition-colors ${
            isSidebarOpen
              ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent hover:border-zinc-800'
          }`}
          title="Панель свойств узла (Cmd+B)"
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
