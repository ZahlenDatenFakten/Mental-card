import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasTransform, TreeBoundingBox } from '../types/mindmap';

interface UseCanvasPanZoomProps {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

export function useCanvasPanZoom({
  minScale = 0.2,
  maxScale = 2.5,
  initialScale = 1.0,
}: UseCanvasPanZoomProps = {}) {
  const [transform, setTransform] = useState<CanvasTransform>({
    x: 100,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 80 : 300,
    scale: initialScale,
  });

  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track space bar key state for Space+Drag pan mode
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
   * Smooth mathematically safe exponential zoom centered at mouse position.
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Trackpad pinch vs regular mouse scroll wheel
      const isPinch = e.ctrlKey || e.metaKey;
      const delta = -e.deltaY;

      // Exponential factor is strictly positive (> 0) to avoid any negative inversion
      let zoomFactor: number;
      if (isPinch) {
        // Trackpad pinch zoom
        zoomFactor = Math.exp(delta * 0.008);
      } else {
        // Standard mouse scroll step
        zoomFactor = delta > 0 ? 1.12 : 0.89;
      }

      setTransform((prev) => {
        const nextScale = Math.min(Math.max(prev.scale * zoomFactor, minScale), maxScale);
        if (Math.abs(nextScale - prev.scale) < 0.0001) return prev;

        const scaleRatio = nextScale / prev.scale;
        const newX = mouseX - (mouseX - prev.x) * scaleRatio;
        const newY = mouseY - (mouseY - prev.y) * scaleRatio;

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
      // Don't pan if clicking on an interactive node input, button, link or modal
      const target = e.target as HTMLElement;
      const isInteractiveElement = target.closest('button, input, textarea, a, select, [role="button"], .group');

      const isMiddleClick = e.button === 1;
      const isLeftClick = e.button === 0;

      if ((isLeftClick && !isInteractiveElement) || (isLeftClick && isSpacePressed) || isMiddleClick) {
        e.preventDefault();
        setIsPanning(true);
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          originX: transform.x,
          originY: transform.y,
        };

        // Capture pointer events on container
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
   * Pointer move handling for dragging canvas smoothly.
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
      const nextScale = Math.max(prev.scale / 1.2, minScale);
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
      x: Math.round(rect.width * 0.1),
      y: Math.round(rect.height / 2 - 30),
      scale: 1.0,
    });
  }, []);

  /**
   * Fits the entire mental map bounding box neatly within the canvas viewport with comfortable padding.
   */
  const fitToBoundingBox = useCallback(
    (bbox: TreeBoundingBox) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const paddingX = 100;
      const paddingY = 80;

      const availWidth = Math.max(200, rect.width - paddingX * 2);
      const availHeight = Math.max(200, rect.height - paddingY * 2);

      const treeW = Math.max(100, bbox.width);
      const treeH = Math.max(100, bbox.height);

      const scaleX = availWidth / treeW;
      const scaleY = availHeight / treeH;
      const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), minScale), 1.15);

      // Center tree in canvas viewport
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
