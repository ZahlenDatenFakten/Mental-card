import React, { useState } from 'react';
import {
  X,
  Building2,
  Scale,
  Crown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { JudicialInstance, CaseStatus } from '../../types/mindmap';
import { CASE_TEMPLATES } from '../../lib/sample-data';

export const NewCaseModal: React.FC = () => {
  const { isNewCaseOpen, setNewCaseOpen, createCase } = useMindMapStore();

  const [title, setTitle] = useState('');
  const [instance, setInstance] = useState<JudicialInstance>('district');
  const [courtName, setCourtName] = useState('Окружной суд (1-я инстанция)');
  const [judge, setJudge] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [status, setStatus] = useState<CaseStatus>('in_progress');
  const [templateId, setTemplateId] = useState('blank-case');
  const [description, setDescription] = useState('');

  if (!isNewCaseOpen) return null;

  const handleInstanceChange = (inst: JudicialInstance) => {
    setInstance(inst);
    if (inst === 'district') {
      setCourtName('Окружной суд (1-я инстанция)');
    } else if (inst === 'appellate') {
      setCourtName('Апелляционный суд (2-я инстанция)');
    } else if (inst === 'supreme') {
      setCourtName('Верховный Суд (Высшая инстанция)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createCase({
      title: title.trim(),
      instance,
      courtName: courtName.trim() || 'Суд',
      judge: judge.trim() || undefined,
      caseNumber: caseNumber.trim() || undefined,
      status,
      templateId,
      description: description.trim() || undefined,
    });

    setNewCaseOpen(false);
    // Reset form
    setTitle('');
    setInstance('district');
    setCourtName('Окружной суд (1-я инстанция)');
    setJudge('');
    setCaseNumber('');
    setDescription('');
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Новое судебное производство
              </h2>
              <p className="text-xs text-zinc-400">
                Заполните реквизиты дела и выберите судебную инстанцию
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Instance Selector — 3 Hierarchy Levels */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Судебная инстанция
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Окружная */}
              <button
                type="button"
                onClick={() => handleInstanceChange('district')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  instance === 'district'
                    ? 'bg-sky-950/60 border-sky-600 text-sky-200 ring-1 ring-sky-500/40 shadow-sm'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300">1-я</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-100">Окружная инстанция</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Первая инстанция</div>
                </div>
              </button>

              {/* 2. Апелляционная */}
              <button
                type="button"
                onClick={() => handleInstanceChange('appellate')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  instance === 'appellate'
                    ? 'bg-violet-950/60 border-violet-600 text-violet-200 ring-1 ring-violet-500/40 shadow-sm'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Scale className="w-4 h-4 text-violet-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950 border border-violet-800 text-violet-300">2-я</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-100">Апелляционная</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Вторая инстанция</div>
                </div>
              </button>

              {/* 3. Верховная */}
              <button
                type="button"
                onClick={() => handleInstanceChange('supreme')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  instance === 'supreme'
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Crown className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">3-я</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-100">Верховная инстанция</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Последняя инстанция</div>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Наименование спора / Номер дела <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. ОКР-10940/2024 (ООО «Альфа» к ПАО «Север»)"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3.5 py-2.5 rounded-xl text-xs outline-none transition-colors"
            />
          </div>

          {/* Court and Case Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Наименование суда
              </label>
              <input
                type="text"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="напр. Окружной суд"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Номер дела / Шифр
              </label>
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="напр. ОКР-10940/2024"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
              />
            </div>
          </div>

          {/* Judge and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Судья / Состав суда
              </label>
              <input
                type="text"
                value={judge}
                onChange={(e) => setJudge(e.target.value)}
                placeholder="напр. Судья Смирнов А.В."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Процессуальный статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-200 px-3 py-2 rounded-xl text-xs outline-none transition-colors"
              >
                <option value="in_progress">В производстве (Рассмотрение)</option>
                <option value="won">Удовлетворено / В нашу пользу</option>
                <option value="lost">Отказано / Не в нашу пользу</option>
                <option value="appeal_pending">На обжаловании</option>
                <option value="settled">Мировое соглашение</option>
              </select>
            </div>
          </div>

          {/* Starter Template */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Начальный процессуальный шаблон
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CASE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setTemplateId(tmpl.id)}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    templateId === tmpl.id
                      ? 'bg-zinc-850 border-emerald-500 text-zinc-100 ring-1 ring-emerald-500/30'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{tmpl.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">{tmpl.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Краткая фабула спора (опционально)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Существо иска, цена спора, ключевые риски..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 p-2.5 rounded-xl text-xs outline-none resize-none transition-colors"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-zinc-850 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewCaseOpen(false)}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Создать производство</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
