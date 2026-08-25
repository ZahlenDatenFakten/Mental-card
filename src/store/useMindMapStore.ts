import { create } from 'zustand';
import { MindNode, NodeId, LegalNodeType } from '../types/mindmap';
import { INITIAL_MIND_MAP, CASE_TEMPLATES } from '../lib/sample-data';
import { generateNodeId, parseMarkdownToTree } from '../lib/markdown-parser';
import { findParentInTree, findNodeInTree } from '../lib/tree-layout';
import { loadSharedCaseFromUrl } from '../lib/share-utils';

const LOCAL_STORAGE_KEY = 'legal_mental_map_tree_v2';
const MAX_HISTORY_STEPS = 50;

/**
 * Deep clones a MindNode tree with all legal properties.
 */
function cloneTree(node: MindNode): MindNode {
  return {
    ...node,
    tags: node.tags ? [...node.tags] : undefined,
    children: node.children ? node.children.map(cloneTree) : [],
  };
}

/**
 * Loads tree from shared URL or localStorage or INITIAL_MIND_MAP.
 */
function loadInitialTree(): MindNode {
  // 1. Check if a shared case is present in the URL
  const sharedCase = loadSharedCaseFromUrl();
  if (sharedCase) {
    return sharedCase;
  }

  // 2. Check localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.title) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load case from localStorage, using default', err);
  }

  // 3. Default starter case
  return INITIAL_MIND_MAP;
}

/**
 * Saves tree to localStorage.
 */
function persistTree(root: MindNode) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(root));
  } catch (err) {
    console.warn('Failed to persist case to localStorage', err);
  }
}

export interface MindMapStore {
  // Tree state
  root: MindNode;
  selectedId: NodeId | null;
  editingId: NodeId | null;

  // History for Undo/Redo
  past: MindNode[];
  future: MindNode[];

  // Filter & Search
  filterNodeType: LegalNodeType | 'all';
  searchQuery: string;

  // Modals state
  isSearchOpen: boolean;
  isExportImportOpen: boolean;
  isShortcutsOpen: boolean;
  isSidebarOpen: boolean;
  isTimelineOpen: boolean;
  isCourtDocOpen: boolean;
  isShareOpen: boolean;
  isTemplatesOpen: boolean;

  // Tree manipulation actions
  selectNode: (id: NodeId | null) => void;
  startEditing: (id: NodeId) => void;
  stopEditing: () => void;
  addChildNode: (parentId?: NodeId, defaultTitle?: string, nodeType?: LegalNodeType) => NodeId | null;
  addSiblingNode: (targetNodeId?: NodeId, defaultTitle?: string) => NodeId | null;
  updateNode: (nodeId: NodeId, updates: Partial<Omit<MindNode, 'id' | 'children'>>) => void;
  deleteNode: (nodeId: NodeId) => void;
  duplicateNode: (nodeId: NodeId) => NodeId | null;
  toggleCollapse: (nodeId: NodeId) => void;
  collapseAll: () => void;
  expandAll: () => void;
  moveNode: (nodeId: NodeId, newParentId: NodeId, insertIndex?: number) => boolean;

  // Case Template loading
  loadTemplate: (templateId: string) => void;

  // Import / Export / History
  importFromMarkdown: (markdown: string) => void;
  importFromJson: (jsonStr: string) => boolean;
  resetToDefault: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Modals & Panels
  setFilterNodeType: (type: LegalNodeType | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setExportImportOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTimelineOpen: (open: boolean) => void;
  setCourtDocOpen: (open: boolean) => void;
  setShareOpen: (open: boolean) => void;
  setTemplatesOpen: (open: boolean) => void;
}

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  root: loadInitialTree(),
  selectedId: 'case-root',
  editingId: null,
  past: [],
  future: [],

  filterNodeType: 'all',
  searchQuery: '',
  isSearchOpen: false,
  isExportImportOpen: false,
  isShortcutsOpen: false,
  isSidebarOpen: true, // open inspector by default for rich legal editing
  isTimelineOpen: false,
  isCourtDocOpen: false,
  isShareOpen: false,
  isTemplatesOpen: false,

  selectNode: (id) => {
    set({ selectedId: id });
  },

  startEditing: (id) => {
    set({ editingId: id, selectedId: id });
  },

