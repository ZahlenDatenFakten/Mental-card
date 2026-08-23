import React from 'react';
import { CanvasTransform } from '../../types/mindmap';

interface CanvasBackgroundProps {
  transform: CanvasTransform;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ transform }) => {
  const gridSize = 24 * transform.scale;
  const offsetX = transform.x % gridSize;
  const offsetY = transform.y % gridSize;

  return (
    <div
      data-canvas-bg="true"
      className="absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing overflow-hidden"
      style={{
        backgroundColor: '#09090b',
        backgroundImage: `radial-gradient(circle, rgba(161, 161, 170, 0.15) 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  );
};
