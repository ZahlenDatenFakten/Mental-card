import { create } from 'zustand';
import {
  MindNode,
  NodeId,
  LegalNodeType,
  CaseItem,
  JudicialInstance,
  CaseStatus,
  ToastMessage,
  ConfirmDialogConfig,
} from '../types/mindmap';
import { INITIAL_CASES, INITIAL_MIND_MAP, CASE_TEMPLATES } from '../lib/sample-data';
import { loadSharedCaseFromUrl } from '../lib/share-utils';
import { parseMarkdownToTree } from '../lib/markdown-parser';
import { resetTreeLayoutCoordinates, calculateTreeLayout } from '../lib/tree-layout';

const STORAGE_CASES_KEY = 'legal_mindmap_cases_v3';
const STORAGE_ACTIVE_KEY = 'legal_mindmap_active_case_id_v3';

interface MindMapState {
  // Multi-case portfolio state
  cases: CaseItem[];
  activeCaseId: string;

  // Active tree state
  root: MindNode;
  selectedId: NodeId | null;
  editingId: NodeId | null;

  // History for active case
  history: MindNode[];
  historyIndex: number;

  // Filter state
  filterNodeType: LegalNodeType | 'all';
  setFilterNodeType: (type: LegalNodeType | 'all') => void;

  // UI Panels and Modals
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  isExportImportOpen: boolean;
  isShortcutsOpen: boolean;
  isTimelineOpen: boolean;
  isCourtDocOpen: boolean;
  isShareOpen: boolean;
  isTemplatesOpen: boolean;
  isPortfolioOpen: boolean;
  isNewCaseOpen: boolean;

  // Dialog & Toast State
  toasts: ToastMessage[];
  confirmDialog: ConfirmDialogConfig;

  // Actions for Case Management
  createCase: (params: {
    title: string;
    instance: JudicialInstance;
    courtName: string;
    judge?: string;
    caseNumber?: string;
    status?: CaseStatus;
    templateId?: string;
    description?: string;
  }) => void;
  switchCase: (caseId: string) => void;
  updateCaseMetadata: (caseId: string, updates: Partial<Omit<CaseItem, 'id' | 'root'>>) => void;
  duplicateCase: (caseId: string) => void;
  deleteCase: (caseId: string) => void;
  promoteToNextInstance: (caseId: string, nextInstance: JudicialInstance) => void;

  // Active Tree Node Actions
  selectNode: (id: NodeId | null) => void;
  startEditing: (id: NodeId) => void;
  stopEditing: () => void;
  updateNode: (id: NodeId, updates: Partial<MindNode>) => void;
  setNodePosition: (id: NodeId, x: number, y: number) => void;
  moveBranchPosition: (id: NodeId, deltaX: number, deltaY: number) => void;
  resetTreeAutoLayout: () => void;
  addChildNode: (parentId: NodeId, title?: string, nodeType?: LegalNodeType) => void;
  addSiblingNode: (siblingId: NodeId, title?: string, nodeType?: LegalNodeType) => void;
  deleteNode: (id: NodeId) => void;
  duplicateNode: (id: NodeId) => void;
  moveNode: (draggedId: NodeId, targetParentId: NodeId) => void;
  toggleCollapse: (id: NodeId) => void;
  collapseAll: () => void;
  expandAll: () => void;
  loadTemplate: (templateId: string) => void;
  importFromMarkdown: (markdown: string) => void;
  importFromJson: (jsonStr: string) => boolean;
  resetToDefault: () => void;
  setRoot: (newRoot: MindNode) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // UI Dialog/Toast actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  openConfirmDialog: (config: Omit<ConfirmDialogConfig, 'isOpen'>) => void;
  closeConfirmDialog: () => void;

  // Modal Toggles
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setExportImportOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setTimelineOpen: (open: boolean) => void;
  setCourtDocOpen: (open: boolean) => void;
  setShareOpen: (open: boolean) => void;
  setTemplatesOpen: (open: boolean) => void;
  setPortfolioOpen: (open: boolean) => void;
  setNewCaseOpen: (open: boolean) => void;
}

