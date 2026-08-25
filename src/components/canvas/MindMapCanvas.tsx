import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { calculateTreeLayout } from '../../lib/tree-layout';
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
  Compass,
} from 'lucide-react';

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
  } = useMindMapStore();

  // Calculate layout coordinates for all nodes and connections
  const layout = useMemo(() => {
    return calculateTreeLayout(root, selectedId);
  }, [root, selectedId]);

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
  } = useCanvasPanZoom();

  // Auto-fit to view on initial mount
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && layout.boundingBox.width > 0) {
      hasInitializedRef.current = true;
      // Slight delay to ensure container dimensions are ready
      const timer = setTimeout(() => {
        fitToBoundingBox(layout.boundingBox);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [layout.boundingBox, fitToBoundingBox]);

  // Helper to center on selected node
  const handleCenterSelected = useCallback(
    (nodeId: string) => {
      const node = layout.nodeMap.get(nodeId);
      if (node) {
        centerOnNode(node.x, node.y, node.width, node.height);
      }
    },
    [layout, centerOnNode]
  );

  // Keyboard navigation & Shortcuts hook
  useTreeKeyboard({
    layout,
    onCenterSelected: handleCenterSelected,
  });

  // Fit to screen handler
  const handleFitToScreen = useCallback(() => {
    fitToBoundingBox(layout.boundingBox);
  }, [fitToBoundingBox, layout.boundingBox]);

  // Drag and Drop node re-parenting
  const handleDragNodeStart = (e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ draggedNodeId: nodeId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnNode = (e: React.DragEvent, targetNodeId: string) => {
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.draggedNodeId) {
        moveNode(data.draggedNodeId, targetNodeId);
      }
    } catch {
      // ignore drop errors
    }
  };

  // Check if tree is outside the visible viewport
  const isTreeOffscreen = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const { minX, minY, maxX, maxY } = layout.boundingBox;
    const scale = transform.scale || 1.0;

    const screenMinX = transform.x + minX * scale;
    const screenMinY = transform.y + minY * scale;
    const screenMaxX = transform.x + maxX * scale;
    const screenMaxY = transform.y + maxY * scale;

    // Check if overlap exists with viewport
    const hasOverlap =
      screenMaxX > 50 &&
      screenMinX < viewW - 50 &&
      screenMaxY > 80 &&
      screenMinY < viewH - 50;

    return !hasOverlap;
  }, [transform, layout.boundingBox]);

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
          connections={layout.connections}
          selectedId={selectedId}
        />

        {/* DOM Nodes Layer */}
        {Array.from(layout.nodeMap.values()).map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedId === node.id}
            isEditing={editingId === node.id}
            onSelect={selectNode}
            onStartEdit={startEditing}
            onStopEdit={stopEditing}
            onAddChild={addChildNode}
            onDelete={deleteNode}
            onToggleCollapse={toggleCollapse}
            onDragNodeStart={handleDragNodeStart}
            onDropOnNode={handleDropOnNode}
          />
        ))}
      </div>

      {/* Out of bounds safety indicator button */}
      {isTreeOffscreen && (
        <button
          onClick={handleFitToScreen}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-full shadow-floating text-xs animate-scale-in cursor-pointer transition-transform hover:scale-105"
        >
          <Compass className="w-4 h-4" />
          <span>Схема смещена за экран — Вернуть в центр</span>
        </button>
      )}

      {/* Floating Bottom-Left Canvas Controls Bar */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-1 p-1 bg-zinc-900/90 border border-zinc-800/90 rounded-xl shadow-floating backdrop-blur-md">
        {/* Zoom In */}
        <button
          onClick={zoomIn}
          title="Приблизить (Колесо мыши вверх)"
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Current Zoom Percentage */}
        <button
          onClick={resetZoom}
          title="Сбросить масштаб (100%)"
          className="px-2 py-1 text-xs font-mono font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors min-w-[52px] text-center cursor-pointer"
        >
          {Math.round(transform.scale * 100)}%
        </button>

        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          title="Отдалить (Колесо мыши вниз)"
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-zinc-800 mx-0.5" />

        {/* Fit to View */}
        <button
          onClick={handleFitToScreen}
          title="Вписать всю карту в экран"
          className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Collapse All */}
        <button
          onClick={collapseAll}
          title="Свернуть все ветки"
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <FoldHorizontal className="w-4 h-4" />
        </button>

        {/* Expand All */}
        <button
          onClick={expandAll}
          title="Развернуть все ветки"
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <UnfoldHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Minimap Component */}
      <Minimap
        layout={layout}
        transform={transform}
        onNavigate={(newX, newY) => {
          setTransform((prev) => ({ ...prev, x: newX, y: newY }));
        }}
      />
    </div>
  );
};
