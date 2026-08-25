import React, { useState, useRef } from 'react';
import {
  Building2,
  Scale,
  Crown,
  CheckCircle2,
  Trash2,
  Copy,
  ArrowUpRight,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { CaseItem, JudicialInstance, MindNode } from '../../types/mindmap';

interface Case3DTiltCardProps {
  caseItem: CaseItem;
  isActive: boolean;
  onOpen: (id: string) => void;
  onPromote: (c: CaseItem, e: React.MouseEvent) => void;
  onDuplicate: (id: string) => void;
  onDelete: (c: CaseItem, e: React.MouseEvent) => void;
  canDelete: boolean;
}

export const Case3DTiltCard: React.FC<Case3DTiltCardProps> = ({
  caseItem,
  isActive,
  onOpen,
  onPromote,
  onDuplicate,
  onDelete,
  canDelete,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    setRotateX(-normY * 8);
    setRotateY(normX * 8);

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const getInstanceBadge = (inst: JudicialInstance) => {
    switch (inst) {
      case 'district':
        return {
          label: '1. Окружная инстанция',
          short: 'Окружной суд',
          icon: <Building2 className="w-3.5 h-3.5 text-[#0A84FF]" />,
          style: 'bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#64D2FF]',
          glow: 'rgba(10, 132, 255, 0.15)',
        };
      case 'appellate':
        return {
          label: '2. Апелляционная инстанция',
          short: 'Апелляционный суд',
          icon: <Scale className="w-3.5 h-3.5 text-[#BF5AF2]" />,
          style: 'bg-[#BF5AF2]/15 border-[#BF5AF2]/30 text-[#E0B0FF]',
          glow: 'rgba(191, 90, 242, 0.15)',
        };
      case 'supreme':
        return {
          label: '3. Верховная инстанция',
          short: 'Верховный Суд',
          icon: <Crown className="w-3.5 h-3.5 text-[#30D158]" />,
          style: 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]',
          glow: 'rgba(48, 209, 88, 0.15)',
        };
    }
  };

  const getStatusBadge = (status: CaseItem['status']) => {
    switch (status) {
      case 'won':
        return <span className="text-[11px] font-mono text-[#30D158] bg-[#30D158]/15 border border-[#30D158]/30 px-2 py-0.5 rounded-lg">Удовлетворено</span>;
      case 'lost':
        return <span className="text-[11px] font-mono text-[#FF453A] bg-[#FF453A]/15 border border-[#FF453A]/30 px-2 py-0.5 rounded-lg">Отказано</span>;
      case 'appeal_pending':
        return <span className="text-[11px] font-mono text-[#FF9F0A] bg-[#FF9F0A]/15 border border-[#FF9F0A]/30 px-2 py-0.5 rounded-lg">На обжаловании</span>;
      case 'settled':
        return <span className="text-[11px] font-mono text-[#64D2FF] bg-[#64D2FF]/15 border border-[#64D2FF]/30 px-2 py-0.5 rounded-lg">Мировое</span>;
      default:
        return <span className="text-[11px] font-mono text-[#EBEBF5] bg-white/[0.06] border border-zinc-800 px-2 py-0.5 rounded-lg">В производстве</span>;
    }
  };

  const countNodes = (node: MindNode): number => {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += countNodes(child);
      }
    }
    return count;
  };

  const totalNodes = countNodes(caseItem.root);
  const badge = getInstanceBadge(caseItem.instance);
  const previewBranches = (caseItem.root.children || []).slice(0, 3);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpen(caseItem.id)}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${rotateX !== 0 ? 6 : 0}px)`,
        transition: rotateX === 0 ? 'transform 350ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
      }}
      className={`relative p-6 rounded-3xl border select-none transition-all duration-150 flex flex-col justify-between group cursor-pointer overflow-hidden ${
        isActive
          ? 'bg-[#18181b] border-[#0A84FF] ring-2 ring-[#0A84FF]/40 shadow-[0_16px_40px_rgba(10,132,255,0.22)]'
          : 'bg-[#141417] hover:bg-[#1a1a1e] border-zinc-800/90 hover:border-zinc-700 shadow-xl'
      }`}
    >
      {/* Subtle Ambient Aura */}
      <div
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ backgroundColor: badge.glow }}
      />

      {/* Cursor Glare */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-150"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, transparent 60%)`,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 space-y-4">
        {/* Top Row: Instance Badge & Status */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl border ${badge.style}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </span>

          <div className="flex items-center gap-2">
            {getStatusBadge(caseItem.status)}
            {isActive && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#30D158] bg-[#30D158]/15 px-2.5 py-0.5 rounded-lg border border-[#30D158]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Текущее
              </span>
            )}
          </div>
        </div>

        {/* Title and Case Number */}
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-[#0A84FF] transition-colors leading-snug tracking-tight">
            {caseItem.title}
          </h3>
          {caseItem.caseNumber && (
            <span className="text-xs font-mono text-[#8E8E93] block mt-0.5">
              Шифр дела: № {caseItem.caseNumber}
            </span>
          )}
        </div>

        {/* Court and Judge */}
        <div className="text-xs text-[#8E8E93] space-y-0.5 font-sans">
          <div className="text-[#EBEBF5] font-medium">{caseItem.courtName}</div>
          {caseItem.judge && <div className="text-[#8E8E93] text-[11px]">{caseItem.judge}</div>}
        </div>

        {/* Mini Mind-Map Visual Graph Node Preview */}
        <div className="p-3 bg-black/40 border border-zinc-800/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
            <span className="flex items-center gap-1.5 font-medium text-[#EBEBF5]">
              <Layers className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>Структура ({totalNodes} блоков)</span>
            </span>
            <span className="font-mono text-[#8E8E93]">3D схема</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {previewBranches.map((child, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-zinc-800 text-[#EBEBF5] truncate max-w-[150px]"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: child.color || '#0A84FF' }}
                />
                <span className="truncate">{child.title}</span>
              </span>
            ))}
            {totalNodes > 4 && (
              <span className="text-[10px] text-[#8E8E93] font-mono">+{totalNodes - 4} узлов</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="relative z-10 mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Primary Enter Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(caseItem.id);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold apple-btn-primary rounded-xl transition-all active:scale-[0.95] cursor-pointer shadow-sm"
          >
            <span>Открыть карту</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Instance Promotion Buttons */}
          {caseItem.instance === 'district' && (
            <button
              onClick={(e) => onPromote(caseItem, e)}
              title="Передать материалы в Апелляционную инстанцию"
              className="flex items-center gap-1 text-xs font-medium text-[#E0B0FF] hover:text-white bg-[#BF5AF2]/15 hover:bg-[#BF5AF2]/30 px-3 py-2 rounded-xl border border-[#BF5AF2]/30 transition-all active:scale-[0.95] cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#BF5AF2]" />
              <span>В Апелляцию</span>
            </button>
          )}

          {caseItem.instance === 'appellate' && (
            <button
              onClick={(e) => onPromote(caseItem, e)}
              title="Передать материалы в Верховную инстанцию"
              className="flex items-center gap-1 text-xs font-medium text-[#30D158] hover:text-white bg-[#30D158]/15 hover:bg-[#30D158]/30 px-3 py-2 rounded-xl border border-[#30D158]/30 transition-all active:scale-[0.95] cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#30D158]" />
              <span>В Верховный Суд</span>
            </button>
          )}
        </div>

        {/* Duplicate and Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(caseItem.id);
            }}
            title="Дублировать дело"
            className="p-2 text-[#8E8E93] hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.9] cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>

          {canDelete && (
            <button
              onClick={(e) => onDelete(caseItem, e)}
              title="Удалить дело"
              className="p-2 text-[#8E8E93] hover:text-[#FF453A] hover:bg-[#FF453A]/15 rounded-xl transition-all active:scale-[0.9] cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
