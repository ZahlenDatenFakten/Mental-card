import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Building2,
  Scale,
  Crown,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { JudicialInstance, CaseStatus } from '../../types/mindmap';
import { CASE_TEMPLATES } from '../../lib/sample-data';

export const NewCaseModal: React.FC = () => {
  const { isNewCaseOpen, setNewCaseOpen, createCase } = useMindMapStore();

  const [title, setTitle] = useState('');
  const [instance, setInstance] = useState<JudicialInstance>('first_instance');
  const [courtName, setCourtName] = useState('Арбитражный суд города Москвы');
  const [judge, setJudge] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [status, setStatus] = useState<CaseStatus>('in_progress');
  const [templateId, setTemplateId] = useState('arbitration-supply');

  if (!isNewCaseOpen) return null;

  const instances: {
    id: JudicialInstance;
    label: string;
    sub: string;
    icon: React.ReactNode;
    defaultCourt: string;
  }[] = [
    {
      id: 'first_instance',
      label: '1-я Инстанция',
      sub: 'АС субъекта РФ / Районный суд',
      icon: <Building2 className="w-4 h-4 text-sky-400" />,
      defaultCourt: 'Арбитражный суд города Москвы',
    },
    {
      id: 'appellate',
      label: 'Апелляция',
      sub: 'Апелляционный арбитражный суд (ААС)',
      icon: <Scale className="w-4 h-4 text-violet-400" />,
      defaultCourt: 'Девятый арбитражный апелляционный суд (9-й ААС)',
    },
    {
      id: 'cassation',
      label: 'Окружная / Кассация',
      sub: 'Арбитражный суд округа (АС МО/СЗО/ПО)',
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
      defaultCourt: 'Арбитражный суд Московского округа',
    },
    {
      id: 'supreme',
      label: 'Верховный Суд РФ',
      sub: 'СКЭС ВС РФ / Президиум ВС РФ',
      icon: <Crown className="w-4 h-4 text-emerald-400" />,
      defaultCourt: 'Верховный Суд Российской Федерации (СКЭС)',
    },
  ];

  const handleInstanceSelect = (inst: typeof instances[0]) => {
    setInstance(inst.id);
    if (!courtName || instances.some((i) => i.defaultCourt === courtName)) {
      setCourtName(inst.defaultCourt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caseTitle = title.trim() || caseNumber.trim() || 'Новое судебное дело';
    createCase({
      title: caseTitle,
      instance,
      courtName: courtName.trim() || 'Суд',
      judge: judge.trim(),
      caseNumber: caseNumber.trim(),
      status,
      templateId,
    });
    setNewCaseOpen(false);
  };

  return (
    <div
      onClick={() => setNewCaseOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in flex flex-col text-zinc-100 max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Создать новое судебное дело
              </h2>
              <p className="text-xs text-zinc-400">
                Задайте параметры спора, судебную инстанцию и начальную структуру
              </p>
            </div>
          </div>

          <button
            onClick={() => setNewCaseOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Judicial Instance Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Судебная инстанция
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {instances.map((inst) => {
                const isSelected = instance === inst.id;
                return (
                  <button
                    type="button"
                    key={inst.id}
                    onClick={() => handleInstanceSelect(inst)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-850 border-emerald-500/90 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                      {inst.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-100">
                        {inst.label}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {inst.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Case Name / Parties */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Наименование спора / Стороны
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. ООО «ПромСнаб» к АО «ТрансЛогистик» (Взыскание долга)"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-xl text-sm outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Case Number */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Официальный номер дела (опц.)
              </label>
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="напр. А40-192840/2023"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
              />
            </div>

            {/* Judge / Composition */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Судья / Состав суда (опц.)
              </label>
              <input
                type="text"
                value={judge}
                onChange={(e) => setJudge(e.target.value)}
                placeholder="напр. Судья Смирнов В.П."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
              />
            </div>
          </div>

          {/* Court Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Наименование суда
            </label>
            <input
              type="text"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              placeholder="Наименование судебного органа..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Case Status */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Процессуальный статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-200 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
              >
                <option value="in_progress">В производстве</option>
                <option value="won">Удовлетворено / В нашу пользу</option>
                <option value="lost">Отказано / Не в нашу пользу</option>
                <option value="appeal_pending">На обжаловании</option>
                <option value="settled">Мировое соглашение</option>
              </select>
            </div>

            {/* Starting Template */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Начальный шаблон правовой карты
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-200 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
              >
                {CASE_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-zinc-850 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewCaseOpen(false)}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Создать дело</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
