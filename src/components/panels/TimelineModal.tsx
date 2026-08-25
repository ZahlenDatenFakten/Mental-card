import React, { useMemo } from 'react';
import {
  X,
  Calendar,
  FileCheck,
  CornerDownLeft,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { MindNode, TimelineEvent } from '../../types/mindmap';
import { downloadFile } from '../../lib/export-utils';

export const TimelineModal: React.FC = () => {
  const {
    root,
    isTimelineOpen,
    setTimelineOpen,
    selectNode,
  } = useMindMapStore();

  const [isCopied, setIsCopied] = React.useState(false);

  // Extract all timeline events
  const events = useMemo<TimelineEvent[]>(() => {
    const list: TimelineEvent[] = [];

    function traverse(node: MindNode) {
      if (node.eventDate || node.nodeType === 'fact_timeline') {
        list.push({
          nodeId: node.id,
          title: node.title,
          date: node.eventDate || 'Дата не указана',
          time: node.eventTime,
          notes: node.notes,
          casePages: [node.caseVolume, node.casePages].filter(Boolean).join(', '),
          nodeType: node.nodeType || 'fact_timeline',
        });
      }

      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }

    traverse(root);

    // Sort ascending by date
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [root]);

  if (!isTimelineOpen) return null;

  const handleJumpToNode = (nodeId: string) => {
    selectNode(nodeId);
    setTimelineOpen(false);
  };

  const handleExportCsv = () => {
    let csv = 'Дата;Время;Событие / Юридический факт;Материалы дела;Примечания\n';
    events.forEach((ev) => {
      csv += `"${ev.date}";"${ev.time || ''}";"${ev.title.replace(/"/g, '""')}";"${ev.casePages || ''}";"${(ev.notes || '').replace(/"/g, '""')}"\n`;
    });
    downloadFile(csv, `${root.title || 'Хронология'}_хронология.csv`, 'text/csv;charset=utf-8;');
  };

  const handleCopyMarkdown = async () => {
    let md = `## ХРОНОЛОГИЯ СОБЫТИЙ ПО ДЕЛУ: ${root.title}\n\n`;
    md += `| Дата | Событие | Материалы дела | Примечание |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    events.forEach((ev) => {
      md += `| **${ev.date}** ${ev.time || ''} | ${ev.title} | ${ev.casePages || '—'} | ${ev.notes || '—'} |\n`;
    });

    await navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      onClick={() => setTimelineOpen(false)}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[85vh] apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 text-[#FF9F0A] rounded-2xl shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Хронология событий и фабула дела
              </h2>
              <p className="text-xs text-zinc-400">
                Упорядоченный перечень юридически значимых фактов по датам
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.08] rounded-xl transition-all active:scale-[0.95] cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Скопировано' : 'Копировать'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.08] rounded-xl transition-all active:scale-[0.95] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => setTimelineOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {events.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#FF9F0A]" />
              В деле пока нет событий с указанием дат.<br />
              Укажите дату в боковом инспекторе для любого блока, чтобы добавить его в хронологию.
            </div>
          ) : (
            <div className="relative border-l-2 border-white/[0.1] ml-4 pl-6 space-y-5 my-2">
              {events.map((ev) => (
                <div
                  key={ev.nodeId}
                  className="relative group cursor-pointer"
                  onClick={() => handleJumpToNode(ev.nodeId)}
                >
                  {/* Timeline Dot Marker */}
                  <div className="absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-[#1c1c1e] border-2 border-[#FF9F0A] group-hover:scale-125 group-hover:bg-[#FF9F0A] transition-all shadow-md" />

                  {/* Event Card */}
                  <div className="p-4 bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/[0.08] group-hover:border-white/[0.16] rounded-2xl transition-all duration-150 shadow-apple-card flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#FFD60A] bg-[#FF9F0A]/15 border border-[#FF9F0A]/30 px-2 py-0.5 rounded-lg">
                          {ev.date} {ev.time && `(${ev.time})`}
                        </span>
                        {ev.casePages && (
                          <span className="flex items-center gap-1 text-xs font-mono text-[#30D158] bg-[#30D158]/15 border border-[#30D158]/30 px-2 py-0.5 rounded-lg">
                            <FileCheck className="w-3 h-3" />
                            {ev.casePages}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-white group-hover:text-[#FFD60A] transition-colors tracking-tight">
                        {ev.title}
                      </h3>

                      {ev.notes && (
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          {ev.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-[#0A84FF] transition-colors flex-shrink-0">
                      <span>К блоку</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 flex items-center justify-between">
          <span>Всего событий в хронологии: {events.length}</span>
          <span className="font-mono text-zinc-500">Кликните на событие для перехода на холсте</span>
        </div>
      </div>
    </div>
  );
};
