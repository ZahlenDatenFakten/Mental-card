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
    openConfirmDialog,
  } = useMindMapStore();

  if (!isTemplatesOpen) return null;

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'arbitration-supply':
        return <Scale className="w-5 h-5 text-sky-400" />;
      case 'corporate-dispute':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'labor-dispute':
        return <Briefcase className="w-5 h-5 text-pink-400" />;
      default:
        return <FilePlus2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleSelectTemplate = (templateId: string, templateName: string) => {
    openConfirmDialog({
      title: 'Загрузить процессуальный шаблон?',
      message: `Загрузка шаблона «${templateName}» заменит текущую схему активного дела. Вы сможете отменить действие через Ctrl+Z.`,
      confirmLabel: 'Загрузить шаблон',
      variant: 'primary',
      onConfirm: () => {
        loadTemplate(templateId);
      },
    });
  };

  return (
    <div
      onClick={() => setTemplatesOpen(false)}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-2xl shadow-sm">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Библиотека процессуальных шаблонов
              </h2>
              <p className="text-xs text-zinc-400">
                Выберите готовую структуру дела или создайте пустой процесс
              </p>
            </div>
          </div>

          <button
            onClick={() => setTemplatesOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {CASE_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id, tmpl.name)}
              className="p-4.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl transition-all duration-150 flex flex-col justify-between group cursor-pointer shadow-apple-card hover:shadow-apple-hover"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-white/[0.06] rounded-xl group-hover:scale-105 transition-transform">
                    {getTemplateIcon(tmpl.id)}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-300 bg-white/[0.06] px-2.5 py-0.5 rounded-lg border border-white/[0.08]">
                    {tmpl.category}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-[#0A84FF] transition-colors tracking-tight">
                  {tmpl.name}
                </h3>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#0A84FF] group-hover:translate-x-0.5 transition-transform font-medium">
                <span>Загрузить шаблон</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 flex items-center justify-between">
          <span>После загрузки вы можете полностью настроить все ветки и узлы под свое дело</span>
        </div>
      </div>
    </div>
  );
};
