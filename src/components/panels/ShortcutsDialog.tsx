import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { Kbd } from '../ui/Kbd';

interface ShortcutGroup {
  title: string;
  items: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Построение и редактирование',
    items: [
      { keys: ['Tab'], description: 'Создать дочерний узел и начать ввод' },
      { keys: ['Enter'], description: 'Создать соседний узел на том же уровне' },
      { keys: ['F2'], description: 'Редактировать текст выбранного узла' },
      { keys: ['Del', 'Backspace'], description: 'Удалить узел со всем поддеревом' },
      { keys: ['[', ']'], description: 'Свернуть или развернуть ветку' },
    ],
  },
  {
    title: 'Навигация по иерархии (Keyboard-First)',
    items: [
      { keys: ['←'], description: 'Перейти к родительскому узлу' },
      { keys: ['→'], description: 'Перейти к дочернему узлу' },
      { keys: ['↑', '↓'], description: 'Переход между соседними узлами' },
      { keys: ['Esc'], description: 'Снять выделение / отменить редактирование' },
    ],
  },
  {
    title: 'Холст и общие команды',
    items: [
      { keys: ['Space', '+', 'Drag'], description: 'Панорамирование холста' },
      { keys: ['Wheel'], description: 'Плавный зум в точку курсора' },
      { keys: ['⌘', 'Z'], description: 'Отмена последнего действия (Undo)' },
      { keys: ['⌘', '⇧', 'Z'], description: 'Повтор отмененного действия (Redo)' },
      { keys: ['⌘', 'F'], description: 'Быстрый поиск по заголовкам и заметкам' },
      { keys: ['⌘', 'B'], description: 'Открыть/скрыть боковую панель свойств' },
    ],
  },
];

export const ShortcutsDialog: React.FC = () => {
  const { isShortcutsOpen, setShortcutsOpen } = useMindMapStore();

  if (!isShortcutsOpen) return null;

  return (
    <div
      onClick={() => setShortcutsOpen(false)}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-floating overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span>Горячие клавиши (Keyboard-First)</span>
          </div>
          <button
            onClick={() => setShortcutsOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                {group.title}
              </h3>
              <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl divide-y divide-zinc-850/80 overflow-hidden">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between px-4 py-2.5 text-xs text-zinc-300"
                  >
                    <span>{item.description}</span>
                    <div className="flex items-center gap-1">
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
        <div className="px-6 py-3 border-t border-zinc-850 bg-zinc-900/30 text-[11px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Интерфейс оптимизирован для быстрой работы без мыши
          </span>
          <span className="font-mono">Esc для закрытия</span>
        </div>
      </div>
    </div>
  );
};
