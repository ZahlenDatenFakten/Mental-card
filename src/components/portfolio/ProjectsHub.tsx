import React, { useState, useMemo } from 'react';
import {
  Building2,
  Scale,
  Crown,
  Plus,
  Search,
  ArrowRight,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { JudicialInstance, CaseItem } from '../../types/mindmap';
import { CASE_TEMPLATES } from '../../lib/sample-data';
import { Hero3DCanvas } from '../canvas/Hero3DCanvas';
import { Case3DTiltCard } from './Case3DTiltCard';

export const ProjectsHub: React.FC = () => {
  const {
    cases,
    activeCaseId,
    switchCase,
    deleteCase,
    duplicateCase,
    promoteToNextInstance,
    setNewCaseOpen,
    loadTemplate,
    openConfirmDialog,
  } = useMindMapStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<JudicialInstance | 'all'>('all');

  const filteredCases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return cases.filter((c) => {
      const matchInstance = selectedInstance === 'all' || c.instance === selectedInstance;
      const matchQuery =
        !query ||
        c.title.toLowerCase().includes(query) ||
        c.courtName.toLowerCase().includes(query) ||
        (c.caseNumber && c.caseNumber.toLowerCase().includes(query)) ||
        (c.judge && c.judge.toLowerCase().includes(query));
      return matchInstance && matchQuery;
    });
  }, [cases, selectedInstance, searchQuery]);

  const handleDelete = (c: CaseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmDialog({
      title: 'Удалить судебное дело?',
      message: `Вы действительно хотите удалить дело «${c.title}»? Все сохраненные ветки и материалы будут удалены.`,
      confirmLabel: 'Удалить дело',
      variant: 'danger',
      onConfirm: () => {
        deleteCase(c.id);
      },
    });
  };

  const handlePromote = (c: CaseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    let targetInst: JudicialInstance = 'appellate';
    if (c.instance === 'district') targetInst = 'appellate';
    else if (c.instance === 'appellate') targetInst = 'supreme';
    else return;

    promoteToNextInstance(c.id, targetInst);
  };

  return (
    <div className="w-full h-screen overflow-y-auto bg-black text-[#F5F5F7] select-none flex flex-col antialiased">
      {/* Top Glass Navbar */}
      <header className="sticky top-0 z-40 h-16 px-6 sm:px-12 apple-vibrant-bar flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#0A84FF]/20 border border-[#0A84FF]/40 text-[#0A84FF] shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight leading-tight">
              Судебные ментальные карты
            </h1>
            <p className="text-[11.5px] text-[#8E8E93]">
              Единый реестр производств и инстанций
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewCaseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold apple-btn-green rounded-xl transition-all cursor-pointer shadow-apple-card active:scale-[0.95]"
          >
            <Plus className="w-4 h-4" />
            <span>Новое судебное дело</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Projects Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8 space-y-10">
        {/* 3D Interactive Spatial Legal Graph Showcase */}
        <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-white/[0.14] shadow-[0_24px_64px_rgba(0,0,0,0.85)] bg-gradient-to-b from-[#161619] via-[#0d0d10] to-black">
          {/* Ambient Lighting orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0A84FF]/20 blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#BF5AF2]/20 blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Pitch */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.14] text-xs font-mono text-[#EBEBF5] backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>3D СУДЕБНЫЙ СИМУЛЯТОР & СТРАТЕГИЯ ДЕЛА</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
                Проектируйте <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0A84FF] via-[#64D2FF] to-[#30D158]">победу в суде</span> в трех измерениях
              </h2>

              <p className="text-sm sm:text-base text-[#8E8E93] leading-relaxed max-w-xl font-sans">
                Интеллектуальная система визуализации судебных дел: свободное перемещение веток, динамические кривые Безье, фабула и хронология, реестр доказательств и сквозная передача дел от 1-й Окружной до Верховной инстанции.
              </p>

              {/* Quick Feature Pills */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs text-[#EBEBF5]">
                  <Building2 className="w-3.5 h-3.5 text-[#0A84FF]" />
                  <span>1. Окружная</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs text-[#EBEBF5]">
                  <Scale className="w-3.5 h-3.5 text-[#BF5AF2]" />
                  <span>2. Апелляционная</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs text-[#EBEBF5]">
                  <Crown className="w-3.5 h-3.5 text-[#30D158]" />
                  <span>3. Верховная</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs text-[#EBEBF5]">
                  <Compass className="w-3.5 h-3.5 text-[#FF9F0A]" />
                  <span>1:1 Свободное перемещение</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => setNewCaseOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold apple-btn-green rounded-2xl transition-all cursor-pointer shadow-lg active:scale-[0.96]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать судебное дело</span>
                </button>

                <button
                  onClick={() => switchCase(cases[0]?.id || activeCaseId)}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-medium apple-btn-secondary rounded-2xl transition-all cursor-pointer active:scale-[0.96]"
                >
                  <span>Открыть активное дело</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Interactive 3D Canvas */}
            <div className="lg:col-span-5 relative">
              <Hero3DCanvas />
              <div className="text-center mt-2">
                <span className="text-[11px] font-mono text-[#8E8E93]">
                  ✦ Интерактивная 3D модель связей: двигайте курсор для вращения
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Cases Header & Segmented Filter */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
            {/* Segmented Instance Navigation (Exact 3 Hierarchy Levels) */}
            <div className="flex items-center gap-1.5 p-1.5 apple-segmented-track overflow-x-auto max-w-full">
              <button
                onClick={() => setSelectedInstance('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                  selectedInstance === 'all'
                    ? 'apple-segmented-item-active'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Все инстанции ({cases.length})
              </button>

              <button
                onClick={() => setSelectedInstance('district')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                  selectedInstance === 'district'
                    ? 'bg-[#0A84FF]/25 text-white shadow-sm ring-1 ring-[#0A84FF]/40'
                    : 'text-[#8E8E93] hover:text-[#64D2FF]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>1. Окружная инстанция</span>
              </button>

              <button
                onClick={() => setSelectedInstance('appellate')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                  selectedInstance === 'appellate'
                    ? 'bg-[#BF5AF2]/25 text-white shadow-sm ring-1 ring-[#BF5AF2]/40'
                    : 'text-[#8E8E93] hover:text-[#E0B0FF]'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#BF5AF2]" />
                <span>2. Апелляционная инстанция</span>
              </button>

              <button
                onClick={() => setSelectedInstance('supreme')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                  selectedInstance === 'supreme'
                    ? 'bg-[#30D158]/25 text-white shadow-sm ring-1 ring-[#30D158]/40'
                    : 'text-[#8E8E93] hover:text-[#30D158]'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-[#30D158]" />
                <span>3. Верховная инстанция</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по делам, судам, судьям..."
                className="w-full bg-black/50 border border-white/[0.12] focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/25 text-white pl-10 pr-3.5 py-2.5 rounded-2xl text-xs outline-none transition-all font-sans"
              />
            </div>
          </div>

          {/* Cases 3D Tilt Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Case Special Hero Card */}
            <div
              onClick={() => setNewCaseOpen(true)}
              className="p-8 rounded-3xl border-2 border-dashed border-white/[0.16] hover:border-[#0A84FF]/80 bg-gradient-to-b from-white/[0.03] to-white/[0.01] hover:bg-white/[0.06] transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer min-h-[260px] shadow-apple-card hover:shadow-[0_16px_40px_rgba(10,132,255,0.2)] active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/[0.08] group-hover:bg-[#0A84FF] text-[#8E8E93] group-hover:text-white border border-white/[0.12] group-hover:border-[#0A84FF] flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-110 shadow-sm">
                <Plus className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#0A84FF] transition-colors">
                Создать новое судебное дело
              </h3>
              <p className="text-xs text-[#8E8E93] mt-1.5 max-w-[240px] leading-relaxed">
                Выбор 1-й Окружной, 2-й Апелляционной или 3-й Верховной инстанции
              </p>
            </div>

            {/* Render 3D Tilt Cards for each case */}
            {filteredCases.map((c) => (
              <Case3DTiltCard
                key={c.id}
                caseItem={c}
                isActive={c.id === activeCaseId}
                onOpen={(id) => switchCase(id)}
                onPromote={handlePromote}
                onDuplicate={(id) => duplicateCase(id)}
                onDelete={handleDelete}
                canDelete={cases.length > 1}
              />
            ))}
          </div>
        </section>

        {/* Starter Legal Templates Gallery (Apple Pages/Keynote Style) */}
        <section className="pt-8 border-t border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Готовые процессуальные шаблоны
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Создайте новое дело по типовой категории спора в один клик
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {CASE_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => loadTemplate(tmpl.id)}
                className="p-5 apple-card hover:border-[#0A84FF]/60 hover:shadow-[0_12px_32px_rgba(10,132,255,0.18)] transition-all duration-150 flex flex-col justify-between group cursor-pointer active:scale-[0.98]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-medium text-[#8E8E93] bg-white/[0.06] px-2.5 py-0.5 rounded-lg border border-white/[0.08]">
                      {tmpl.category}
                    </span>
                    <Sparkles className="w-4 h-4 text-[#0A84FF] group-hover:scale-110 transition-transform" />
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#0A84FF] transition-colors">
                    {tmpl.name}
                  </h3>

                  <p className="text-xs text-[#8E8E93] leading-relaxed line-clamp-2 font-sans">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#0A84FF] font-semibold">
                  <span>Создать производство</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
