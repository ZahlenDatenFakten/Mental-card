import React, { useState, useMemo } from 'react';
import {
  X,
  Briefcase,
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
      case 'first_instance':
        return {
          label: '1-я Инстанция',
          icon: <Building2 className="w-3.5 h-3.5 text-sky-400" />,
          style: 'bg-sky-950/60 border-sky-800/80 text-sky-300',
        };
      case 'appellate':
        return {
          label: 'Апелляция',
          icon: <Scale className="w-3.5 h-3.5 text-violet-400" />,
          style: 'bg-violet-950/60 border-violet-800/80 text-violet-300',
        };
      case 'cassation':
        return {
          label: 'Окружная / Кассация',
          icon: <Briefcase className="w-3.5 h-3.5 text-amber-400" />,
          style: 'bg-amber-950/60 border-amber-800/80 text-amber-300',
        };
      case 'supreme':
        return {
          label: 'Верховный Суд РФ',
          icon: <Crown className="w-3.5 h-3.5 text-emerald-400" />,
          style: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300',
        };
    }
  };

  const getStatusBadge = (status: CaseItem['status']) => {
    switch (status) {
      case 'won':
        return <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded">Удовлетворено</span>;
      case 'lost':
        return <span className="text-[11px] font-mono text-rose-400 bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 rounded">Отказано</span>;
      case 'appeal_pending':
        return <span className="text-[11px] font-mono text-amber-400 bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded">На обжаловании</span>;
      case 'settled':
        return <span className="text-[11px] font-mono text-sky-400 bg-sky-950/70 border border-sky-800/80 px-2 py-0.5 rounded">Мировое</span>;
      default:
        return <span className="text-[11px] font-mono text-zinc-300 bg-zinc-850 border border-zinc-700 px-2 py-0.5 rounded">В производстве</span>;
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
    if (c.instance === 'first_instance') targetInst = 'appellate';
    else if (c.instance === 'appellate') targetInst = 'cassation';
    else if (c.instance === 'cassation') targetInst = 'supreme';
    else return;

    promoteToNextInstance(c.id, targetInst);
    setPortfolioOpen(false);
  };

  return (
    <div
      onClick={() => setPortfolioOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in flex flex-col text-zinc-100 max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/60 border border-sky-800/80 text-sky-400 rounded-lg">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Портфель судебных дел и инстанций
              </h2>
              <p className="text-xs text-zinc-400">
                Ведение нескольких процессов параллельно: 1-я инстанция, Апелляция, Окружные суды, Верховный Суд
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPortfolioOpen(false);
                setNewCaseOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Новое дело</span>
            </button>

            <button
              onClick={() => setPortfolioOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search and Instance Tabs */}
        <div className="px-6 py-3 border-b border-zinc-850 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по делам, судам, судьям..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-zinc-100 pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none transition-colors"
            />
          </div>

          {/* Instance Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedInstance('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedInstance === 'all'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              Все инстанции ({cases.length})
            </button>
            <button
              onClick={() => setSelectedInstance('first_instance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedInstance === 'first_instance'
                  ? 'bg-sky-950 text-sky-300 border border-sky-800'
                  : 'text-zinc-400 hover:text-sky-300 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              1-я инстанция
            </button>
            <button
              onClick={() => setSelectedInstance('appellate')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedInstance === 'appellate'
                  ? 'bg-violet-950 text-violet-300 border border-violet-800'
                  : 'text-zinc-400 hover:text-violet-300 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              Апелляция
            </button>
            <button
              onClick={() => setSelectedInstance('cassation')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedInstance === 'cassation'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              Окружная (Кассация)
            </button>
            <button
              onClick={() => setSelectedInstance('supreme')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedInstance === 'supreme'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-zinc-400 hover:text-emerald-300 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              Верховный Суд РФ
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
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between group cursor-pointer shadow-sm ${
                    isActive
                      ? 'bg-zinc-900/90 border-emerald-500/80 ring-1 ring-emerald-500/30'
                      : 'bg-zinc-900/50 hover:bg-zinc-850/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Instance Badge & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${badge.style}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(c.status)}
                        {isActive && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Активно
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors leading-snug">
                        {c.title}
                      </h3>
                      {c.caseNumber && (
                        <span className="text-xs font-mono text-zinc-400 block mt-0.5">
                          Дело № {c.caseNumber}
                        </span>
                      )}
                    </div>

                    {/* Court and Judge */}
                    <div className="text-xs text-zinc-400 space-y-0.5">
                      <div className="truncate font-sans">{c.courtName}</div>
                      {c.judge && <div className="text-zinc-500 text-[11px]">{c.judge}</div>}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                    {/* Promote to Next Instance Button */}
                    {c.instance !== 'supreme' ? (
                      <button
                        onClick={(e) => handlePromote(c, e)}
                        title="Передать материалы и позицию в следующую инстанцию"
                        className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800/60 transition-colors cursor-pointer"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>
                          В {c.instance === 'first_instance' ? 'Апелляцию' : 'Кассацию (Округ)'}
                        </span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-500/80 font-mono">
                        Высшая инстанция (ВС РФ)
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
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {cases.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(c, e)}
                          title="Удалить дело"
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
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
        <div className="px-6 py-3 border-t border-zinc-850 bg-zinc-900/40 text-xs text-zinc-500 flex items-center justify-between">
          <span>Всего дел в портфеле: {cases.length}</span>
          <span className="font-mono">Данные сохраняются локально в вашем браузере</span>
        </div>
      </div>
    </div>
  );
};
