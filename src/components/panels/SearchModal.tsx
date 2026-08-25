import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  CornerDownLeft,
  Calendar,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
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

  // Focus input upon open
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Recursively collect searchable nodes
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const cleanQuery = query.toLowerCase().trim();
    const matches: SearchResult[] = [];

    function searchTree(node: MindNode, currentPath: string[]) {
      const path = [...currentPath, node.title];
      const matchTitle = node.title.toLowerCase().includes(cleanQuery);
      const matchNotes = node.notes ? node.notes.toLowerCase().includes(cleanQuery) : false;
      const matchLaw = node.lawArticle ? node.lawArticle.toLowerCase().includes(cleanQuery) : false;
      const matchTags = node.tags ? node.tags.some((t) => t.toLowerCase().includes(cleanQuery)) : false;

      if (matchTitle || matchNotes || matchLaw || matchTags) {
        matches.push({
          nodeId: node.id,
          title: node.title,
          snippet: node.notes || node.lawArticle,
          path,
          nodeType: node.nodeType,
          lawArticle: node.lawArticle,
          eventDate: node.eventDate,
        });
      }

      if (node.children) {
        for (const child of node.children) {
          searchTree(child, path);
        }
      }
    }

    searchTree(root, []);
    return matches.slice(0, 15);
  }, [root, query]);

  if (!isSearchOpen) return null;

  const handleSelectResult = (nodeId: string) => {
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
        handleSelectResult(results[selectedIndex].nodeId);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchOpen(false);
    }
  };

  return (
    <div
      onClick={() => setSearchOpen(false)}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-start justify-center pt-20 p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100"
      >
        {/* Apple Spotlight Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <Search className="w-5 h-5 text-[#0A84FF] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по тезисам, доказательствам, статьям закона и датам..."
            className="flex-1 bg-transparent text-white placeholder-zinc-400 text-sm outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Kbd>ESC</Kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-zinc-400 text-xs font-sans">
              Начните ввод для быстрого перехода к любому блоку дела
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs font-sans">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res, index) => {
                const isCurrent = index === selectedIndex;
                return (
                  <div
                    key={res.nodeId}
                    onClick={() => handleSelectResult(res.nodeId)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`px-4 py-3 rounded-2xl cursor-pointer flex items-center justify-between gap-3 transition-all duration-100 ${
                      isCurrent
                        ? 'bg-[#0A84FF] text-white shadow-sm'
                        : 'text-zinc-200 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs truncate">
                          {res.title}
                        </span>

                        {res.eventDate && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                              isCurrent ? 'bg-black/20 text-white' : 'bg-amber-500/15 text-amber-300'
                            }`}
                          >
                            <Calendar className="w-2.5 h-2.5" />
                            {res.eventDate}
                          </span>
                        )}

                        {res.lawArticle && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                              isCurrent ? 'bg-black/20 text-white' : 'bg-sky-500/15 text-sky-300'
                            }`}
                          >
                            <BookOpen className="w-2.5 h-2.5" />
                            {res.lawArticle}
                          </span>
                        )}
                      </div>

                      {/* Hierarchy breadcrumb */}
                      <div
                        className={`text-[10px] truncate flex items-center gap-1 ${
                          isCurrent ? 'text-white/80' : 'text-zinc-400'
                        }`}
                      >
                        {res.path.slice(0, -1).map((p, i) => (
                          <React.Fragment key={i}>
                            <span>{p}</span>
                            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                          </React.Fragment>
                        ))}
                        <span className="font-medium">{res.title}</span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-1 text-xs opacity-0 transition-opacity ${
                        isCurrent ? 'opacity-100 text-white' : 'group-hover:opacity-100 text-zinc-400'
                      }`}
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-[11px] text-zinc-400">
          <span>Навигация: ↑ ↓ для выбора</span>
          <span>Переход: ↵ Enter</span>
        </div>
      </div>
    </div>
  );
};
