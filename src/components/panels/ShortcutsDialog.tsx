import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { Kbd } from '../ui/Kbd';

interface ShortcutGroup {
  title: string;
  items: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Навигация и управление',
    items: [
      { keys: ['Tab'], description: 'Создать дочерний блок и начать ввод' },
      { keys: ['Enter'], description: 'Создать соседний блок (на том же уровне)' },
      { keys: ['F2'], description: 'Редактировать название выбранного блока' },
      { keys: ['Del', 'Backspace'], description: 'Удалить выбранный блок со всеми дочерними' },
      { keys: ['Esc'], description: 'Снять выбор / закрыть модальное окно' },
    ],
  },
  {
    title: 'Стрелки клавиатуры',
    items: [
      { keys: ['→'], description: 'Перейти к первому дочернему блоку' },
      { keys: ['←'], description: 'Перейти к родительскому блоку' },
      { keys: ['↓'], description: 'Перейти к следующему соседнему блоку' },
      { keys: ['↑'], description: 'Перейти к предыдущему соседнему блоку' },
      { keys: ['Space', '[', ']'], description: 'Свернуть / развернуть ветку' },
    ],
  },
  {
    title: 'Глобальные горячие клавиши',
    items: [
      { keys: ['⌘', 'Z'], description: 'Отменить действие (Undo)' },
      { keys: ['⌘', '⇧', 'Z'], description: 'Повторить действие (Redo)' },
      { keys: ['⌘', 'F'], description: 'Поиск по тезисам, нормам права и фактам' },
      { keys: ['⌘', 'B'], description: 'Показать / скрыть боковой инспектор' },
      { keys: ['Пробел + Drag'], description: 'Панорамирование холста мышью' },
    ],
  },
];

export const ShortcutsDialog: React.FC = () => {
  const { isShortcutsOpen, setShortcutsOpen } = useMindMapStore();

  if (!isShortcutsOpen) return null;

  return (
    <div
      onClick={() => setShortcutsOpen(false)}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl apple-glass-card rounded-3xl shadow-apple-modal border border-white/[0.12] overflow-hidden animate-apple-scale-in flex flex-col text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/[0.06] border border-white/[0.08] text-white rounded-2xl shadow-sm">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Горячие клавиши и управление
              </h2>
              <p className="text-xs text-zinc-400">
                Быстрое проектирование судебной стратегии без отрыва рук от клавиатуры
              </p>
            </div>
          </div>

          <button
            onClick={() => setShortcutsOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all active:scale-[0.92] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                {group.title}
              </h3>

              <div className="space-y-1.5 bg-white/[0.03] border border-white/[0.06] p-3 rounded-2xl">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between py-1.5 px-2 hover:bg-white/[0.04] rounded-xl transition-colors text-xs"
                  >
                    <span className="text-zinc-300 font-sans">{item.description}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <Kbd key={kIdx}>{k}</Kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.02] text-xs text-zinc-400 flex items-center justify-between">
          <span>На Mac используется ⌘ (Cmd), на Windows / Linux — Ctrl</span>
          <button
            onClick={() => setShortcutsOpen(false)}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
