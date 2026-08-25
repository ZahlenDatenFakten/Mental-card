import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { calculateTreeLayout } from '../../lib/tree-layout';
import { generateSmartBezierPath } from '../../lib/bezier';
import { useCanvasPanZoom } from '../../hooks/useCanvasPanZoom';
import { useTreeKeyboard } from '../../hooks/useTreeKeyboard';
import { CanvasBackground } from './CanvasBackground';
import { TreeConnections } from './TreeConnections';
import { NodeComponent } from './NodeComponent';
import { Minimap } from './Minimap';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FoldHorizontal,
  UnfoldHorizontal,
  Sparkles,
} from 'lucide-react';
import { ConnectionLine, LayoutNode } from '../../types/mindmap';

interface DragState {
  nodeId: string;
  dx: number;
  dy: number;
  hoverTargetId: string | null;
}

export const MindMapCanvas: React.FC = () => {
  const {
    root,
    selectedId,
    editingId,
    selectNode,
    startEditing,
    stopEditing,
    addChildNode,
    deleteNode,
    toggleCollapse,
    collapseAll,
    expandAll,
    moveNode,
    moveBranchPosition,
    resetTreeAutoLayout,
  } = useMindMapStore();

  const [dragState, setDragState] = useState<DragState | null>(null);

  // Calculate base layout coordinates for all nodes and connections
  const baseLayout = useMemo(() => {
    return calculateTreeLayout(root, selectedId);
  }, [root, selectedId]);

  // Compute live layout with dynamic node offsets and real-time SVG Bezier connections
  const dynamicLayout = useMemo(() => {
    if (!dragState || (dragState.dx === 0 && dragState.dy === 0)) {
      return baseLayout;
    }

    const { nodeId, dx, dy } = dragState;

    // Helper to find all descendants of dragged node
    const movedNodeIds = new Set<string>();
    function collectDescendants(n: LayoutNode) {
      movedNodeIds.add(n.id);
      for (const child of n.children) {
        collectDescendants(child);
      }
    }

    const draggedNode = baseLayout.nodeMap.get(nodeId);
    if (draggedNode) {
      collectDescendants(draggedNode);
    }

    // Clone nodeMap with offset positions for moved nodes
    const liveNodeMap = new Map<string, LayoutNode>();
    for (const [id, node] of baseLayout.nodeMap.entries()) {
      if (movedNodeIds.has(id)) {
        liveNodeMap.set(id, {
          ...node,
          x: node.x + dx,
          y: node.y + dy,
        });
      } else {
        liveNodeMap.set(id, node);
      }
    }

    // Recalculate dynamic SVG connections for all pairs in real time
    const liveConnections: ConnectionLine[] = [];
    for (const conn of baseLayout.connections) {
      const sourceNode = liveNodeMap.get(conn.sourceId);
      const targetNode = liveNodeMap.get(conn.targetId);

      if (sourceNode && targetNode) {
        const bezier = generateSmartBezierPath(sourceNode, targetNode);
        const isActive = selectedId === sourceNode.id || selectedId === targetNode.id;

        liveConnections.push({
          ...conn,
          startX: bezier.startX,
          startY: bezier.startY,
          endX: bezier.endX,
          endY: bezier.endY,
          path: bezier.path,
          isActive,
        });
      } else {
        liveConnections.push(conn);
      }
    }

    return {
      ...baseLayout,
      nodeMap: liveNodeMap,
      connections: liveConnections,
    };
  }, [baseLayout, dragState, selectedId]);

  // Pan and Zoom Hook
  const {
    transform,
    setTransform,
    containerRef,
    isPanning,
    isSpacePressed,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToBoundingBox,
    centerOnNode,
    updateBoundingBox,
  } = useCanvasPanZoom();

  // Keep bounding box updated in pan/zoom hook for clamping
  useEffect(() => {
    updateBoundingBox(dynamicLayout.boundingBox);
  }, [dynamicLayout.boundingBox, updateBoundingBox]);

  // Auto-fit to view on initial mount
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && dynamicLayout.boundingBox.width > 0) {
      hasInitializedRef.current = true;
      const timer = setTimeout(() => {
        fitToBoundingBox(dynamicLayout.boundingBox);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [dynamicLayout.boundingBox, fitToBoundingBox]);

  // Helper to center on selected node
  const handleCenterSelected = useCallback(
    (nodeId: string) => {
      const node = dynamicLayout.nodeMap.get(nodeId);
      if (node) {
        centerOnNode(node.x, node.y, node.width, node.height);
      }
    },
    [dynamicLayout, centerOnNode]
  );

  // Keyboard navigation & Shortcuts hook
  useTreeKeyboard({
    layout: dynamicLayout,
    onCenterSelected: handleCenterSelected,
  });

  // Fit to screen handler
  const handleFitToScreen = useCallback(() => {
    fitToBoundingBox(dynamicLayout.boundingBox);
  }, [fitToBoundingBox, dynamicLayout.boundingBox]);

  // Node Drag Handlers (1:1 Free Pointer Dragging)
  const handleNodeDragStart = useCallback((nodeId: string) => {
    setDragState({
      nodeId,
      dx: 0,
      dy: 0,
      hoverTargetId: null,
    });
  }, []);

  const handleNodeDragMove = useCallback(
    (nodeId: string, dx: number, dy: number, clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Convert screen clientX, clientY to canvas space
      const canvasPointerX = (clientX - rect.left - transform.x) / transform.scale;
      const canvasPointerY = (clientY - rect.top - transform.y) / transform.scale;

      // Detect if cursor is hovering over any other node (drop target for reparenting)
      let foundTargetId: string | null = null;
      for (const [id, node] of baseLayout.nodeMap.entries()) {
        if (id === nodeId) continue;

        // Check if pointer is within target node bounding box (with slight padding)
        if (
          canvasPointerX >= node.x - 8 &&
          canvasPointerX <= node.x + node.width + 8 &&
          canvasPointerY >= node.y - 8 &&
          canvasPointerY <= node.y + node.height + 8
        ) {
          foundTargetId = id;
          break;
        }
      }

      setDragState({
        nodeId,
        dx,
        dy,
        hoverTargetId: foundTargetId,
      });
    },
    [baseLayout.nodeMap, containerRef, transform]
  );

  const handleNodeDragEnd = useCallback(
    (nodeId: string, dx: number, dy: number) => {
      if (dragState) {
        if (dragState.hoverTargetId && dragState.hoverTargetId !== nodeId) {
          moveNode(nodeId, dragState.hoverTargetId);
        } else if (Math.hypot(dx, dy) > 4) {
          moveBranchPosition(nodeId, dx, dy);
        }
      }
      setDragState(null);
    },
    [dragState, moveNode, moveBranchPosition]
  );

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full overflow-hidden select-none bg-background touch-none ${
        isPanning ? 'cursor-grabbing' : isSpacePressed ? 'cursor-grab' : 'cursor-default'
      }`}
    >
      {/* Dynamic Background Dot Grid */}
      <CanvasBackground transform={transform} />

      {/* Transformable Canvas Layer */}
      <div
        className="absolute origin-top-left will-change-transform"
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          transition: isPanning ? 'none' : 'transform 120ms ease-out',
        }}
      >
        {/* SVG Connections Layer */}
        <TreeConnections
          connections={dynamicLayout.connections}
          selectedId={selectedId}
        />

        {/* DOM Nodes Layer */}
        {Array.from(dynamicLayout.nodeMap.values()).map((node) => {
          const isThisDragging = dragState?.nodeId === node.id;
          const isTarget = dragState?.hoverTargetId === node.id;

          return (
            <NodeComponent
              key={node.id}
              node={node}
              isSelected={selectedId === node.id}
              isEditing={editingId === node.id}
              isDraggingThisNode={isThisDragging}
              isHoverTarget={isTarget}
              dragOffset={isThisDragging ? { dx: dragState.dx, dy: dragState.dy } : undefined}
              canvasScale={transform.scale}
              onSelect={selectNode}
              onStartEdit={startEditing}
              onStopEdit={stopEditing}
              onAddChild={addChildNode}
              onDelete={deleteNode}
              onToggleCollapse={toggleCollapse}
              onNodeDragStart={handleNodeDragStart}
              onNodeDragMove={handleNodeDragMove}
              onNodeDragEnd={handleNodeDragEnd}
            />
          );
        })}
      </div>

      {/* Apple Floating Glass Capsule HUD (Bottom-Left) */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-1 p-1.5 apple-glass rounded-full shadow-apple-hud border border-white/[0.12]">
        {/* Zoom In */}
        <button
          onClick={zoomIn}
          title="Приблизить (Колесо мыши вверх)"
          className="p-2 text-zinc-300 hover:text-white hover:bg-white/[0.1] rounded-full transition-all active:scale-[0.9] cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Current Zoom Percentage */}
        <button
          onClick={resetZoom}
          title="Сбросить масштаб (100%)"
          className="px-2.5 py-1 text-xs font-mono font-medium text-zinc-300 hover:text-white hover:bg-white/[0.1] rounded-full transition-all active:scale-[0.92] min-w-[54px] text-center cursor-pointer"
        >
          {Math.round(transform.scale * 100)}%
        </button>

        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          title="Отдалить (Колесо мыши вниз)"
          className="p-2 text-zinc-300 hover:text-white hover:bg-white/[0.1] rounded-full transition-all active:scale-[0.9] cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-white/[0.15] mx-0.5" />

        {/* Fit to View */}
        <button
          onClick={handleFitToScreen}
          title="Вписать всю карту в экран"
          className="p-2 text-zinc-300 hover:text-[#0A84FF] hover:bg-white/[0.1] rounded-full transition-all active:scale-[0.9] cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Auto-Layout Snap (Выровнять схему) */}
        <button
          onClick={resetTreeAutoLayout}
          title="Автоматически выровнять все блоки и ветки в аккуратное дерево"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A84FF]/25 hover:bg-[#0A84FF]/40 border border-[#0A84FF]/50 rounded-full transition-all active:scale-[0.92] cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0A84FF]" />
          <span className="hidden sm:inline">Выровнять</span>
        </button>

        <div className="w-[1px] h-5 bg-white/[0.15] mx-0.5" />

        {/* Collapse All */}
        <button
          onClick={collapseAll}
          title="Свернуть все ветки"
          className="p-2 text-zinc-300 hover:text-white hover:bg-white/[0.1] rounded-full transition-all active:scale-[0.9] cursor-pointer"
        >
          <FoldHorizontal className="w-4 h-4" />
        </button>

        {/* Expand All */}
        <button
          onClick={expandAll}
          title="Развернуть все ветки"
          className="p-2 text-zinc-300 hover:text-white hover:bg-white/[0.1] rounded-full transition-all active:scale-[0.9] cursor-pointer"
        >
          <UnfoldHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Minimap Component */}
      <Minimap
        layout={dynamicLayout}
        transform={transform}
        onNavigate={(newX, newY) => {
          setTransform((prev) => ({ ...prev, x: newX, y: newY }));
        }}
      />
    </div>
  );
};
