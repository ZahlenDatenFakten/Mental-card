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
    if (e.button !== 0) return;

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
      onSelect(node.id);
    }

    isPointerDownRef.current = false;
    isDraggingRef.current = false;
  };

  const hasChildren = node.children.length > 0 || node.collapsedCount > 0;
  const isRoot = node.isRoot;

  // Apple SF Pro Type Badges and Harmonious Tints
  const getNodeTypeBadge = (type?: LegalNodeType) => {
    switch (type) {
      case 'thesis':
        return {
          icon: <Scale className="w-3.5 h-3.5 text-[#BF5AF2]" />,
          label: 'Тезис',
          bg: 'bg-[#BF5AF2]/15 border-[#BF5AF2]/30 text-[#E0B0FF]',
        };
      case 'norm':
        return {
          icon: <BookOpen className="w-3.5 h-3.5 text-[#0A84FF]" />,
          label: 'Норма',
          bg: 'bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#64D2FF]',
        };
      case 'evidence':
        return {
          icon: <FileCheck className="w-3.5 h-3.5 text-[#30D158]" />,
          label: 'Док-во',
          bg: 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]',
        };
      case 'fact_timeline':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-[#FF9F0A]" />,
          label: 'Факт',
          bg: 'bg-[#FF9F0A]/15 border-[#FF9F0A]/30 text-[#FFD60A]',
        };
      case 'counter_arg':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-[#FF9F0A]" />,
          label: 'Оппонент',
          bg: 'bg-[#FF9F0A]/15 border-[#FF9F0A]/30 text-[#FFB340]',
        };
      case 'rebuttal':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-[#FFD60A]" />,
          label: 'Опровержение',
          bg: 'bg-[#FFD60A]/15 border-[#FFD60A]/30 text-[#FFE57F]',
        };
      case 'risk':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#FF453A]" />,
          label: 'Риск',
          bg: 'bg-[#FF453A]/15 border-[#FF453A]/30 text-[#FF6961]',
        };
      case 'remedy':
        return {
          icon: <Gavel className="w-3.5 h-3.5 text-[#FF375F]" />,
          label: 'Иск / Просьба',
          bg: 'bg-[#FF375F]/15 border-[#FF375F]/30 text-[#FF6B8B]',
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
      className={`group absolute select-none flex items-center transition-all duration-100 rounded-2xl cursor-grab active:cursor-grabbing apple-glass-card ${
        isRoot
          ? 'border-white/[0.18] shadow-apple-card z-20 bg-[#1c1c1e]/95'
          : 'z-10'
      } ${
        isDraggingThisNode
          ? 'ring-2 ring-[#0A84FF] border-[#0A84FF] scale-[1.025] shadow-[0_24px_48px_rgba(0,0,0,0.65)] z-50 opacity-95 pointer-events-none'
          : isHoverTarget
          ? 'ring-2 ring-[#5E5CE6] border-[#5E5CE6] bg-[#5E5CE6]/20 scale-[1.02] shadow-apple-active z-40'
          : isSelected
          ? 'ring-[2px] ring-[#0A84FF] border-[#0A84FF]/80 shadow-[0_0_0_1px_#0A84FF,0_8px_32px_rgba(10,132,255,0.3)] z-30'
          : 'hover:border-white/[0.18] hover:shadow-apple-hover'
      } ${isFilteredOut ? 'opacity-30 scale-[0.98]' : 'opacity-100'}`}
      style={{
        transform: `translate3d(${currentX}px, ${currentY}px, 0)`,
        height: `${node.height}px`,
        touchAction: 'none',
      }}
    >
      {/* Apple Accent Bar */}
      {node.color && (
        <div
          className="w-1.5 self-stretch rounded-l-[14px] flex-shrink-0"
          style={{ backgroundColor: node.color }}
        />
      )}

      {/* Main Node Content */}
      <div className="flex items-center gap-2 px-3.5 py-1 text-sm overflow-hidden whitespace-nowrap">
        {/* Subtle Grip Drag Handle on hover */}
        {!isRoot && (
          <div
            title="Свободно переместить блок или ветку"
            className="text-white/20 group-hover:text-white/50 transition-colors -ml-1 cursor-grab"
          >
            <GripHorizontal className="w-3 h-3" />
          </div>
        )}

        {/* Legal Type Icon Emblem */}
        {typeBadge && (
          <div
            title={`Тип: ${typeBadge.label}`}
            className={`flex items-center justify-center p-1 rounded-lg border ${typeBadge.bg} flex-shrink-0`}
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
            className="bg-black/60 text-white px-2 py-0.5 rounded-lg outline-none border border-[#0A84FF] font-medium text-sm min-w-[100px] shadow-inner"
            style={{ width: `${Math.max(100, editText.length * 9)}px` }}
          />
        ) : (
          <span
            className={`tracking-tight font-sans ${
              isRoot
                ? 'text-white font-semibold text-[14.5px]'
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
            className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded-md"
          >
            <Calendar className="w-2.5 h-2.5" />
            {node.eventDate}
          </span>
        )}

        {/* Law Article Badge */}
        {node.lawArticle && (
          <span
            title={`Статья закона: ${node.lawArticle}`}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-300 bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.2 rounded-md max-w-[140px] truncate"
          >
            <BookOpen className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{node.lawArticle}</span>
          </span>
        )}

        {/* Case Pages Badge (Том / л.д.) */}
        {(node.casePages || node.caseVolume) && (
          <span
            title={`Материалы дела: ${[node.caseVolume, node.casePages].filter(Boolean).join(', ')}`}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-md"
          >
            <FileCheck className="w-2.5 h-2.5" />
            {[node.caseVolume, node.casePages].filter(Boolean).join(', ')}
          </span>
        )}

        {/* Strength Rating */}
        {node.strengthScore && (
          <span
            title={`Весомость доказательства: ${node.strengthScore} из 5`}
            className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-400 bg-white/[0.06] border border-white/[0.1] px-1 py-0.2 rounded-md"
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
                className="text-[10px] font-mono text-zinc-400 bg-white/[0.05] px-1.5 py-0.2 rounded-md border border-white/[0.08]"
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
            className="text-zinc-400 hover:text-emerald-400 transition-colors p-0.5 rounded-lg hover:bg-white/[0.08]"
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
            className="text-zinc-400 hover:text-sky-400 transition-colors p-0.5 rounded-lg hover:bg-white/[0.08]"
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
          className={`flex items-center justify-center h-5 px-1.5 mr-1.5 rounded-lg text-[11px] font-mono transition-all ${
            node.isCollapsed
              ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/40 hover:bg-[#30D158]/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08]'
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

      {/* Quick Action Floating Controls (Apple Glass Capsule) */}
      <div
        className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto p-1 apple-glass rounded-xl shadow-apple-card ${
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
          className="flex items-center justify-center w-6 h-6 bg-white/[0.08] hover:bg-[#30D158] text-zinc-200 hover:text-black rounded-lg border border-white/[0.1] shadow-sm transition-all active:scale-[0.92] cursor-pointer"
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
          className="flex items-center justify-center w-6 h-6 bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white rounded-lg border border-white/[0.1] shadow-sm transition-all active:scale-[0.92] cursor-pointer"
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
            className="flex items-center justify-center w-6 h-6 bg-white/[0.08] hover:bg-[#BF5AF2] text-zinc-200 hover:text-white rounded-lg border border-white/[0.1] shadow-sm transition-all active:scale-[0.92] cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Delete Node (Non-root) */}
        {!isRoot && (
          <button
            onClick={handleDeleteWithConfirm}
            title="Удалить узел со всем поддеревом (Del)"
            className="flex items-center justify-center w-6 h-6 bg-white/[0.08] hover:bg-[#FF453A] text-zinc-400 hover:text-white rounded-lg border border-white/[0.1] shadow-sm transition-all active:scale-[0.92] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
