import { useEffect } from 'react';
import { CalculatedLayout, NodeId } from '../types/mindmap';
import { useMindMapStore } from '../store/useMindMapStore';
import { findSiblingNodeId, findParentNodeId } from '../lib/tree-layout';

interface UseTreeKeyboardProps {
  layout: CalculatedLayout;
  onCenterSelected?: (nodeId: NodeId) => void;
}

export function useTreeKeyboard({
  layout,
  onCenterSelected,
}: UseTreeKeyboardProps) {
  const {
    selectedId,
    editingId,
    selectNode,
    startEditing,
    stopEditing,
    addChildNode,
    addSiblingNode,
    deleteNode,
    toggleCollapse,
    undo,
    redo,
    setSearchOpen,
    toggleSidebar,
  } = useMindMapStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if actively typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('input, textarea, [contenteditable="true"]');

      if (isInput) {
        // Allow ESC to cancel inline editing
        if (e.key === 'Escape' && editingId) {
          e.preventDefault();
          stopEditing();
        }
        return;
      }

      // Global App Shortcuts (Ctrl / Cmd + Key)
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl) {
        // Ctrl+Z -> Undo
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
          return;
        }
        // Ctrl+Shift+Z or Ctrl+Y -> Redo
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
          return;
        }
        // Ctrl+F -> Search Modal
        if (e.key === 'f') {
          e.preventDefault();
          setSearchOpen(true);
          return;
        }
        // Ctrl+B -> Toggle Sidebar
        if (e.key === 'b') {
          e.preventDefault();
          toggleSidebar();
          return;
        }
        return;
      }

      // Canvas / Tree Navigation Shortcuts
      if (!selectedId) return;

      const currentNode = layout.nodeMap.get(selectedId);
      if (!currentNode) return;

      switch (e.key) {
        // TAB -> Add child node and start editing
        case 'Tab': {
          e.preventDefault();
          addChildNode(selectedId);
          if (onCenterSelected) {
            onCenterSelected(selectedId);
          }
          break;
        }

        // ENTER -> Add sibling node or start edit
        case 'Enter': {
          e.preventDefault();
          if (currentNode.isRoot) {
            // Root can only have children
            addChildNode(currentNode.id);
            if (onCenterSelected) onCenterSelected(currentNode.id);
          } else {
            addSiblingNode(selectedId);
            if (onCenterSelected) onCenterSelected(selectedId);
          }
          break;
        }

        // F2 -> Start inline edit
        case 'F2': {
          e.preventDefault();
          startEditing(selectedId);
          break;
        }

        // Backspace / Delete -> Remove node and subtree
        case 'Backspace':
        case 'Delete': {
          if (!currentNode.isRoot) {
            e.preventDefault();
            deleteNode(selectedId);
          }
          break;
        }

        // Arrow Right -> Move to first child
        case 'ArrowRight': {
          e.preventDefault();
          if (currentNode.isCollapsed) {
            toggleCollapse(selectedId);
          } else if (currentNode.children.length > 0) {
            const firstChild = currentNode.children[0];
            selectNode(firstChild.id);
            if (onCenterSelected) onCenterSelected(firstChild.id);
          }
          break;
        }

        // Arrow Left -> Move to parent
        case 'ArrowLeft': {
          e.preventDefault();
          if (!currentNode.isCollapsed && currentNode.children.length > 0 && !currentNode.isRoot) {
            toggleCollapse(selectedId);
          } else {
            const parentId = findParentNodeId(layout.root, selectedId);
            if (parentId) {
              selectNode(parentId);
              if (onCenterSelected) onCenterSelected(parentId);
            }
          }
          break;
        }

        // Arrow Down -> Move to next sibling
        case 'ArrowDown': {
          e.preventDefault();
          const nextSiblingId = findSiblingNodeId(layout.root, selectedId, 'next');
          if (nextSiblingId) {
            selectNode(nextSiblingId);
            if (onCenterSelected) onCenterSelected(nextSiblingId);
          }
          break;
        }

        // Arrow Up -> Move to previous sibling
        case 'ArrowUp': {
          e.preventDefault();
          const prevSiblingId = findSiblingNodeId(layout.root, selectedId, 'prev');
          if (prevSiblingId) {
            selectNode(prevSiblingId);
            if (onCenterSelected) onCenterSelected(prevSiblingId);
          }
          break;
        }

        // Space -> Toggle collapse
        case ' ': {
          if (currentNode.children.length > 0 || currentNode.collapsedCount > 0) {
            e.preventDefault();
            toggleCollapse(selectedId);
          }
          break;
        }

        // [ -> Collapse node
        case '[': {
          if (!currentNode.isCollapsed && currentNode.children.length > 0) {
            e.preventDefault();
            toggleCollapse(selectedId);
          }
          break;
        }

        // ] -> Expand node
        case ']': {
          if (currentNode.isCollapsed) {
            e.preventDefault();
            toggleCollapse(selectedId);
          }
          break;
        }

        // Escape -> Deselect node
        case 'Escape': {
          selectNode(null);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedId,
    editingId,
    layout,
    selectNode,
    startEditing,
    stopEditing,
    addChildNode,
    addSiblingNode,
    deleteNode,
    toggleCollapse,
    undo,
    redo,
    setSearchOpen,
    toggleSidebar,
    onCenterSelected,
  ]);
}
