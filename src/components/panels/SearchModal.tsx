import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft, BookOpen, Calendar } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { MindNode, SearchResult } from '../../types/mindmap';
import { Kbd } from '../ui/Kbd';

export const SearchModal: React.FC = () => {
  const {
    root,
    isSearchOpen,
    setSearchOpen,
    selectNode,
  } = useMindMapStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Recursively gather all nodes and match query
  const results = useMemo<SearchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    const matches: SearchResult[] = [];

    function traverse(node: MindNode, path: string[]) {
      const currentPath = [...path, node.title];
      const titleMatch = node.title.toLowerCase().includes(trimmed);
      const notesMatch = node.notes ? node.notes.toLowerCase().includes(trimmed) : false;
      const tagsMatch = node.tags ? node.tags.some((t) => t.toLowerCase().includes(trimmed)) : false;
      const articleMatch = node.lawArticle ? node.lawArticle.toLowerCase().includes(trimmed) : false;
      const dateMatch = node.eventDate ? node.eventDate.toLowerCase().includes(trimmed) : false;
      const pagesMatch = node.casePages ? node.casePages.toLowerCase().includes(trimmed) : false;

      if (!trimmed || titleMatch || notesMatch || tagsMatch || articleMatch || dateMatch || pagesMatch) {
        let snippet: string | undefined;
        if (articleMatch && node.lawArticle) {
          snippet = `Статья: ${node.lawArticle}`;
        } else if (dateMatch && node.eventDate) {
          snippet = `Дата: ${node.eventDate}`;
        } else if (notesMatch && node.notes) {
          snippet = node.notes;
        } else if (tagsMatch && node.tags) {
          snippet = node.tags.map((t) => `#${t}`).join(' ');
        }

        matches.push({
          nodeId: node.id,
          title: node.title,
          snippet,
          path: path,
          nodeType: node.nodeType,
          lawArticle: node.lawArticle,
          eventDate: node.eventDate,
        });
      }

      if (node.children) {
        for (const child of node.children) {
          traverse(child, currentPath);
        }
      }
    }

    traverse(root, []);
    return matches.slice(0, 15);
  }, [root, query]);

  if (!isSearchOpen) return null;

  const handleSelect = (nodeId: string) => {
    selectNode(nodeId);
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].nodeId);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchOpen(false);
    }
  };

  return (
    <div
      onClick={() => setSearchOpen(false)}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-floating overflow-hidden animate-scale-in"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-850 bg-zinc-900/60">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по тезисам, статьям законов, датам, доказательствам..."
            className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm outline-none font-medium"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            results.map((res, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={res.nodeId}
                  onClick={() => handleSelect(res.nodeId)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-850 text-zinc-100 border border-zinc-700/60'
                      : 'text-zinc-300 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    {/* Breadcrumbs Path */}
                    {res.path.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500 mb-0.5 truncate font-mono">
                        {res.path.join(' → ')}
                      </div>
                    )}
                    {/* Node Title */}
                    <div className="flex items-center gap-2 font-medium text-sm text-zinc-100 truncate">
                      {res.lawArticle && <BookOpen className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                      {res.eventDate && <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      <span className="truncate">{res.title}</span>
                    </div>
                    {/* Snippet / Notes / Tag */}
                    {res.snippet && (
                      <div className="text-xs text-zinc-400 truncate mt-0.5">
                        {res.snippet}
                      </div>
                    )}
                  </div>

                  {/* Enter indicator */}
                  {isSelected && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400 flex-shrink-0">
                      <span>Перейти</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-zinc-850 bg-zinc-900/40 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> Навигация
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Enter</Kbd> Выбрать
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd> Закрыть
            </span>
          </div>
          <span>{results.length} найдено</span>
        </div>
      </div>
    </div>
  );
};
