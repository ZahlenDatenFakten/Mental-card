import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  MoreHorizontal,
} from 'lucide-react';
import { LayoutNode } from '../../types/mindmap';
import { useMindMapStore } from '../../store/useMindMapStore';

interface NodeComponentProps {
  node: LayoutNode;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onDragNodeStart?: (e: React.DragEvent, nodeId: string) => void;
  onDropOnNode?: (e: React.DragEvent, targetNodeId: string) => void;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onStopEdit,
  onAddChild,
  onDelete,
  onToggleCollapse,
  onDragNodeStart,
  onDropOnNode,
}) => {
  const [editText, setEditText] = useState(node.title);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateNode, setSidebarOpen } = useMindMapStore();

  useEffect(() => {
    setEditText(node.title);
  }, [node.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleFinishEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== node.title) {
      updateNode(node.id, { title: trimmed });
    } else {
      setEditText(node.title);
    }
    onStopEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setEditText(node.title);
      onStopEdit();
    }
  };

  const hasChildren = node.children.length > 0 || node.collapsedCount > 0;
  const isRoot = node.isRoot;

  // Priority color map
  const priorityColors = {
    high: 'text-rose-400 bg-rose-950/60 border-rose-800/80',
    medium: 'text-amber-400 bg-amber-950/60 border-amber-800/80',
    low: 'text-sky-400 bg-sky-950/60 border-sky-800/80',
  };

  return (
    <div
      id={`node-${node.id}`}
      draggable={!isEditing && !isRoot}
      onDragStart={(e) => onDragNodeStart?.(e, node.id)}
      onDragOver={(e) => {
        if (!isRoot) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        onDropOnNode?.(e, node.id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onStartEdit(node.id);
      }}
      className={`group absolute select-none flex items-center transition-all duration-150 rounded-lg cursor-pointer ${
        isRoot
          ? 'bg-zinc-900/95 border-2 shadow-lg z-20'
          : 'bg-zinc-900/90 hover:bg-zinc-850 border shadow-md z-10'
      } ${
        isSelected
          ? 'ring-2 ring-emerald-500/90 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] z-30'
          : isDragOver
          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-950/40 z-30'
          : 'border-zinc-800/90 hover:border-zinc-700'
      }`}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        height: `${node.height}px`,
      }}
    >
      {/* Branch color vertical indicator bar */}
      {node.color && (
        <div
          className="w-1 self-stretch rounded-l-[7px] flex-shrink-0"
          style={{ backgroundColor: node.color }}
        />
      )}

      {/* Main node content container */}
      <div className="flex items-center gap-2 px-3 py-1 text-sm overflow-hidden whitespace-nowrap">
        {/* Title or inline edit input */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            className="bg-zinc-950/90 text-zinc-100 px-1.5 py-0.5 rounded outline-none border border-emerald-500/80 font-medium text-sm min-w-[80px]"
            style={{ width: `${Math.max(80, editText.length * 9)}px` }}
          />
        ) : (
          <span
            className={`font-medium tracking-tight ${
              isRoot
                ? 'text-zinc-50 font-semibold text-[15px]'
                : node.depth === 1
                ? 'text-zinc-100 font-medium text-[13.5px]'
                : 'text-zinc-200 text-[13px]'
            }`}
          >
            {node.title}
          </span>
        )}

        {/* Priority Badge */}
        {node.priority && (
          <span
            className={`text-[10px] uppercase font-mono font-semibold px-1.5 py-0.2 rounded border ${
              priorityColors[node.priority]
            }`}
          >
            {node.priority === 'high' ? 'Выс' : node.priority === 'medium' ? 'Ср' : 'Низ'}
          </span>
        )}

        {/* Custom Tags */}
        {node.tags && node.tags.length > 0 && (
          <div className="flex items-center gap-1">
            {node.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.2 rounded border border-zinc-700/60"
              >
                #{tag}
              </span>
            ))}
            {node.tags.length > 2 && (
              <span className="text-[10px] font-mono text-zinc-500">
                +{node.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Markdown Notes Icon & Tooltip */}
        {node.notes && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(node.id);
              setSidebarOpen(true);
            }}
            title={node.notes}
            className="text-zinc-400 hover:text-emerald-400 transition-colors p-0.5 rounded hover:bg-zinc-800"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        )}

        {/* External URL Link */}
        {node.url && (
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={node.url}
            className="text-zinc-400 hover:text-sky-400 transition-colors p-0.5 rounded hover:bg-zinc-800"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Collapse / Expand Button Pill */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(node.id);
          }}
          title={node.isCollapsed ? `Развернуть (${node.collapsedCount} узлов)` : 'Свернуть ветку'}
          className={`flex items-center justify-center h-5 px-1.5 mr-1.5 rounded text-[11px] font-mono transition-colors ${
            node.isCollapsed
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          {node.isCollapsed ? (
            <span className="flex items-center gap-0.5">
              <ChevronRight className="w-3 h-3" />
              <span>{node.collapsedCount}</span>
            </span>
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      )}

      {/* Quick Action Floating Controls (Shown on hover when node is selected or hovered) */}
      <div
        className={`absolute left-full ml-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto ${
          isSelected ? 'opacity-100' : ''
        }`}
      >
        {/* Quick Add Child Node Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          title="Добавить дочерний узел (Tab)"
          className="flex items-center justify-center w-6 h-6 bg-zinc-800/90 hover:bg-emerald-600 text-zinc-300 hover:text-white rounded-md border border-zinc-700 shadow-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Quick Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit(node.id);
          }}
          title="Редактировать (F2)"
          className="flex items-center justify-center w-6 h-6 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md border border-zinc-700 shadow-md transition-colors"
        >
          <Edit3 className="w-3 h-3" />
        </button>

        {/* Quick Delete Button (Non-root only) */}
        {!isRoot && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            title="Удалить узел (Del)"
            className="flex items-center justify-center w-6 h-6 bg-zinc-800/90 hover:bg-rose-600 text-zinc-400 hover:text-white rounded-md border border-zinc-700 shadow-md transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}

        {/* Open Inspector Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node.id);
            setSidebarOpen(true);
          }}
          title="Открыть детали (Cmd+B)"
          className="flex items-center justify-center w-6 h-6 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-md border border-zinc-700 shadow-md transition-colors"
        >
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
