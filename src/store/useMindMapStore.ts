import { create } from 'zustand';
import { MindNode, NodeId } from '../types/mindmap';
import { INITIAL_MIND_MAP } from '../lib/sample-data';
import { generateNodeId, parseMarkdownToTree } from '../lib/markdown-parser';
import { findParentInTree, findNodeInTree } from '../lib/tree-layout';

const LOCAL_STORAGE_KEY = 'mental_map_tree_v1';
const MAX_HISTORY_STEPS = 50;

/**
 * Deep clones a MindNode tree.
 */
function cloneTree(node: MindNode): MindNode {
  return {
    ...node,
    tags: node.tags ? [...node.tags] : undefined,
    children: node.children ? node.children.map(cloneTree) : [],
  };
}

/**
 * Loads persisted tree from localStorage or falls back to INITIAL_MIND_MAP.
 */
function loadInitialTree(): MindNode {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.title) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load tree from localStorage, using default sample', err);
  }
  return INITIAL_MIND_MAP;
}

/**
 * Saves tree to localStorage.
 */
function persistTree(root: MindNode) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(root));
  } catch (err) {
    console.warn('Failed to persist tree to localStorage', err);
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

  // UI state
  searchQuery: string;
  isSearchOpen: boolean;
  isExportImportOpen: boolean;
  isShortcutsOpen: boolean;
  isSidebarOpen: boolean;

  // Tree manipulation actions
  selectNode: (id: NodeId | null) => void;
  startEditing: (id: NodeId) => void;
  stopEditing: () => void;
  addChildNode: (parentId?: NodeId, defaultTitle?: string) => NodeId | null;
  addSiblingNode: (targetNodeId?: NodeId, defaultTitle?: string) => NodeId | null;
  updateNode: (nodeId: NodeId, updates: Partial<Omit<MindNode, 'id' | 'children'>>) => void;
  deleteNode: (nodeId: NodeId) => void;
  toggleCollapse: (nodeId: NodeId) => void;
  collapseAll: () => void;
  expandAll: () => void;
  moveNode: (nodeId: NodeId, newParentId: NodeId, insertIndex?: number) => boolean;

  // Import / Export / History
  importFromMarkdown: (markdown: string) => void;
  importFromJson: (jsonStr: string) => boolean;
  resetToDefault: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Modals & Panels
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setExportImportOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useMindMapStore = create<MindMapStore>((set, get) => ({
  root: loadInitialTree(),
  selectedId: 'root-node',
  editingId: null,
  past: [],
  future: [],

  searchQuery: '',
  isSearchOpen: false,
  isExportImportOpen: false,
  isShortcutsOpen: false,
  isSidebarOpen: false,

  selectNode: (id) => {
    set({ selectedId: id });
  },

  startEditing: (id) => {
    set({ editingId: id, selectedId: id });
  },

  stopEditing: () => {
    set({ editingId: null });
  },

  addChildNode: (parentId, defaultTitle = 'Новый узел') => {
    const { root, selectedId, past } = get();
    const targetParentId = parentId || selectedId || root.id;

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    const parentNode = findNodeInTree(newRoot, targetParentId);
    if (!parentNode) return null;

    // Expand parent if it was collapsed so the new child is visible
    parentNode.isCollapsed = false;

    const newChildId = generateNodeId();
    const newChild: MindNode = {
      id: newChildId,
      title: defaultTitle,
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

  addSiblingNode: (targetNodeId, defaultTitle = 'Новый узел') => {
    const { root, selectedId, past } = get();
    const targetId = targetNodeId || selectedId;

    if (!targetId || targetId === root.id) {
      // Cannot add sibling to root, add child instead
      return get().addChildNode(root.id, defaultTitle);
    }

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    const parentNode = findParentInTree(newRoot, targetId);
    if (!parentNode || !parentNode.children) return null;

    const currentIndex = parentNode.children.findIndex((c) => c.id === targetId);
    if (currentIndex === -1) return null;

    const newSiblingId = generateNodeId();
    const newSibling: MindNode = {
      id: newSiblingId,
      title: defaultTitle,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Insert right after current sibling
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

  updateNode: (nodeId, updates) => {
    const { root, past } = get();
    const newRoot = cloneTree(root);
    const node = findNodeInTree(newRoot, nodeId);
    if (!node) return;

    // Check if anything actually changed before adding to history
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
    // Cannot delete root node
    if (nodeId === root.id) return;

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];
    const newRoot = cloneTree(root);

    const parentNode = findParentInTree(newRoot, nodeId);
    if (!parentNode || !parentNode.children) return;

    const index = parentNode.children.findIndex((c) => c.id === nodeId);
    if (index === -1) return;

    parentNode.children.splice(index, 1);

    // If deleted node was selected, select parent or previous sibling
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

    // Prevent dragging parent into its own descendant
    const newRoot = cloneTree(root);
    const nodeToMove = findNodeInTree(newRoot, nodeId);
    if (!nodeToMove) return false;

    // Check if newParent is inside nodeToMove
    if (findNodeInTree(nodeToMove, newParentId)) {
      return false;
    }

    const oldParent = findParentInTree(newRoot, nodeId);
    const newParent = findNodeInTree(newRoot, newParentId);
    if (!oldParent || !oldParent.children || !newParent) return false;

    const oldIndex = oldParent.children.findIndex((c) => c.id === nodeId);
    if (oldIndex === -1) return false;

    const newPast = [...past.slice(-MAX_HISTORY_STEPS + 1), cloneTree(root)];

    // Remove from old parent
    const [extracted] = oldParent.children.splice(oldIndex, 1);

    // Insert into new parent
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

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOpen: (open) => set({ isSearchOpen: open, searchQuery: open ? get().searchQuery : '' }),
  setExportImportOpen: (open) => set({ isExportImportOpen: open }),
  setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));
