import React from 'react';
import { CanvasTransform } from '../../types/mindmap';

interface CanvasBackgroundProps {
  transform: CanvasTransform;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ transform }) => {
  const safeScale = Math.max(0.1, transform.scale || 1.0);
  const gridSize = Math.max(14, Math.min(64, 24 * safeScale));
  
  // Safe positive modulo calculation
  const offsetX = (((transform.x % gridSize) + gridSize) % gridSize);
  const offsetY = (((transform.y % gridSize) + gridSize) % gridSize);

  return (
    <div
      data-canvas-bg="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{
        backgroundColor: '#000000',
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.14) 1.25px, transparent 1.25px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  );
};