  stopEditing: () => {
    set({ editingId: null });
  },

  addChildNode: (parentId, defaultTitle = 'Новый элемент', nodeType = 'general') => {
    const { root, selectedId, past } = get();
    const targetParentId = parentId || selectedId || root.id;

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    const parentNode = findNodeInTree(newRoot, targetParentId);
    if (!parentNode) return null;

    parentNode.isCollapsed = false;

    const newChildId = generateNodeId();
    const newChild: MindNode = {
      id: newChildId,
      title: defaultTitle,
      nodeType: nodeType,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (!parentNode.children) {
      parentNode.children = [];
    }
    parentNode.children.push(newChild);

    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
      selectedId: newChildId,
      editingId: newChildId,
    });

    return newChildId;
  },

  addSiblingNode: (targetNodeId, defaultTitle = 'Новый элемент') => {
    const { root, selectedId, past } = get();
    const targetId = targetNodeId || selectedId;

    if (!targetId || targetId === root.id) {
      return get().addChildNode(root.id, defaultTitle);
    }

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    const parentNode = findParentInTree(newRoot, targetId);
    if (!parentNode || !parentNode.children) return null;

    const currentIndex = parentNode.children.findIndex((c) => c.id === targetId);
    if (currentIndex === -1) return null;

    const currentSibling = parentNode.children[currentIndex];
    const newSiblingId = generateNodeId();
    const newSibling: MindNode = {
      id: newSiblingId,
      title: defaultTitle,
      nodeType: currentSibling.nodeType || 'general',
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    parentNode.children.splice(currentIndex + 1, 0, newSibling);

    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
      selectedId: newSiblingId,
      editingId: newSiblingId,
    });

    return newSiblingId;
  },

  duplicateNode: (nodeId) => {
    const { root, past } = get();
    if (nodeId === root.id) return null;

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    const parent = findParentInTree(newRoot, nodeId);
    const target = findNodeInTree(newRoot, nodeId);
    if (!parent || !parent.children || !target) return null;

    const index = parent.children.findIndex((c) => c.id === nodeId);
    if (index === -1) return null;

    function duplicateWithNewIds(node: MindNode): MindNode {
      return {
        ...cloneTree(node),
        id: generateNodeId(),
        title: node.title + ' (копия)',
        children: node.children ? node.children.map(duplicateWithNewIds) : [],
      };
    }

    const duplicated = duplicateWithNewIds(target);
    parent.children.splice(index + 1, 0, duplicated);

    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
      selectedId: duplicated.id,
    });

    return duplicated.id;
  },

  updateNode: (nodeId, updates) => {
    const { root, past } = get();
    const newRoot = cloneTree(root);
    const node = findNodeInTree(newRoot, nodeId);
    if (!node) return;

    let hasChanges = false;
    for (const key of Object.keys(updates) as (keyof typeof updates)[]) {
      if (node[key] !== updates[key]) {
        hasChanges = true;
        break;
      }
    }

    if (!hasChanges) return;

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];

    Object.assign(node, updates, { updatedAt: Date.now() });

    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
    });
  },

  deleteNode: (nodeId) => {
    const { root, past, selectedId } = get();
    if (nodeId === root.id) return;

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    const parentNode = findParentInTree(newRoot, nodeId);
    if (!parentNode || !parentNode.children) return;

    const index = parentNode.children.findIndex((c) => c.id === nodeId);
    if (index === -1) return;

    parentNode.children.splice(index, 1);

    let nextSelectedId = selectedId;
    if (selectedId === nodeId) {
      if (parentNode.children.length > 0) {
        const fallbackIndex = Math.min(index, parentNode.children.length - 1);
        nextSelectedId = parentNode.children[fallbackIndex].id;
      } else {
        nextSelectedId = parentNode.id;
      }
    }

    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
      selectedId: nextSelectedId,
      editingId: null,
    });
  },

  toggleCollapse: (nodeId) => {
    const { root, past } = get();
    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);
    const node = findNodeInTree(newRoot, nodeId);
    if (!node || !node.children || node.children.length === 0) return;

    node.isCollapsed = !node.isCollapsed;

    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
    });
  },

  collapseAll: () => {
    const { root, past } = get();
    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    function collapseRecursively(node: MindNode, depth: number) {
      if (depth > 0 && node.children && node.children.length > 0) {
        node.isCollapsed = true;
      }
      if (node.children) {
        node.children.forEach((c) => collapseRecursively(c, depth + 1));
      }
    }

    collapseRecursively(newRoot, 0);
    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
    });
  },

  expandAll: () => {
    const { root, past } = get();
    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    function expandRecursively(node: MindNode) {
      node.isCollapsed = false;
      if (node.children) {
        node.children.forEach(expandRecursively);
      }
    }

    expandRecursively(newRoot);
    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
    });
  },

  moveNode: (nodeId, newParentId, insertIndex) => {
    const { root, past } = get();
    if (nodeId === root.id || nodeId === newParentId) return false;

    const newRoot = cloneTree(root);
    const nodeToMove = findNodeInTree(newRoot, nodeId);
    if (!nodeToMove) return false;

    if (findNodeInTree(nodeToMove, newParentId)) {
      return false;
    }

    const oldParent = findParentInTree(newRoot, nodeId);
    const newParent = findNodeInTree(newRoot, newParentId);
    if (!oldParent || !oldParent.children || !newParent) return false;

    const oldIndex = oldParent.children.findIndex((c) => c.id === nodeId);
    if (oldIndex === -1) return false;

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];

    const [extracted] = oldParent.children.splice(oldIndex, 1);

    if (!newParent.children) newParent.children = [];
    newParent.isCollapsed = false;

    if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= newParent.children.length) {
      newParent.children.splice(insertIndex, 0, extracted);
    } else {
      newParent.children.push(extracted);
    }

    persistTree(newRoot);

    set({
      root: newRoot,
      past: newPast,
      future: [],
      selectedId: nodeId,
    });

    return true;
  },

  loadTemplate: (templateId) => {
    const found = CASE_TEMPLATES.find((t) => t.id === templateId);
    if (!found) return;

    const { root, past } = get();
    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const templateTree = cloneTree(found.data);

    persistTree(templateTree);

    set({
      root: templateTree,
      past: newPast,
      future: [],
      selectedId: templateTree.id,
      editingId: null,
      isTemplatesOpen: false,
    });
  },

  importFromMarkdown: (markdown) => {
    const { root, past } = get();
    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newTree = parseMarkdownToTree(markdown);

    persistTree(newTree);

    set({
      root: newTree,
      past: newPast,
      future: [],
      selectedId: newTree.id,
      editingId: null,
      isExportImportOpen: false,
    });
  },

  importFromJson: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !parsed.id || !parsed.title) {
        return false;
      }
      const { root, past } = get();
      const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];

      persistTree(parsed);

      set({
        root: parsed,
        past: newPast,
        future: [],
        selectedId: parsed.id,
        editingId: null,
        isExportImportOpen: false,
      });
      return true;
    } catch (err) {
      console.error('Invalid JSON import', err);
      return false;
    }
  },

  resetToDefault: () => {
    const { root, past } = get();
    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const defaultTree = cloneTree(INITIAL_MIND_MAP);

    persistTree(defaultTree);

    set({
      root: defaultTree,
      past: newPast,
      future: [],
      selectedId: defaultTree.id,
      editingId: null,
    });
  },

  undo: () => {
    const { past, root, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [cloneTree(root), ...future.slice(0, MAX_HISTORY_STEPS - 1)];

    persistTree(previous);

    set({
      root: previous,
      past: newPast,
      future: newFuture,
      editingId: null,
    });
  },

  redo: () => {
    const { past, root, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];

    persistTree(next);

    set({
      root: next,
      past: newPast,
      future: newFuture,
      editingId: null,
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  setFilterNodeType: (type) => set({ filterNodeType: type }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOpen: (open) => set({ isSearchOpen: open, searchQuery: open ? get().searchQuery : '' }),
  setExportImportOpen: (open) => set({ isExportImportOpen: open }),
  setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setTimelineOpen: (open) => set({ isTimelineOpen: open }),
  setCourtDocOpen: (open) => set({ isCourtDocOpen: open }),
  setShareOpen: (open) => set({ isShareOpen: open }),
  setTemplatesOpen: (open) => set({ isTemplatesOpen: open }),
}));
