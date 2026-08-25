import React, { useState, useMemo } from 'react';
import {
  Building2,
  Scale,
  Crown,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Copy,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { JudicialInstance, CaseItem, MindNode } from '../../types/mindmap';
import { CASE_TEMPLATES } from '../../lib/sample-data';

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

  const getInstanceBadge = (inst: JudicialInstance) => {
    switch (inst) {
      case 'district':
        return {
          label: '1. Окружная инстанция',
          short: 'Окружной суд',
          icon: <Building2 className="w-3.5 h-3.5 text-[#0A84FF]" />,
          style: 'bg-[#0A84FF]/15 border-[#0A84FF]/30 text-[#64D2FF]',
        };
      case 'appellate':
        return {
          label: '2. Апелляционная инстанция',
          short: 'Апелляционный суд',
          icon: <Scale className="w-3.5 h-3.5 text-[#BF5AF2]" />,
          style: 'bg-[#BF5AF2]/15 border-[#BF5AF2]/30 text-[#E0B0FF]',
        };
      case 'supreme':
        return {
          label: '3. Верховная инстанция',
          short: 'Верховный Суд',
          icon: <Crown className="w-3.5 h-3.5 text-[#30D158]" />,
          style: 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]',
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
        return <span className="text-[11px] font-mono text-[#EBEBF5] bg-white/[0.08] border border-white/[0.1] px-2 py-0.5 rounded-lg">В производстве</span>;
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
      <header className="sticky top-0 z-40 h-16 px-6 sm:px-10 apple-vibrant-bar flex items-center justify-between">
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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold apple-btn-green rounded-xl transition-all cursor-pointer shadow-apple-card"
          >
            <Plus className="w-4 h-4" />
            <span>Новое судебное дело</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8 space-y-8">
        {/* Hero Banner & Search Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          {/* Segmented Instance Navigation (Exact 3 Hierarchy Levels) */}
          <div className="flex items-center gap-1.5 p-1 apple-segmented-track overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedInstance('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                selectedInstance === 'all'
                  ? 'apple-segmented-item-active'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              Все инстанции ({cases.length})
            </button>

            <button
              onClick={() => setSelectedInstance('district')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                selectedInstance === 'district'
                  ? 'bg-[#0A84FF]/25 text-white shadow-sm ring-1 ring-[#0A84FF]/40 font-semibold'
                  : 'text-[#8E8E93] hover:text-[#64D2FF]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>1. Окружная инстанция</span>
            </button>

            <button
              onClick={() => setSelectedInstance('appellate')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                selectedInstance === 'appellate'
                  ? 'bg-[#BF5AF2]/25 text-white shadow-sm ring-1 ring-[#BF5AF2]/40 font-semibold'
                  : 'text-[#8E8E93] hover:text-[#E0B0FF]'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-[#BF5AF2]" />
              <span>2. Апелляционная инстанция</span>
            </button>

            <button
              onClick={() => setSelectedInstance('supreme')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                selectedInstance === 'supreme'
                  ? 'bg-[#30D158]/25 text-white shadow-sm ring-1 ring-[#30D158]/40 font-semibold'
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
              className="w-full bg-black/50 border border-white/[0.12] focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/25 text-white pl-10 pr-3.5 py-2 rounded-xl text-xs outline-none transition-all font-sans"
            />
          </div>
        </div>

        {/* Projects / Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Action Card: Create New Case */}
          <div
            onClick={() => setNewCaseOpen(true)}
            className="p-6 rounded-2xl border-2 border-dashed border-white/[0.14] hover:border-[#0A84FF]/60 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-150 flex flex-col items-center justify-center text-center group cursor-pointer min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] group-hover:bg-[#0A84FF]/20 text-[#8E8E93] group-hover:text-[#0A84FF] border border-white/[0.08] group-hover:border-[#0A84FF]/40 flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-[#0A84FF] transition-colors">
              Создать новое судебное дело
            </h3>
            <p className="text-xs text-[#8E8E93] mt-1 max-w-[220px]">
              Выбор 1-й Окружной, 2-й Апелляционной или 3-й Верховной инстанции
            </p>
          </div>

          {/* Case Cards */}
          {filteredCases.map((c) => {
            const isActive = c.id === activeCaseId;
            const badge = getInstanceBadge(c.instance);
            const totalNodes = countNodes(c.root);

            return (
              <div
                key={c.id}
                onClick={() => switchCase(c.id)}
                className={`p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between group cursor-pointer shadow-apple-card hover:shadow-apple-hover ${
                  isActive
                    ? 'bg-white/[0.08] border-[#0A84FF] ring-1 ring-[#0A84FF]/50'
                    : 'bg-[#1c1c1e]/90 hover:bg-[#252528] border-white/[0.1] hover:border-white/[0.2]'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Row: Instance Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-lg border ${badge.style}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(c.status)}
                      {isActive && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-[#30D158] bg-[#30D158]/15 px-2 py-0.5 rounded-lg border border-[#30D158]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Текущее
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Case Number */}
                  <div>
                    <h3 className="text-[14.5px] font-semibold text-white group-hover:text-[#0A84FF] transition-colors leading-snug tracking-tight">
                      {c.title}
                    </h3>
                    {c.caseNumber && (
                      <span className="text-xs font-mono text-[#8E8E93] block mt-0.5">
                        Дело № {c.caseNumber}
                      </span>
                    )}
                  </div>

                  {/* Court and Judge */}
                  <div className="text-xs text-[#8E8E93] space-y-0.5">
                    <div className="truncate text-[#EBEBF5]">{c.courtName}</div>
                    {c.judge && <div className="text-[11px] text-[#8E8E93]">{c.judge}</div>}
                  </div>

                  {/* Stats Counter */}
                  <div className="flex items-center gap-3 pt-2 text-[11px] text-[#8E8E93] border-t border-white/[0.06]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#0A84FF]" />
                      <span>{totalNodes} блоков на схеме</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Primary Enter Case Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        switchCase(c.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold apple-btn-primary transition-all cursor-pointer"
                    >
                      <span>Открыть карту</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Instance Promotion Buttons */}
                    {c.instance === 'district' && (
                      <button
                        onClick={(e) => handlePromote(c, e)}
                        title="Передать материалы в Апелляционную инстанцию"
                        className="flex items-center gap-1 text-[11px] font-medium text-[#E0B0FF] hover:text-white bg-[#BF5AF2]/15 hover:bg-[#BF5AF2]/30 px-2.5 py-1.5 rounded-xl border border-[#BF5AF2]/30 transition-all cursor-pointer"
                      >
                        <ArrowUpRight className="w-3 h-3 text-[#BF5AF2]" />
                        <span>В Апелляцию</span>
                      </button>
                    )}

                    {c.instance === 'appellate' && (
                      <button
                        onClick={(e) => handlePromote(c, e)}
                        title="Передать материалы в Верховную инстанцию"
                        className="flex items-center gap-1 text-[11px] font-medium text-[#30D158] hover:text-white bg-[#30D158]/15 hover:bg-[#30D158]/30 px-2.5 py-1.5 rounded-xl border border-[#30D158]/30 transition-all cursor-pointer"
                      >
                        <ArrowUpRight className="w-3 h-3 text-[#30D158]" />
                        <span>В Верховный Суд</span>
                      </button>
                    )}
                  </div>

                  {/* Duplicate and Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateCase(c.id);
                      }}
                      title="Дублировать дело"
                      className="p-1.5 text-[#8E8E93] hover:text-white hover:bg-white/[0.1] rounded-xl transition-all active:scale-[0.9] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {cases.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(c, e)}
                        title="Удалить дело"
                        className="p-1.5 text-[#8E8E93] hover:text-[#FF453A] hover:bg-[#FF453A]/15 rounded-xl transition-all active:scale-[0.9] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Templates Chooser Section (Pages/Keynote Style) */}
        <section className="pt-6 border-t border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Готовые процессуальные шаблоны
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Создайте новое дело по типовой категории спора в один клик
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CASE_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => loadTemplate(tmpl.id)}
                className="p-4.5 apple-card hover:border-[#0A84FF]/50 transition-all duration-150 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-mono text-[#8E8E93] bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.08]">
                      {tmpl.category}
                    </span>
                    <Sparkles className="w-4 h-4 text-[#0A84FF] group-hover:scale-110 transition-transform" />
                  </div>

                  <h3 className="text-xs font-semibold text-white group-hover:text-[#0A84FF] transition-colors">
                    {tmpl.name}
                  </h3>

                  <p className="text-[11px] text-[#8E8E93] leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#0A84FF] font-medium">
                  <span>Создать из шаблона</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
