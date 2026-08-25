import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasTransform, TreeBoundingBox } from '../types/mindmap';

interface UseCanvasPanZoomProps {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

export function useCanvasPanZoom({
  minScale = 0.25,
  maxScale = 2.5,
  initialScale = 1.0,
}: UseCanvasPanZoomProps = {}) {
  const [transform, setTransform] = useState<CanvasTransform>({
    x: 80,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 80 : 300,
    scale: initialScale,
  });

  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boundingBoxRef = useRef<TreeBoundingBox | null>(null);

  /**
   * Helper to keep the tree always within comfortable viewing bounds (never lost off-screen).
   */
  const clampCoordinates = useCallback(
    (nextX: number, nextY: number, scale: number): { x: number; y: number } => {
      if (!containerRef.current || !boundingBoxRef.current) {
        return { x: nextX, y: nextY };
      }

      const rect = containerRef.current.getBoundingClientRect();
      const bbox = boundingBoxRef.current;
      const w = rect.width;
      const h = rect.height;

      // Allow generous pan margins but guarantee at least 150px of the tree is always visible
      const visibleMarginX = Math.min(w * 0.35, 250);
      const visibleMarginY = Math.min(h * 0.35, 200);

      // Boundaries
      const minX = visibleMarginX - (bbox.maxX * scale);
      const maxX = (w - visibleMarginX) - (bbox.minX * scale);
      const minY = visibleMarginY - (bbox.maxY * scale);
      const maxY = (h - visibleMarginY) - (bbox.minY * scale);

      let clampedX = nextX;
      let clampedY = nextY;

      if (minX <= maxX) {
        clampedX = Math.max(minX, Math.min(maxX, nextX));
      } else {
        clampedX = (minX + maxX) / 2;
      }

      if (minY <= maxY) {
        clampedY = Math.max(minY, Math.min(maxY, nextY));
      } else {
        clampedY = (minY + maxY) / 2;
      }

      return {
        x: Math.round(clampedX),
        y: Math.round(clampedY),
      };
    },
    []
  );

  // Track space bar key state for Space+Drag mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * Smooth mathematically safe exponential zoom centered directly at cursor position.
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const isPinch = e.ctrlKey || e.metaKey;
      const delta = -e.deltaY;

      // Exponential factor is strictly positive (> 0)
      const zoomFactor = isPinch 
        ? Math.exp(delta * 0.008) 
        : delta > 0 ? 1.12 : 0.89;

      setTransform((prev) => {
        const nextScale = Math.min(Math.max(prev.scale * zoomFactor, minScale), maxScale);
        if (Math.abs(nextScale - prev.scale) < 0.0001) return prev;

        const scaleRatio = nextScale / prev.scale;
        const targetX = mouseX - (mouseX - prev.x) * scaleRatio;
        const targetY = mouseY - (mouseY - prev.y) * scaleRatio;

        const clamped = clampCoordinates(targetX, targetY, nextScale);

        return {
          x: clamped.x,
          y: clamped.y,
          scale: Number(nextScale.toFixed(3)),
        };
      });
    },
    [minScale, maxScale, clampCoordinates]
  );

  /**
   * Pointer down handling for panning.
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't pan if clicking on an interactive node button, input, link or modal
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, input, textarea, a, select, [role="button"], .group');

      const isMiddleClick = e.button === 1;
      const isLeftClick = e.button === 0;

      if ((isLeftClick && !isInteractive) || (isLeftClick && isSpacePressed) || isMiddleClick) {
        e.preventDefault();
        setIsPanning(true);
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          originX: transform.x,
          originY: transform.y,
        };

        try {
          containerRef.current?.setPointerCapture(e.pointerId);
        } catch {
          // ignore capture errors
        }
      }
    },
    [isSpacePressed, transform.x, transform.y]
  );

  /**
   * Pointer move handling for smooth 60/120fps dragging.
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanning || !dragStartRef.current) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const rawX = dragStartRef.current.originX + dx;
      const rawY = dragStartRef.current.originY + dy;

      setTransform((prev) => {
        const clamped = clampCoordinates(rawX, rawY, prev.scale);
        return {
          ...prev,
          x: clamped.x,
          y: clamped.y,
        };
      });
    },
    [isPanning, clampCoordinates]
  );

  /**
   * Pointer up handling.
   */
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      dragStartRef.current = null;
      try {
        containerRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // ignore capture errors
      }
    }
  }, [isPanning]);

  /**
   * Programmatic Zoom In.
   */
  const zoomIn = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    setTransform((prev) => {
      const nextScale = Math.min(prev.scale * 1.2, maxScale);
      const scaleRatio = nextScale / prev.scale;
      const targetX = cx - (cx - prev.x) * scaleRatio;
      const targetY = cy - (cy - prev.y) * scaleRatio;
      const clamped = clampCoordinates(targetX, targetY, nextScale);

      return {
        x: clamped.x,
        y: clamped.y,
        scale: Number(nextScale.toFixed(3)),
      };
    });
  }, [maxScale, clampCoordinates]);

  /**
   * Programmatic Zoom Out.
   */
  const zoomOut = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    setTransform((prev) => {
      const nextScale = Math.max(prev.scale / 1.2, minScale);
      const scaleRatio = nextScale / prev.scale;
      const targetX = cx - (cx - prev.x) * scaleRatio;
      const targetY = cy - (cy - prev.y) * scaleRatio;
      const clamped = clampCoordinates(targetX, targetY, nextScale);

      return {
        x: clamped.x,
        y: clamped.y,
        scale: Number(nextScale.toFixed(3)),
      };
    });
  }, [minScale, clampCoordinates]);

  /**
   * Reset zoom and position to default.
   */
  const resetZoom = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const targetX = Math.round(rect.width * 0.1);
    const targetY = Math.round(rect.height / 2 - 30);
    const clamped = clampCoordinates(targetX, targetY, 1.0);

    setTransform({
      x: clamped.x,
      y: clamped.y,
      scale: 1.0,
    });
  }, [clampCoordinates]);

  /**
   * Fits the entire mental map bounding box neatly within the canvas viewport with comfortable padding.
   */
  const fitToBoundingBox = useCallback(
    (bbox: TreeBoundingBox) => {
      boundingBoxRef.current = bbox;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const paddingX = 80;
      const paddingY = 60;

      const availWidth = Math.max(200, rect.width - paddingX * 2);
      const availHeight = Math.max(200, rect.height - paddingY * 2);

      const treeW = Math.max(100, bbox.width);
      const treeH = Math.max(100, bbox.height);

      const scaleX = availWidth / treeW;
      const scaleY = availHeight / treeH;
      const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), minScale), 1.15);

      // Center tree perfectly in canvas viewport
      const treeCenterX = bbox.minX + bbox.width / 2;
      const treeCenterY = bbox.minY + bbox.height / 2;

      const targetX = rect.width / 2 - treeCenterX * fitScale;
      const targetY = rect.height / 2 - treeCenterY * fitScale;

      setTransform({
        x: Math.round(targetX),
        y: Math.round(targetY),
        scale: Number(fitScale.toFixed(3)),
      });
    },
    [minScale]
  );

  /**
   * Centers the viewport on a specific node.
   */
  const centerOnNode = useCallback((nodeX: number, nodeY: number, nodeWidth: number, nodeHeight: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    setTransform((prev) => {
      const targetCenterX = nodeX + nodeWidth / 2;
      const targetCenterY = nodeY + nodeHeight / 2;

      const targetX = rect.width / 2 - targetCenterX * prev.scale;
      const targetY = rect.height / 2 - targetCenterY * prev.scale;
      const clamped = clampCoordinates(targetX, targetY, prev.scale);

      return {
        ...prev,
        x: clamped.x,
        y: clamped.y,
      };
    });
  }, [clampCoordinates]);

  // Keep bounding box ref up to date
  const updateBoundingBox = useCallback((bbox: TreeBoundingBox) => {
    boundingBoxRef.current = bbox;
  }, []);

  return {
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
  };
}
