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
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100 max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-[#30D158] rounded-2xl shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Новое судебное производство
              </h2>
              <p className="text-xs text-zinc-400">
                Заполните реквизиты дела и выберите судебную инстанцию
              </p>
            </div>
          </div>

          <button
            onClick={() => setNewCaseOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Instance Selector — 3 Hierarchy Levels */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
              Судебная инстанция
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* 1. Окружная */}
              <button
                type="button"
                onClick={() => handleInstanceChange('district')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.96] cursor-pointer ${
                  instance === 'district'
                    ? 'bg-sky-500/20 border-[#0A84FF] text-white ring-1 ring-[#0A84FF]/40 shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/40 text-sky-300">1-я</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Окружная инстанция</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Первая инстанция</div>
                </div>
              </button>

              {/* 2. Апелляционная */}
              <button
                type="button"
                onClick={() => handleInstanceChange('appellate')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.96] cursor-pointer ${
                  instance === 'appellate'
                    ? 'bg-purple-500/20 border-[#BF5AF2] text-white ring-1 ring-[#BF5AF2]/40 shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Scale className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300">2-я</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Апелляционная</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Вторая инстанция</div>
                </div>
              </button>

              {/* 3. Верховная */}
              <button
                type="button"
                onClick={() => handleInstanceChange('supreme')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.96] cursor-pointer ${
                  instance === 'supreme'
                    ? 'bg-emerald-500/20 border-[#30D158] text-white ring-1 ring-[#30D158]/40 shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Crown className="w-4 h-4 text-[#30D158]" />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">3-я</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Верховная инстанция</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">Последняя инстанция</div>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Наименование спора / Номер дела <span className="text-[#FF453A]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. ОКР-10940/2024 (ООО «Альфа» к ПАО «Север»)"
              className="w-full bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20 text-white px-3.5 py-2.5 rounded-2xl text-xs outline-none transition-all"
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
                className="w-full bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] text-white px-3.5 py-2 rounded-xl text-xs outline-none transition-all"
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
                className="w-full bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] text-white px-3.5 py-2 rounded-xl text-xs outline-none transition-all"
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
                className="w-full bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] text-white px-3.5 py-2 rounded-xl text-xs outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Процессуальный статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-[#1c1c1e] border border-white/[0.08] focus:border-[#0A84FF] text-white px-3 py-2 rounded-xl text-xs outline-none transition-all"
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
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.96] cursor-pointer ${
                    templateId === tmpl.id
                      ? 'bg-white/[0.1] border-[#0A84FF] text-white ring-1 ring-[#0A84FF]/30'
                      : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold truncate text-white">{tmpl.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">{tmpl.category}</div>
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
              className="w-full bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] text-white p-2.5 rounded-2xl text-xs outline-none resize-none transition-all"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setNewCaseOpen(false)}
              className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-xl transition-all active:scale-[0.95] cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold apple-emerald-btn rounded-xl transition-all active:scale-[0.95] cursor-pointer"
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
