import React, { useMemo, useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  Scale,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { MindNode } from '../../types/mindmap';
import { downloadFile } from '../../lib/export-utils';

export const CourtDocModal: React.FC = () => {
  const {
    root,
    isCourtDocOpen,
    setCourtDocOpen,
    cases,
    activeCaseId,
  } = useMindMapStore();

  const [isCopied, setIsCopied] = useState(false);

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Extract structured legal data
  const legalStructure = useMemo(() => {
    const facts: MindNode[] = [];
    const theses: MindNode[] = [];
    const evidences: MindNode[] = [];
    const counterArgs: MindNode[] = [];
    const remedies: MindNode[] = [];

    function traverse(node: MindNode) {
      if (node.nodeType === 'fact_timeline' || node.eventDate) facts.push(node);
      if (node.nodeType === 'thesis') theses.push(node);
      if (node.nodeType === 'evidence' || node.casePages || node.caseVolume) evidences.push(node);
      if (node.nodeType === 'counter_arg') counterArgs.push(node);
      if (node.nodeType === 'remedy') remedies.push(node);

      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }

    traverse(root);

    return { facts, theses, evidences, counterArgs, remedies };
  }, [root]);

  if (!isCourtDocOpen) return null;

  const generateMarkdownDoc = () => {
    let doc = `# ПРАВОВАЯ ПОЗИЦИЯ И МЕМОРАНДУМ ДЛЯ СУДЕБНОГО ЗАСЕДАНИЯ\n\n`;
    doc += `**Дело / Производство:** ${activeCase.title}\n`;
    doc += `**Суд:** ${activeCase.courtName}\n`;
    if (activeCase.caseNumber) doc += `**Шифр дела:** ${activeCase.caseNumber}\n`;
    if (activeCase.judge) doc += `**Состав суда:** ${activeCase.judge}\n`;
    doc += `\n---\n\n`;

    doc += `## I. КРАТКАЯ ФАБУЛА И ХРОНОЛОГИЯ ЮРИДИЧЕСКИХ ФАКТОВ\n\n`;
    if (legalStructure.facts.length > 0) {
      legalStructure.facts.forEach((f, idx) => {
        const dateStr = f.eventDate ? `**[${f.eventDate}]** ` : '';
        const pagesStr = [f.caseVolume, f.casePages].filter(Boolean).join(', ');
        doc += `${idx + 1}. ${dateStr}${f.title}${pagesStr ? ` *(${pagesStr})*` : ''}\n`;
        if (f.notes) doc += `   > ${f.notes}\n`;
      });
    } else {
      doc += `*Хронологические факты не выделены.*\n`;
    }

    doc += `\n## II. ПРАВОВАЯ АРГУМЕНТАЦИЯ И ТЕЗИСЫ СТОРОНЫ\n\n`;
    if (legalStructure.theses.length > 0) {
      legalStructure.theses.forEach((t, idx) => {
        doc += `### 2.${idx + 1}. ${t.title}\n`;
        if (t.lawArticle) doc += `- **Правовое основание:** ${t.lawArticle}\n`;
        if (t.citation) doc += `> *«${t.citation}»*\n\n`;
        if (t.notes) doc += `${t.notes}\n\n`;
      });
    } else {
      doc += `*Правовые тезисы не сформулированы.*\n`;
    }

    doc += `\n## III. РЕЕСТР ДОКАЗАТЕЛЬСТВ ПО ДЕЛУ\n\n`;
    if (legalStructure.evidences.length > 0) {
      doc += `| № | Доказательство | Материалы дела | Статус | Весомость |\n`;
      doc += `| :--- | :--- | :--- | :--- | :--- |\n`;
      legalStructure.evidences.forEach((ev, idx) => {
        const pages = [ev.caseVolume, ev.casePages].filter(Boolean).join(', ') || '—';
        const score = ev.strengthScore ? `${ev.strengthScore}/5 ★` : '—';
        doc += `| ${idx + 1} | ${ev.title} | ${pages} | ${ev.evidenceStatus || 'Приобщено'} | ${score} |\n`;
      });
    }

    return doc;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateMarkdownDoc());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(generateMarkdownDoc(), `${activeCase.title}_Меморандум.md`, 'text/markdown;charset=utf-8;');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={() => setCourtDocOpen(false)}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[88vh] apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/15 border border-purple-500/30 text-[#BF5AF2] rounded-2xl shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Судебный меморандум и правовая позиция
              </h2>
              <p className="text-xs text-zinc-400">
                Автоматически сформированный процессуальный документ на основе ментальной карты
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.08] rounded-xl transition-all active:scale-[0.95] cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Скопировано' : 'Копировать'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.08] rounded-xl transition-all active:scale-[0.95] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>MD</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded-xl transition-all active:scale-[0.95] cursor-pointer"
              title="Распечатать"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCourtDocOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 font-sans text-xs bg-[#111113]">
          {/* Header Box */}
          <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-2">
            <div className="text-sm font-semibold text-white tracking-tight">
              {activeCase.courtName}
            </div>
            <div className="text-xs text-zinc-300 font-medium">
              По делу: <span className="text-white">{activeCase.title}</span>
            </div>
            {activeCase.judge && (
              <div className="text-[11px] text-zinc-400">
                Состав суда: {activeCase.judge}
              </div>
            )}
          </div>

          {/* Section 1: Facts */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#FFD60A] border-b border-white/[0.06] pb-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>I. Хронология юридических фактов</span>
            </h3>
            <div className="space-y-2 pl-2">
              {legalStructure.facts.length > 0 ? (
                legalStructure.facts.map((f, i) => (
                  <div key={f.id} className="flex items-start gap-2.5">
                    <span className="font-mono text-zinc-500 font-bold">{i + 1}.</span>
                    <div>
                      <span className="font-semibold text-white">
                        {f.eventDate && `[${f.eventDate}] `}
                      </span>
                      <span className="text-zinc-200">{f.title}</span>
                      {(f.caseVolume || f.casePages) && (
                        <span className="text-[#30D158] font-mono ml-2 text-[11px]">
                          ({[f.caseVolume, f.casePages].filter(Boolean).join(', ')})
                        </span>
                      )}
                      {f.notes && <p className="text-zinc-400 mt-0.5 text-[11px]">{f.notes}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 italic">События не указаны</p>
              )}
            </div>
          </div>

          {/* Section 2: Theses */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#BF5AF2] border-b border-white/[0.06] pb-1.5 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>II. Правовая позиция и нормативное обоснование</span>
            </h3>
            <div className="space-y-3 pl-2">
              {legalStructure.theses.length > 0 ? (
                legalStructure.theses.map((t, i) => (
                  <div key={t.id} className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1.5">
                    <div className="font-semibold text-white">
                      2.{i + 1}. {t.title}
                    </div>
                    {t.lawArticle && (
                      <div className="text-[#64D2FF] font-mono text-[11px] flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        <span>{t.lawArticle}</span>
                      </div>
                    )}
                    {t.citation && (
                      <blockquote className="border-l-2 border-[#0A84FF] pl-2 text-zinc-300 italic text-[11px]">
                        «{t.citation}»
                      </blockquote>
                    )}
                    {t.notes && <p className="text-zinc-400 text-[11px]">{t.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 italic">Тезисы не указаны</p>
              )}
            </div>
          </div>

          {/* Section 3: Evidence Registry */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#30D158] border-b border-white/[0.06] pb-1.5 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>III. Реестр письменных и иных доказательств</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-zinc-400 text-[11px]">
                    <th className="py-2 pr-3">№</th>
                    <th className="py-2 pr-4">Наименование документа</th>
                    <th className="py-2 pr-4">Том / л.д.</th>
                    <th className="py-2 pr-4">Статус</th>
                    <th className="py-2">Весомость</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-[11.5px]">
                  {legalStructure.evidences.map((ev, i) => (
                    <tr key={ev.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-3 text-zinc-500 font-mono">{i + 1}</td>
                      <td className="py-2.5 pr-4 text-white font-medium">{ev.title}</td>
                      <td className="py-2.5 pr-4 text-[#30D158] font-mono">
                        {[ev.caseVolume, ev.casePages].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400">
                        {ev.evidenceStatus === 'attached' ? 'Приобщено' : ev.evidenceStatus || 'Приобщено'}
                      </td>
                      <td className="py-2.5 font-mono text-amber-300">
                        {ev.strengthScore ? `${ev.strengthScore}/5 ★` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 flex items-center justify-between">
          <span>Сформировано для дела «{activeCase.title}»</span>
          <span className="font-mono text-zinc-500">Документ готов к копированию или печати</span>
        </div>
      </div>
    </div>
  );
};
