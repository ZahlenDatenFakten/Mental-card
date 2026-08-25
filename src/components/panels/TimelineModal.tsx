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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950/60 border border-amber-800/80 text-amber-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Скопировано' : 'Копировать таблицу'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать CSV</span>
            </button>

            <button
              onClick={() => setTimelineOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {events.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
              В деле пока нет событий с указанием дат.<br />
              Укажите дату в боковом инспекторе для любого блока, чтобы добавить его в хронологию.
            </div>
          ) : (
            <div className="relative border-l-2 border-zinc-800 ml-4 pl-6 space-y-6 my-2">
              {events.map((ev) => (
                <div
                  key={ev.nodeId}
                  className="relative group cursor-pointer"
                  onClick={() => handleJumpToNode(ev.nodeId)}
                >
                  {/* Timeline Dot Marker */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-zinc-900 border-2 border-amber-500 group-hover:scale-125 group-hover:bg-amber-400 transition-all shadow-md" />

                  {/* Event Card */}
                  <div className="p-4 bg-zinc-900/80 group-hover:bg-zinc-850 border border-zinc-800 group-hover:border-zinc-700 rounded-xl transition-all shadow-sm flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded">
                          {ev.date} {ev.time && `(${ev.time})`}
                        </span>
                        {ev.casePages && (
                          <span className="flex items-center gap-1 text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                            <FileCheck className="w-3 h-3" />
                            {ev.casePages}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors">
                        {ev.title}
                      </h3>

                      {ev.notes && (
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                          {ev.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-zinc-500 group-hover:text-emerald-400 transition-colors flex-shrink-0">
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
        <div className="px-6 py-3 border-t border-zinc-850 bg-zinc-900/40 text-xs text-zinc-500 flex items-center justify-between">
          <span>Всего событий в хронологии: {events.length}</span>
          <span className="font-mono">Кликните на событие для перехода на холсте</span>
        </div>
      </div>
    </div>
  );
};
