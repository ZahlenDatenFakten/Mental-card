import React from 'react';
import { CanvasTransform } from '../../types/mindmap';

interface CanvasBackgroundProps {
  transform: CanvasTransform;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ transform }) => {
  const safeScale = Math.max(0.1, transform.scale || 1.0);
  const gridSize = Math.max(12, Math.min(64, 24 * safeScale));
  
  // Safe positive modulo calculation
  const offsetX = (((transform.x % gridSize) + gridSize) % gridSize);
  const offsetY = (((transform.y % gridSize) + gridSize) % gridSize);

  return (
    <div
      data-canvas-bg="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{
        backgroundColor: '#09090b',
        backgroundImage: `radial-gradient(circle, rgba(161, 161, 170, 0.18) 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  );
};
