import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Scale,
  BookOpen,
  FileCheck,
  Calendar,
  ShieldAlert,
  Zap,
  AlertTriangle,
  Gavel,
  Star,
  GripHorizontal,
} from 'lucide-react';
import { LayoutNode, LegalNodeType } from '../../types/mindmap';
import { useMindMapStore } from '../../store/useMindMapStore';

interface NodeComponentProps {
  node: LayoutNode;
  isSelected: boolean;
  isEditing: boolean;
  isDraggingThisNode?: boolean;
  isHoverTarget?: boolean;
  dragOffset?: { dx: number; dy: number };
  canvasScale?: number;
  onSelect: (id: string) => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onNodeDragStart?: (nodeId: string, clientX: number, clientY: number) => void;
  onNodeDragMove?: (nodeId: string, dx: number, dy: number, clientX: number, clientY: number) => void;
  onNodeDragEnd?: (nodeId: string, dx: number, dy: number, clientX: number, clientY: number) => void;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  isSelected,
  isEditing,
  isDraggingThisNode = false,
  isHoverTarget = false,
  dragOffset = { dx: 0, dy: 0 },
  canvasScale = 1,
  onSelect,
  onStartEdit,
  onStopEdit,
  onAddChild,
  onDelete,
  onToggleCollapse,
  onNodeDragStart,
  onNodeDragMove,
  onNodeDragEnd,
}) => {
  const [editText, setEditText] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateNode, duplicateNode, setSidebarOpen, filterNodeType, openConfirmDialog } = useMindMapStore();

  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const pointerStartRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });

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

  const handleDeleteWithConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmDialog({
      title: 'Удалить юридический блок?',
      message: `Удалить блок «${node.title}» и все дочерние материалы?`,
      confirmLabel: 'Удалить',
      variant: 'danger',
      onConfirm: () => {
        onDelete(node.id);
      },
    });
  };

  // Pointer event handlers for Apple-style 1:1 direct manipulation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore right click
    if (e.button !== 0) return;

    // Don't drag if clicking buttons, inputs, links, or if editing
    const target = e.target as HTMLElement;
    if (
      target.closest('button, input, textarea, a, select') ||
      isEditing
    ) {
      return;
    }

    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    pointerStartRef.current = { clientX: e.clientX, clientY: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const deltaScreenX = e.clientX - pointerStartRef.current.clientX;
    const deltaScreenY = e.clientY - pointerStartRef.current.clientY;
    const dist = Math.hypot(deltaScreenX, deltaScreenY);

    const scale = canvasScale || 1;
    const dx = deltaScreenX / scale;
    const dy = deltaScreenY / scale;

    if (!isDraggingRef.current && dist > 4) {
      isDraggingRef.current = true;
      onNodeDragStart?.(node.id, e.clientX, e.clientY);
    }

    if (isDraggingRef.current) {
      e.stopPropagation();
      onNodeDragMove?.(node.id, dx, dy, e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const deltaScreenX = e.clientX - pointerStartRef.current.clientX;
    const deltaScreenY = e.clientY - pointerStartRef.current.clientY;
    const scale = canvasScale || 1;
    const dx = deltaScreenX / scale;
    const dy = deltaScreenY / scale;

    if (isDraggingRef.current) {
      e.stopPropagation();
      onNodeDragEnd?.(node.id, dx, dy, e.clientX, e.clientY);
    } else {
      // Just a simple click selection
      onSelect(node.id);
    }

    isPointerDownRef.current = false;
    isDraggingRef.current = false;
  };

  const hasChildren = node.children.length > 0 || node.collapsedCount > 0;
  const isRoot = node.isRoot;

  // Visual type styling and icons
  const getNodeTypeBadge = (type?: LegalNodeType) => {
    switch (type) {
      case 'thesis':
        return {
          icon: <Scale className="w-3.5 h-3.5 text-violet-400" />,
          label: 'Тезис',
          bg: 'bg-violet-950/70 border-violet-800/80 text-violet-300',
        };
      case 'norm':
        return {
          icon: <BookOpen className="w-3.5 h-3.5 text-sky-400" />,
          label: 'Норма',
          bg: 'bg-sky-950/70 border-sky-800/80 text-sky-300',
        };
      case 'evidence':
        return {
          icon: <FileCheck className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Док-во',
          bg: 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300',
        };
      case 'fact_timeline':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Факт',
          bg: 'bg-amber-950/70 border-amber-800/80 text-amber-300',
        };
      case 'counter_arg':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />,
          label: 'Оппонент',
          bg: 'bg-orange-950/70 border-orange-800/80 text-orange-300',
        };
      case 'rebuttal':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
          label: 'Опровержение',
          bg: 'bg-yellow-950/70 border-yellow-800/80 text-yellow-300',
        };
      case 'risk':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Риск',
          bg: 'bg-rose-950/70 border-rose-800/80 text-rose-300',
        };
      case 'remedy':
        return {
          icon: <Gavel className="w-3.5 h-3.5 text-pink-400" />,
          label: 'Иск / Просьба',
          bg: 'bg-pink-950/70 border-pink-800/80 text-pink-300',
        };
      default:
        return null;
    }
  };

  const typeBadge = getNodeTypeBadge(node.nodeType);

  // Dim node if filter is active and this node doesn't match
  const isFilteredOut =
    filterNodeType !== 'all' &&
    node.nodeType !== filterNodeType &&
    !isRoot;

  // Calculate live position including active drag offset
  const currentX = node.x + (isDraggingThisNode ? dragOffset.dx : 0);
  const currentY = node.y + (isDraggingThisNode ? dragOffset.dy : 0);

  return (
    <div
      id={`node-${node.id}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onStartEdit(node.id);
      }}
      className={`group absolute select-none flex items-center transition-all duration-100 rounded-xl cursor-grab active:cursor-grabbing ${
        isRoot
          ? 'bg-zinc-900/95 border-2 shadow-lg z-20 border-zinc-700'
          : 'bg-zinc-900/90 hover:bg-zinc-850 border shadow-md z-10'
      } ${
        isDraggingThisNode
          ? 'ring-2 ring-emerald-400 border-emerald-400 scale-[1.03] shadow-[0_20px_40px_rgba(0,0,0,0.7)] z-50 opacity-95 pointer-events-none'
          : isHoverTarget
          ? 'ring-2 ring-indigo-400 border-indigo-400 bg-indigo-950/80 scale-[1.03] shadow-lg z-40'
          : isSelected
          ? 'ring-2 ring-emerald-500/90 border-emerald-500/80 shadow-[0_0_22px_rgba(16,185,129,0.3)] z-30'
          : 'border-zinc-800/90 hover:border-zinc-700'
      } ${isFilteredOut ? 'opacity-35 scale-[0.98]' : 'opacity-100'}`}
      style={{
        transform: `translate3d(${currentX}px, ${currentY}px, 0)`,
        height: `${node.height}px`,
        touchAction: 'none',
      }}
    >
      {/* Branch color vertical indicator */}
      {node.color && (
        <div
          className="w-1.5 self-stretch rounded-l-[10px] flex-shrink-0"
          style={{ backgroundColor: node.color }}
        />
      )}

      {/* Main node container */}
      <div className="flex items-center gap-2 px-3 py-1 text-sm overflow-hidden whitespace-nowrap">
        {/* Subtle Grip Drag Handle on hover */}
        {!isRoot && (
          <div
            title="Свободно переместить блок или ветку"
            className="text-zinc-600 group-hover:text-zinc-400 transition-colors -ml-1 cursor-grab"
          >
            <GripHorizontal className="w-3 h-3" />
          </div>
        )}

        {/* Legal Type Icon Emblem */}
        {typeBadge && (
          <div
            title={`Тип: ${typeBadge.label}`}
            className="flex items-center justify-center p-1 rounded-lg bg-zinc-850 border border-zinc-750 flex-shrink-0"
          >
            {typeBadge.icon}
          </div>
        )}

        {/* Title or Inline Edit Input */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            className="bg-zinc-950/90 text-zinc-100 px-1.5 py-0.5 rounded-lg outline-none border border-emerald-500/80 font-medium text-sm min-w-[100px]"
            style={{ width: `${Math.max(100, editText.length * 9)}px` }}
          />
        ) : (
          <span
            className={`tracking-tight ${
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

        {/* Timeline Event Date Badge */}
        {node.eventDate && (
          <span
            title={`Дата события: ${node.eventDate}`}
            className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-300 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.2 rounded"
          >
            <Calendar className="w-2.5 h-2.5" />
            {node.eventDate}
          </span>
        )}

        {/* Law Article Badge */}
        {node.lawArticle && (
          <span
            title={`Статья закона: ${node.lawArticle}`}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-300 bg-sky-950/60 border border-sky-800/80 px-1.5 py-0.2 rounded max-w-[140px] truncate"
          >
            <BookOpen className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{node.lawArticle}</span>
          </span>
        )}

        {/* Case Pages Badge (Том / л.д.) */}
        {(node.casePages || node.caseVolume) && (
          <span
            title={`Материалы дела: ${[node.caseVolume, node.casePages].filter(Boolean).join(', ')}`}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded"
          >
            <FileCheck className="w-2.5 h-2.5" />
            {[node.caseVolume, node.casePages].filter(Boolean).join(', ')}
          </span>
        )}

        {/* Strength Rating */}
        {node.strengthScore && (
          <span
            title={`Весомость доказательства: ${node.strengthScore} из 5`}
            className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-400 bg-zinc-800/80 border border-zinc-700 px-1 py-0.2 rounded"
          >
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {node.strengthScore}
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
          </div>
        )}

        {/* Notes Icon */}
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
          className={`flex items-center justify-center h-5 px-1.5 mr-1.5 rounded-md text-[11px] font-mono transition-colors ${
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

      {/* Quick Action Floating Controls */}
      <div
        className={`absolute left-full ml-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto ${
          isSelected && !isDraggingThisNode ? 'opacity-100 pointer-events-auto' : ''
        }`}
      >
        {/* Quick Add Child Node */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          title="Добавить дочерний элемент (Tab)"
          className="flex items-center justify-center w-6 h-6 bg-zinc-800/90 hover:bg-emerald-600 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 shadow-md transition-all active:scale-[0.95] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Inline Edit */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit(node.id);
          }}
          title="Редактировать текст (F2)"
          className="flex items-center justify-center w-6 h-6 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 shadow-md transition-all active:scale-[0.95] cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {/* Duplicate Branch */}
        {!isRoot && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateNode(node.id);
            }}
            title="Дублировать ветку"
            className="flex items-center justify-center w-6 h-6 bg-zinc-800/90 hover:bg-violet-600 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 shadow-md transition-all active:scale-[0.95] cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Delete Node (Non-root) with custom In-App Confirm Dialog */}
        {!isRoot && (
          <button
            onClick={handleDeleteWithConfirm}
            title="Удалить узел со всем поддеревом (Del)"
            className="flex items-center justify-center w-6 h-6 bg-zinc-800/90 hover:bg-rose-600 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 shadow-md transition-all active:scale-[0.95] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
