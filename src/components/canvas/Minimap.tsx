import React, { useState, useRef } from 'react';
import { CalculatedLayout, CanvasTransform, LayoutNode } from '../../types/mindmap';
import { MapPin, EyeOff } from 'lucide-react';

interface MinimapProps {
  layout: CalculatedLayout;
  transform: CanvasTransform;
  onNavigate: (x: number, y: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({ layout, transform, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(true);
  const minimapRef = useRef<HTMLDivElement>(null);

  const { boundingBox, nodeMap } = layout;
  const padding = 40;

  // Minimap dimensions
  const minimapWidth = 180;
  const minimapHeight = 120;

  const totalTreeWidth = Math.max(200, boundingBox.width + padding * 2);
  const totalTreeHeight = Math.max(150, boundingBox.height + padding * 2);

  const scaleFactor = Math.min(
    minimapWidth / totalTreeWidth,
    minimapHeight / totalTreeHeight
  );

  const offsetX = -boundingBox.minX + padding;
  const offsetY = -boundingBox.minY + padding;

  // Viewport calculation
  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;

  // Canvas top-left visible in tree coordinates:
  const viewX = (-transform.x) / transform.scale;
  const viewY = (-transform.y) / transform.scale;
  const viewW = containerWidth / transform.scale;
  const viewH = containerHeight / transform.scale;

  // Transform to minimap space
  const miniViewX = (viewX + offsetX) * scaleFactor;
  const miniViewY = (viewY + offsetY) * scaleFactor;
  const miniViewW = Math.max(10, viewW * scaleFactor);
  const miniViewH = Math.max(10, viewH * scaleFactor);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapRef.current) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click in minimap to tree coordinates
    const treeX = clickX / scaleFactor - offsetX;
    const treeY = clickY / scaleFactor - offsetY;

    // Calculate canvas transform to center on this tree coordinate
    const targetTransformX = containerWidth / 2 - treeX * transform.scale;
    const targetTransformY = containerHeight / 2 - treeY * transform.scale;

    onNavigate(Math.round(targetTransformX), Math.round(targetTransformY));
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        title="Показать миникарту"
        className="fixed bottom-5 right-5 z-40 p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg shadow-lg backdrop-blur transition-all"
      >
        <MapPin className="w-4 h-4" />
      </button>
    );
  }

  const nodesList: LayoutNode[] = Array.from(nodeMap.values());

  return (
    <div className="fixed bottom-5 right-5 z-40 bg-zinc-950/95 border border-zinc-800/90 rounded-xl shadow-floating overflow-hidden backdrop-blur-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-zinc-850 bg-zinc-900/50 text-[11px] text-zinc-400 select-none">
        <span className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-3 h-3 text-emerald-400" />
          Миникарта
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
          title="Скрыть миникарту"
        >
          <EyeOff className="w-3 h-3" />
        </button>
      </div>

      {/* Interactive Minimap Area */}
      <div
        ref={minimapRef}
        onClick={handleClick}
        className="relative cursor-crosshair bg-zinc-950/90"
        style={{
          width: `${minimapWidth}px`,
          height: `${minimapHeight}px`,
        }}
      >
        {/* Render node rectangles */}
        {nodesList.map((n) => {
          const miniX = (n.x + offsetX) * scaleFactor;
          const miniY = (n.y + offsetY) * scaleFactor;
          const miniW = Math.max(4, n.width * scaleFactor);
          const miniH = Math.max(2, n.height * scaleFactor);

          return (
            <div
              key={n.id}
              className="absolute rounded-[1px]"
              style={{
                left: `${miniX}px`,
                top: `${miniY}px`,
                width: `${miniW}px`,
                height: `${miniH}px`,
                backgroundColor: n.color || (n.isRoot ? '#10b981' : '#52525b'),
                opacity: n.isRoot ? 0.9 : 0.6,
              }}
            />
          );
        })}

        {/* Viewport Boundary Rectangle */}
        <div
          className="absolute border border-emerald-500/80 bg-emerald-500/10 pointer-events-none rounded-[2px] transition-all duration-75"
          style={{
            left: `${miniViewX}px`,
            top: `${miniViewY}px`,
            width: `${miniViewW}px`,
            height: `${miniViewH}px`,
          }}
        />
      </div>
    </div>
  );
};