// Generate unique id
const uid = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
const caseUid = () => `case-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
const toastUid = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

// Load initial cases from storage or default
function getInitialCases(): { cases: CaseItem[]; activeId: string; root: MindNode } {
  // Check if URL has a shared case
  const sharedCase = loadSharedCaseFromUrl();
  if (sharedCase) {
    const newCase: CaseItem = {
      id: caseUid(),
      title: sharedCase.title || 'Импортированное дело из ссылки',
      instance: 'district',
      courtName: 'Окружной суд (1-я инстанция)',
      status: 'in_progress',
      root: sharedCase,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return {
      cases: [newCase, ...INITIAL_CASES],
      activeId: newCase.id,
      root: sharedCase,
    };
  }

  try {
    const rawCases = localStorage.getItem(STORAGE_CASES_KEY);
    const activeId = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (rawCases) {
      const parsed: CaseItem[] = JSON.parse(rawCases);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const found = parsed.find((c) => c.id === activeId) || parsed[0];
        return {
          cases: parsed,
          activeId: found.id,
          root: found.root,
        };
      }
    }
  } catch {
    // ignore storage error
  }

  return {
    cases: INITIAL_CASES,
    activeId: INITIAL_CASES[0].id,
    root: INITIAL_CASES[0].root,
  };
}

const initialData = getInitialCases();

// Helper to deep clone node tree
function cloneTree(node: MindNode): MindNode {
  return {
    ...node,
    children: node.children ? node.children.map(cloneTree) : undefined,
  };
}

// Helper to recursively update a node in tree
function updateInTree(node: MindNode, id: NodeId, updates: Partial<MindNode>): MindNode {
  if (node.id === id) {
    return { ...node, ...updates, updatedAt: Date.now() };
  }
  if (!node.children) return node;
  return {
    ...node,
    children: node.children.map((child) => updateInTree(child, id, updates)),
  };
}

// Helper to recursively add a child to a node
function addChildInTree(node: MindNode, parentId: NodeId, newNode: MindNode): MindNode {
  if (node.id === parentId) {
    const children = node.children ? [...node.children, newNode] : [newNode];
    return {
      ...node,
      children,
      isCollapsed: false,
      updatedAt: Date.now(),
    };
  }
  if (!node.children) return node;
  return {
    ...node,
    children: node.children.map((child) => addChildInTree(child, parentId, newNode)),
  };
}

// Helper to recursively add a sibling
function addSiblingInTree(node: MindNode, siblingId: NodeId, newNode: MindNode): MindNode {
  if (!node.children) return node;
  const index = node.children.findIndex((c) => c.id === siblingId);
  if (index !== -1) {
    const newChildren = [...node.children];
    newChildren.splice(index + 1, 0, newNode);
    return {
      ...node,
      children: newChildren,
      updatedAt: Date.now(),
    };
  }
  return {
    ...node,
    children: node.children.map((child) => addSiblingInTree(child, siblingId, newNode)),
  };
}

// Helper to remove node and return new tree
function deleteFromTree(node: MindNode, idToDelete: NodeId): MindNode | null {
  if (node.id === idToDelete) return null;
  if (!node.children) return node;
  const filtered = node.children
    .map((c) => deleteFromTree(c, idToDelete))
    .filter(Boolean) as MindNode[];
  return {
    ...node,
    children: filtered,
    updatedAt: Date.now(),
  };
}

// Helper to find node in tree
function findNode(node: MindNode, id: NodeId): MindNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const res = findNode(child, id);
      if (res) return res;
    }
  }
  return null;
}

// Save helper to persist cases to localStorage
function saveCasesToStorage(cases: CaseItem[], activeId: string) {
  try {
    localStorage.setItem(STORAGE_CASES_KEY, JSON.stringify(cases));
    localStorage.setItem(STORAGE_ACTIVE_KEY, activeId);
  } catch {
    // ignore quota errors
  }
}

export const useMindMapStore = create<MindMapState>((set, get) => ({
  cases: initialData.cases,
  activeCaseId: initialData.activeId,
  root: initialData.root,
  selectedId: initialData.root.id,
  editingId: null,
  history: [initialData.root],
  historyIndex: 0,
  filterNodeType: 'all',

  isSidebarOpen: true,
  isSearchOpen: false,
  isExportImportOpen: false,
  isShortcutsOpen: false,
  isTimelineOpen: false,
  isCourtDocOpen: false,
  isShareOpen: false,
  isTemplatesOpen: false,
  isPortfolioOpen: false,
  isNewCaseOpen: false,

  toasts: [],
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },

  setFilterNodeType: (filterNodeType) => set({ filterNodeType }),

  // Push new history step and sync to active case
  _pushHistory: (newRoot: MindNode) => {
    const { history, historyIndex, cases, activeCaseId } = get();
    const updatedHistory = [...history.slice(0, historyIndex + 1), newRoot];
    if (updatedHistory.length > 50) updatedHistory.shift();

    const updatedCases = cases.map((c) =>
      c.id === activeCaseId ? { ...c, root: newRoot, updatedAt: Date.now() } : c
    );

    saveCasesToStorage(updatedCases, activeCaseId);

    set({
      root: newRoot,
      history: updatedHistory,
      historyIndex: updatedHistory.length - 1,
      cases: updatedCases,
    });
  },

  // Case Management Actions
  createCase: ({ title, instance, courtName, judge, caseNumber, status, templateId, description }) => {
    let baseRoot: MindNode;
    const template = CASE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      baseRoot = cloneTree(template.data);
      baseRoot.title = title;
    } else {
      baseRoot = {
        id: 'root',
        title,
        nodeType: 'remedy',
        children: [],
      };
    }

    const newCase: CaseItem = {
      id: caseUid(),
      title,
      instance,
      courtName,
      judge,
      caseNumber,
      status: status || 'in_progress',
      description,
      root: baseRoot,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newCases = [newCase, ...get().cases];
    saveCasesToStorage(newCases, newCase.id);

    set({
      cases: newCases,
      activeCaseId: newCase.id,
      root: baseRoot,
      selectedId: baseRoot.id,
      editingId: null,
      history: [baseRoot],
      historyIndex: 0,
    });

    get().addToast({
      type: 'success',
      title: 'Дело успешно создано',
      message: `Дело «${title}» добавлено в портфель.`,
    });
  },

  switchCase: (caseId) => {
    const found = get().cases.find((c) => c.id === caseId);
    if (!found) return;

    saveCasesToStorage(get().cases, caseId);

    set({
      activeCaseId: caseId,
      root: found.root,
      selectedId: found.root.id,
      editingId: null,
      history: [found.root],
      historyIndex: 0,
    });

    get().addToast({
      type: 'info',
      title: 'Дело открыто',
      message: `Переключено на «${found.title}».`,
    });
  },

  updateCaseMetadata: (caseId, updates) => {
    const updated = get().cases.map((c) => (c.id === caseId ? { ...c, ...updates, updatedAt: Date.now() } : c));
    saveCasesToStorage(updated, get().activeCaseId);
    set({ cases: updated });
    get().addToast({
      type: 'success',
      title: 'Свойства дела сохранены',
    });
  },

  duplicateCase: (caseId) => {
    const found = get().cases.find((c) => c.id === caseId);
    if (!found) return;

    const cloned: CaseItem = {
      ...found,
      id: caseUid(),
      title: `Копия — ${found.title}`,
      root: cloneTree(found.root),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [cloned, ...get().cases];
    saveCasesToStorage(updated, get().activeCaseId);
    set({ cases: updated });

    get().addToast({
      type: 'success',
      title: 'Дело продублировано',
      message: `Создана копия «${cloned.title}».`,
    });
  },

  deleteCase: (caseId) => {
    const { cases, activeCaseId } = get();
    if (cases.length <= 1) {
      get().addToast({
        type: 'warning',
        title: 'Нельзя удалить последнее дело',
        message: 'В портфеле должно оставаться как минимум одно дело.',
      });
      return;
    }

    const filtered = cases.filter((c) => c.id !== caseId);
    const newActiveId = activeCaseId === caseId ? filtered[0].id : activeCaseId;
    const newActiveCase = filtered.find((c) => c.id === newActiveId) || filtered[0];

    saveCasesToStorage(filtered, newActiveCase.id);

    set({
      cases: filtered,
      activeCaseId: newActiveCase.id,
      root: newActiveCase.root,
      selectedId: newActiveCase.root.id,
      history: [newActiveCase.root],
      historyIndex: 0,
    });

    get().addToast({
      type: 'success',
      title: 'Дело удалено',
      message: 'Дело успешно удалено из портфеля.',
    });
  },

  promoteToNextInstance: (caseId, nextInstance) => {
    const found = get().cases.find((c) => c.id === caseId);
    if (!found) return;

    let nextCourt = 'Апелляционный суд (2-я инстанция)';
    let instanceLabel = '2. Апелляционная инстанция';
    let instanceBranchTitle = 'Основания апелляционной жалобы';

    if (nextInstance === 'appellate') {
      nextCourt = 'Апелляционный суд (2-я инстанция)';
      instanceLabel = '2. Апелляционная инстанция';
      instanceBranchTitle = 'Основания апелляционной жалобы (2-я инстанция)';
    } else if (nextInstance === 'supreme') {
      nextCourt = 'Верховный Суд (Высшая инстанция)';
      instanceLabel = '3. Верховная инстанция';
      instanceBranchTitle = 'Основания жалобы в Верховную инстанцию (последняя)';
    }

    const clonedRoot = cloneTree(found.root);
    const instanceBranch: MindNode = {
      id: uid(),
      title: instanceBranchTitle,
      nodeType: 'thesis',
      color: '#f43f5e',
      priority: 'high',
      notes: `Правовая позиция для рассмотрения в: ${instanceLabel}`,
      children: [
        {
          id: uid(),
          title: 'Существенные нарушения, допущенные нижестоящим судом',
          nodeType: 'thesis',
          strengthScore: 5,
        },
      ],
    };

    clonedRoot.children = clonedRoot.children ? [instanceBranch, ...clonedRoot.children] : [instanceBranch];

    const newCase: CaseItem = {
      id: caseUid(),
      title: `${instanceLabel}: ${found.title}`,
      instance: nextInstance,
      courtName: nextCourt,
      status: 'appeal_pending',
      root: clonedRoot,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newCases = [newCase, ...get().cases];
    saveCasesToStorage(newCases, newCase.id);

    set({
      cases: newCases,
      activeCaseId: newCase.id,
      root: clonedRoot,
      selectedId: clonedRoot.id,
      history: [clonedRoot],
      historyIndex: 0,
    });

    get().addToast({
      type: 'success',
      title: `Дело передано в: ${instanceLabel}`,
      message: `Создано новое производство в суде «${nextCourt}».`,
    });
  },

  // Active Tree Node Actions
  selectNode: (id) => set({ selectedId: id }),
  startEditing: (id) => set({ editingId: id }),
  stopEditing: () => set({ editingId: null }),

  updateNode: (id, updates) => {
    const newRoot = updateInTree(get().root, id, updates);
    (get() as any)._pushHistory(newRoot);
  },

  setNodePosition: (id, x, y) => {
    const newRoot = updateInTree(get().root, id, {
      customX: Math.round(x),
      customY: Math.round(y),
    });
    (get() as any)._pushHistory(newRoot);
  },

  moveBranchPosition: (id, deltaX, deltaY) => {
    const currentLayout = calculateTreeLayout(get().root);

    function shiftNodeAndSubtree(node: MindNode): MindNode {
      const layoutPos = currentLayout.nodeMap.get(node.id);
      const curX = node.customX ?? layoutPos?.x ?? 0;
      const curY = node.customY ?? layoutPos?.y ?? 0;
      return {
        ...node,
        customX: Math.round(curX + deltaX),
        customY: Math.round(curY + deltaY),
        children: node.children ? node.children.map(shiftNodeAndSubtree) : undefined,
      };
    }

    function applyBranchShift(node: MindNode): MindNode {
      if (node.id === id) {
        return shiftNodeAndSubtree(node);
      }
      if (!node.children) return node;
      return {
        ...node,
        children: node.children.map(applyBranchShift),
      };
    }

    const newRoot = applyBranchShift(get().root);
    (get() as any)._pushHistory(newRoot);
  },

  resetTreeAutoLayout: () => {
    const newRoot = resetTreeLayoutCoordinates(get().root);
    (get() as any)._pushHistory(newRoot);
    get().addToast({
      type: 'info',
      title: 'Схема выровнена',
      message: 'Все блоки автоматически структурированы в дерево.',
    });
  },

  addChildNode: (parentId, title = 'Новый блок', nodeType = 'general') => {
    const parentNode = findNode(get().root, parentId);
    const newNode: MindNode = {
      id: uid(),
      title,
      nodeType,
      color: parentNode?.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newRoot = addChildInTree(get().root, parentId, newNode);
    (get() as any)._pushHistory(newRoot);
    set({ selectedId: newNode.id, editingId: newNode.id });
    get().addToast({
      type: 'info',
      title: 'Блок добавлен',
      message: `Создан блок «${title}».`,
      duration: 2000,
    });
  },

  addSiblingNode: (siblingId, title = 'Новый блок', nodeType = 'general') => {
    if (siblingId === get().root.id) {
      get().addChildNode(siblingId, title, nodeType);
      return;
    }
    const siblingNode = findNode(get().root, siblingId);
    const newNode: MindNode = {
      id: uid(),
      title,
      nodeType: nodeType || siblingNode?.nodeType || 'general',
      color: siblingNode?.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newRoot = addSiblingInTree(get().root, siblingId, newNode);
    (get() as any)._pushHistory(newRoot);
    set({ selectedId: newNode.id, editingId: newNode.id });
  },

  deleteNode: (id) => {
    if (id === get().root.id) {
      get().addToast({
        type: 'warning',
        title: 'Нельзя удалить корневой блок дела',
      });
      return;
    }
    const targetNode = findNode(get().root, id);
    const newRoot = deleteFromTree(get().root, id);
    if (newRoot) {
      (get() as any)._pushHistory(newRoot);
      set({ selectedId: get().root.id });
      get().addToast({
        type: 'info',
        title: 'Блок удален',
        message: targetNode ? `Ветка «${targetNode.title}» удалена.` : undefined,
      });
    }
  },

  duplicateNode: (id) => {
    const node = findNode(get().root, id);
    if (!node || id === get().root.id) return;

    function cloneWithNewIds(n: MindNode): MindNode {
      return {
        ...n,
        id: uid(),
        title: n.id === id ? `${n.title} (Копия)` : n.title,
        customX: n.customX !== undefined ? n.customX + 40 : undefined,
        customY: n.customY !== undefined ? n.customY + 40 : undefined,
        children: n.children ? n.children.map(cloneWithNewIds) : undefined,
      };
    }

    const cloned = cloneWithNewIds(node);
    const newRoot = addSiblingInTree(get().root, id, cloned);
    (get() as any)._pushHistory(newRoot);
    set({ selectedId: cloned.id });
    get().addToast({
      type: 'success',
      title: 'Ветка продублирована',
    });
  },

  moveNode: (draggedId, targetParentId) => {
    if (draggedId === targetParentId || draggedId === get().root.id) return;

    const nodeToMove = findNode(get().root, draggedId);
    if (!nodeToMove) return;

    // Remove from old position
    const treeWithoutNode = deleteFromTree(get().root, draggedId);
    if (!treeWithoutNode) return;

    // Add to target parent
    const newRoot = addChildInTree(treeWithoutNode, targetParentId, nodeToMove);
    (get() as any)._pushHistory(newRoot);
    set({ selectedId: draggedId });
    get().addToast({
      type: 'info',
      title: 'Блок перемещен',
    });
  },

  toggleCollapse: (id) => {
    const node = findNode(get().root, id);
    if (!node) return;
    const newRoot = updateInTree(get().root, id, { isCollapsed: !node.isCollapsed });
    (get() as any)._pushHistory(newRoot);
  },

  collapseAll: () => {
    function collapseSubtree(n: MindNode): MindNode {
      return {
        ...n,
        isCollapsed: n.id !== get().root.id,
        children: n.children ? n.children.map(collapseSubtree) : undefined,
      };
    }
    const newRoot = collapseSubtree(get().root);
    (get() as any)._pushHistory(newRoot);
  },

  expandAll: () => {
    function expandSubtree(n: MindNode): MindNode {
      return {
        ...n,
        isCollapsed: false,
        children: n.children ? n.children.map(expandSubtree) : undefined,
      };
    }
    const newRoot = expandSubtree(get().root);
    (get() as any)._pushHistory(newRoot);
  },

  loadTemplate: (templateId) => {
    const template = CASE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      const cloned = cloneTree(template.data);
      (get() as any)._pushHistory(cloned);
      set({ selectedId: cloned.id });
      get().setTemplatesOpen(false);
      get().addToast({
        type: 'success',
        title: 'Шаблон загружен',
        message: `Загружена структура «${template.name}».`,
      });
    }
  },

  importFromMarkdown: (markdown: string) => {
    try {
      const parsed = parseMarkdownToTree(markdown);
      (get() as any)._pushHistory(parsed);
      set({ selectedId: parsed.id });
      get().setExportImportOpen(false);
      get().addToast({
        type: 'success',
        title: 'Импорт завершен',
        message: 'Структура из Markdown успешно импортирована.',
      });
    } catch {
      get().addToast({
        type: 'error',
        title: 'Ошибка импорта',
        message: 'Не удалось разобрать Markdown файл.',
      });
    }
  },

  importFromJson: (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.id && parsed.title) {
        (get() as any)._pushHistory(parsed);
        set({ selectedId: parsed.id });
        get().setExportImportOpen(false);
        get().addToast({
          type: 'success',
          title: 'Импорт завершен',
          message: 'Структура из JSON успешно импортирована.',
        });
        return true;
      }
      return false;
    } catch {
      get().addToast({
        type: 'error',
        title: 'Ошибка импорта',
        message: 'Некорректный формат JSON файла.',
      });
      return false;
    }
  },

  resetToDefault: () => {
    (get() as any)._pushHistory(INITIAL_MIND_MAP);
    set({ selectedId: INITIAL_MIND_MAP.id });
    get().addToast({
      type: 'info',
      title: 'Схема сброшена',
      message: 'Загружена стандартная структура окружного дела.',
    });
  },

  setRoot: (newRoot) => {
    (get() as any)._pushHistory(newRoot);
    set({ selectedId: newRoot.id });
  },

  // Undo / Redo
  undo: () => {
    const { history, historyIndex, cases, activeCaseId } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newRoot = history[newIndex];
      const updatedCases = cases.map((c) =>
        c.id === activeCaseId ? { ...c, root: newRoot, updatedAt: Date.now() } : c
      );
      saveCasesToStorage(updatedCases, activeCaseId);
      set({
        root: newRoot,
        historyIndex: newIndex,
        selectedId: newRoot.id,
        cases: updatedCases,
      });
    }
  },

  redo: () => {
    const { history, historyIndex, cases, activeCaseId } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const newRoot = history[newIndex];
      const updatedCases = cases.map((c) =>
        c.id === activeCaseId ? { ...c, root: newRoot, updatedAt: Date.now() } : c
      );
      saveCasesToStorage(updatedCases, activeCaseId);
      set({
        root: newRoot,
        historyIndex: newIndex,
        selectedId: newRoot.id,
        cases: updatedCases,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Toast System
  addToast: (toast) => {
    const id = toastUid();
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 3500);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // In-app Confirm Dialog System
  openConfirmDialog: (config) => {
    set({ confirmDialog: { ...config, isOpen: true } });
  },

  closeConfirmDialog: () => {
    set((state) => ({ confirmDialog: { ...state.confirmDialog, isOpen: false } }));
  },

  // Modal Toggles
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setExportImportOpen: (isExportImportOpen) => set({ isExportImportOpen }),
  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
  setTimelineOpen: (isTimelineOpen) => set({ isTimelineOpen }),
  setCourtDocOpen: (isCourtDocOpen) => set({ isCourtDocOpen }),
  setShareOpen: (isShareOpen) => set({ isShareOpen }),
  setTemplatesOpen: (isTemplatesOpen) => set({ isTemplatesOpen }),
  setPortfolioOpen: (isPortfolioOpen) => set({ isPortfolioOpen }),
  setNewCaseOpen: (isNewCaseOpen) => set({ isNewCaseOpen }),
}));
