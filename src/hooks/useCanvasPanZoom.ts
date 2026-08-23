import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasTransform, TreeBoundingBox } from '../types/mindmap';

interface UseCanvasPanZoomProps {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

export function useCanvasPanZoom({
  minScale = 0.15,
  maxScale = 2.5,
  initialScale = 1.0,
}: UseCanvasPanZoomProps = {}) {
  const [transform, setTransform] = useState<CanvasTransform>({
    x: window.innerWidth > 1200 ? 180 : 80,
    y: window.innerHeight / 2 - 40,
    scale: initialScale,
  });

  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track space bar key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
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
   * Smooth zooming centered directly at cursor position.
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Detect trackpad pinch vs regular scroll wheel
      const isPinch = e.ctrlKey || e.metaKey;
      const zoomFactor = isPinch ? 1 - e.deltaY * 0.015 : e.deltaY > 0 ? 0.9 : 1.1;

      setTransform((prev) => {
        const nextScale = Math.min(Math.max(prev.scale * zoomFactor, minScale), maxScale);
        if (nextScale === prev.scale) return prev;

        // Zoom relative to mouse cursor
        const scaleChange = nextScale / prev.scale;
        const newX = mouseX - (mouseX - prev.x) * scaleChange;
        const newY = mouseY - (mouseY - prev.y) * scaleChange;

        return {
          x: Math.round(newX),
          y: Math.round(newY),
          scale: Number(nextScale.toFixed(3)),
        };
      });
    },
    [minScale, maxScale]
  );

  /**
   * Pointer down handling for panning.
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Middle click (button === 1), Space+Left click, or clicking directly on canvas background (button === 0)
      const isMiddleClick = e.button === 1;
      const isLeftClick = e.button === 0;
      const isCanvasBackground = (e.target as HTMLElement).getAttribute('data-canvas-bg') === 'true';

      if (isMiddleClick || (isLeftClick && (isSpacePressed || isCanvasBackground))) {
        e.preventDefault();
        setIsPanning(true);
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          originX: transform.x,
          originY: transform.y,
        };

        // Capture pointer to track dragging outside container
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }
    },
    [isSpacePressed, transform.x, transform.y]
  );

  /**
   * Pointer move handling for dragging canvas.
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanning || !dragStartRef.current) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      setTransform((prev) => ({
        ...prev,
        x: Math.round(dragStartRef.current!.originX + dx),
        y: Math.round(dragStartRef.current!.originY + dy),
      }));
    },
    [isPanning]
  );

  /**
   * Pointer up handling.
   */
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      dragStartRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore capture release errors
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
      const nextScale = Math.min(prev.scale * 1.25, maxScale);
      const scaleChange = nextScale / prev.scale;
      return {
        x: Math.round(cx - (cx - prev.x) * scaleChange),
        y: Math.round(cy - (cy - prev.y) * scaleChange),
        scale: Number(nextScale.toFixed(3)),
      };
    });
  }, [maxScale]);

  /**
   * Programmatic Zoom Out.
   */
  const zoomOut = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    setTransform((prev) => {
      const nextScale = Math.max(prev.scale / 1.25, minScale);
      const scaleChange = nextScale / prev.scale;
      return {
        x: Math.round(cx - (cx - prev.x) * scaleChange),
        y: Math.round(cy - (cy - prev.y) * scaleChange),
        scale: Number(nextScale.toFixed(3)),
      };
    });
  }, [minScale]);

  /**
   * Reset zoom and position to default.
   */
  const resetZoom = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTransform({
      x: Math.round(rect.width * 0.15),
      y: Math.round(rect.height / 2),
      scale: 1.0,
    });
  }, []);

  /**
   * Fits the entire mental map bounding box neatly within the canvas viewport with padding.
   */
  const fitToBoundingBox = useCallback(
    (bbox: TreeBoundingBox) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 80;

      const availWidth = Math.max(100, rect.width - padding * 2);
      const availHeight = Math.max(100, rect.height - padding * 2);

      const scaleX = availWidth / bbox.width;
      const scaleY = availHeight / bbox.height;
      const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), minScale), 1.2);

      // Center the bounding box in viewport
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

      return {
        ...prev,
        x: Math.round(rect.width / 2 - targetCenterX * prev.scale),
        y: Math.round(rect.height / 2 - targetCenterY * prev.scale),
      };
    });
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
  };
}
