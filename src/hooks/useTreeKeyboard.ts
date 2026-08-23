import { useEffect } from 'react';
import { useMindMapStore } from '../store/useMindMapStore';
import { CalculatedLayout, LayoutNode } from '../types/mindmap';

interface UseTreeKeyboardProps {
  layout: CalculatedLayout;
  onCenterSelected?: (nodeId: string) => void;
}

export function useTreeKeyboard({ layout, onCenterSelected }: UseTreeKeyboardProps) {
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
    setShortcutsOpen,
    toggleSidebar,
  } = useMindMapStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputActive =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(editingId);

      // Global shortcuts (available even or especially when interacting)
      const isMeta = e.metaKey || e.ctrlKey;

      // Undo / Redo
      if (isMeta && (e.key === 'z' || e.key === 'Z' || e.key === 'я' || e.key === 'Я')) {
        if (!isInputActive || editingId) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
      }

      if (isMeta && (e.key === 'y' || e.key === 'Y' || e.key === 'н' || e.key === 'Н')) {
        if (!isInputActive) {
          e.preventDefault();
          redo();
          return;
        }
      }

      // Quick search (Ctrl+F / Cmd+F)
      if (isMeta && (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А')) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Shortcuts cheat sheet (? or F1)
      if ((e.key === '?' || e.key === 'F1') && !isInputActive) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // Toggle inspector sidebar (Cmd/Ctrl + B or I)
      if (isMeta && (e.key === 'b' || e.key === 'i' || e.key === 'и' || e.key === 'ш')) {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // If user is typing in an input (except our specific navigation commands), allow default
      if (isInputActive) {
        if (e.key === 'Escape') {
          e.preventDefault();
          stopEditing();
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          stopEditing();
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
          const newId = addChildNode(selectedId);
          if (newId && onCenterSelected) {
            onCenterSelected(newId);
          }
          break;
        }

        // ENTER -> Add sibling node or start edit
        case 'Enter': {
          e.preventDefault();
          if (currentNode.isRoot) {
            // Root can only have children
            const newId = addChildNode(currentNode.id);
            if (newId && onCenterSelected) onCenterSelected(newId);
          } else {
            const newId = addSiblingNode(selectedId);
            if (newId && onCenterSelected) onCenterSelected(newId);
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

        // Arrow Left -> Go to parent node or collapse branch
        case 'ArrowLeft': {
          e.preventDefault();
          if (!currentNode.isRoot && currentNode.parentId) {
            selectNode(currentNode.parentId);
            if (onCenterSelected) onCenterSelected(currentNode.parentId);
          }
          break;
        }

        // Arrow Right -> Go to first child or expand branch
        case 'ArrowRight': {
          e.preventDefault();
          if (currentNode.isCollapsed) {
            toggleCollapse(currentNode.id);
          } else if (currentNode.children.length > 0) {
            const firstChild = currentNode.children[0];
            selectNode(firstChild.id);
            if (onCenterSelected) onCenterSelected(firstChild.id);
          }
          break;
        }

        // Arrow Up -> Go to previous sibling or upper neighbor
        case 'ArrowUp': {
          e.preventDefault();
          if (currentNode.parentId) {
            const parent = layout.nodeMap.get(currentNode.parentId);
            if (parent && parent.children.length > 0) {
              const idx = parent.children.findIndex((c: LayoutNode) => c.id === currentNode.id);
              if (idx > 0) {
                const prevSibling = parent.children[idx - 1];
                selectNode(prevSibling.id);
                if (onCenterSelected) onCenterSelected(prevSibling.id);
              }
            }
          }
          break;
        }

        // Arrow Down -> Go to next sibling or lower neighbor
        case 'ArrowDown': {
          e.preventDefault();
          if (currentNode.parentId) {
            const parent = layout.nodeMap.get(currentNode.parentId);
            if (parent && parent.children.length > 0) {
              const idx = parent.children.findIndex((c: LayoutNode) => c.id === currentNode.id);
              if (idx < parent.children.length - 1) {
                const nextSibling = parent.children[idx + 1];
                selectNode(nextSibling.id);
                if (onCenterSelected) onCenterSelected(nextSibling.id);
              }
            }
          }
          break;
        }

        // Toggle collapse [ or ] or Space
        case '[':
        case ']': {
          if (currentNode.children.length > 0) {
            e.preventDefault();
            toggleCollapse(currentNode.id);
          }
          break;
        }

        // Escape -> Deselect node
        case 'Escape': {
          e.preventDefault();
          selectNode(null);
          break;
        }

        default:
          break;
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
    setShortcutsOpen,
    toggleSidebar,
    onCenterSelected,
  ]);
}
