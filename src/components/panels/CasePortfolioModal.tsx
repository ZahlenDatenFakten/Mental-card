import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  Scale,
  Crown,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Copy,
  ArrowUpRight,
  FolderKanban,
  Briefcase,
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { JudicialInstance, CaseItem } from '../../types/mindmap';

export const CasePortfolioModal: React.FC = () => {
  const {
    isPortfolioOpen,
    setPortfolioOpen,
    cases,
    activeCaseId,
    switchCase,
    deleteCase,
    duplicateCase,
    promoteToNextInstance,
    setNewCaseOpen,
    openConfirmDialog,
  } = useMindMapStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<JudicialInstance | 'all'>('all');

  if (!isPortfolioOpen) return null;

  const getInstanceBadge = (inst: JudicialInstance) => {
    switch (inst) {
      case 'district':
        return {
          label: '1. Окружная инстанция',
          short: 'Окружной суд',
          icon: <Building2 className="w-3.5 h-3.5 text-sky-400" />,
          style: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
        };
      case 'appellate':
        return {
          label: '2. Апелляционная инстанция',
          short: 'Апелляционный суд',
          icon: <Scale className="w-3.5 h-3.5 text-purple-400" />,
          style: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
        };
      case 'supreme':
        return {
          label: '3. Верховная инстанция',
          short: 'Верховный Суд',
          icon: <Crown className="w-3.5 h-3.5 text-emerald-400" />,
          style: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
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
        return <span className="text-[11px] font-mono text-zinc-300 bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 rounded-lg">В производстве</span>;
    }
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
      message: `Вы действительно хотите удалить дело «${c.title}»? Это действие нельзя будет отменить.`,
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
    setPortfolioOpen(false);
  };

  return (
    <div
      onClick={() => setPortfolioOpen(false)}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100 max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-2xl shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Портфель судебных дел и инстанций
              </h2>
              <p className="text-xs text-zinc-400">
                1) Окружная инстанция → 2) Апелляционная инстанция → 3) Верховная инстанция
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setPortfolioOpen(false);
                setNewCaseOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold apple-emerald-btn rounded-xl transition-all active:scale-[0.95] cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Новое дело</span>
            </button>

            <button
              onClick={() => setPortfolioOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search and 3 Instance Tabs */}
        <div className="px-6 py-3 border-b border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по делам, судам, судьям..."
              className="w-full bg-black/40 border border-white/[0.08] focus:border-[#0A84FF] text-white pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none transition-all"
            />
          </div>

          {/* Instance Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedInstance('all')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                selectedInstance === 'all'
                  ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              Все инстанции ({cases.length})
            </button>
            <button
              onClick={() => setSelectedInstance('district')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                selectedInstance === 'district'
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-sky-300 hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              1. Окружная
            </button>
            <button
              onClick={() => setSelectedInstance('appellate')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                selectedInstance === 'appellate'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-purple-300 hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              2. Апелляционная
            </button>
            <button
              onClick={() => setSelectedInstance('supreme')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all active:scale-[0.96] cursor-pointer whitespace-nowrap ${
                selectedInstance === 'supreme'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-emerald-300 hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              3. Верховная
            </button>
          </div>
        </div>

        {/* Case Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {filteredCases.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 text-sm">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
              Дел не найдено. Создайте новое дело для начала работы.
            </div>
          ) : (
            filteredCases.map((c) => {
              const isActive = c.id === activeCaseId;
              const badge = getInstanceBadge(c.instance);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    switchCase(c.id);
                    setPortfolioOpen(false);
                  }}
                  className={`p-4.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between group cursor-pointer shadow-apple-card ${
                    isActive
                      ? 'bg-white/[0.08] border-[#0A84FF] ring-1 ring-[#0A84FF]/40 shadow-apple-active'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="space-y-3">
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
                            Активно
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#0A84FF] transition-colors leading-snug tracking-tight">
                        {c.title}
                      </h3>
                      {c.caseNumber && (
                        <span className="text-xs font-mono text-zinc-400 block mt-0.5">
                          Дело № {c.caseNumber}
                        </span>
                      )}
                    </div>

                    {/* Court and Judge */}
                    <div className="text-xs text-zinc-400 space-y-0.5 font-sans">
                      <div className="truncate">{c.courtName}</div>
                      {c.judge && <div className="text-zinc-500 text-[11px]">{c.judge}</div>}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    {/* Promote to Next Instance Button */}
                    {c.instance === 'district' && (
                      <button
                        onClick={(e) => handlePromote(c, e)}
                        title="Передать материалы в Апелляционную инстанцию"
                        className="flex items-center gap-1.5 text-[11px] font-medium text-purple-300 hover:text-white bg-purple-500/15 hover:bg-purple-500/30 px-3 py-1.5 rounded-xl border border-purple-500/30 transition-all active:scale-[0.95] cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                        <span>В Апелляционную инстанцию →</span>
                      </button>
                    )}

                    {c.instance === 'appellate' && (
                      <button
                        onClick={(e) => handlePromote(c, e)}
                        title="Передать материалы в Верховную инстанцию"
                        className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/30 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-all active:scale-[0.95] cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        <span>В Верховную инстанцию →</span>
                      </button>
                    )}

                    {c.instance === 'supreme' && (
                      <span className="text-[11px] text-[#30D158] font-mono flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Последняя инстанция</span>
                      </span>
                    )}

                    {/* Duplicate and Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateCase(c.id);
                        }}
                        title="Дублировать дело"
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.9] cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {cases.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(c, e)}
                          title="Удалить дело"
                          className="p-1.5 text-zinc-500 hover:text-[#FF453A] hover:bg-[#FF453A]/15 rounded-xl transition-all active:scale-[0.9] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 flex items-center justify-between">
          <span>Всего дел в портфеле: {cases.length}</span>
          <span className="font-mono text-zinc-500">1) Окружная → 2) Апелляционная → 3) Верховная</span>
        </div>
      </div>
    </div>
  );
};
