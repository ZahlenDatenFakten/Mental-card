import React from 'react';
import {
  X,
  FolderPlus,
  Scale,
  Briefcase,
  Users,
  FilePlus2,
  ArrowRight,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { CASE_TEMPLATES } from '../../lib/sample-data';

export const TemplatesModal: React.FC = () => {
  const {
    isTemplatesOpen,
    setTemplatesOpen,
    loadTemplate,
  } = useMindMapStore();

  if (!isTemplatesOpen) return null;

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'arbitration-supply':
        return <Scale className="w-5 h-5 text-sky-400" />;
      case 'corporate-dispute':
        return <Users className="w-5 h-5 text-violet-400" />;
      case 'labor-dispute':
        return <Briefcase className="w-5 h-5 text-pink-400" />;
      default:
        return <FilePlus2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    if (window.confirm('Загрузить выбранный шаблон дела? Текущие несохраненные данные будут заменены (вы сможете отменить действие через Ctrl+Z).')) {
      loadTemplate(templateId);
    }
  };

  return (
    <div
      onClick={() => setTemplatesOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/60 border border-sky-800/80 text-sky-400 rounded-lg">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Библиотека процессуальных шаблонов
              </h2>
              <p className="text-xs text-zinc-400">
                Выберите готовую структуру дела или создайте пустой процесс
              </p>
            </div>
          </div>

          <button
            onClick={() => setTemplatesOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {CASE_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id)}
              className="p-4 bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-zinc-800 rounded-lg group-hover:scale-105 transition-transform">
                    {getTemplateIcon(tmpl.id)}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-750">
                    {tmpl.category}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  {tmpl.name}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs text-emerald-400 group-hover:translate-x-0.5 transition-transform font-medium">
                <span>Загрузить шаблон</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-850 bg-zinc-900/40 text-xs text-zinc-500 flex items-center justify-between">
          <span>После загрузки вы можете полностью настроить все ветки и узлы под свое дело</span>
        </div>
      </div>
    </div>
  );
};
