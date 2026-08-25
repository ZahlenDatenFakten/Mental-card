/**
 * Calculates a smooth cubic Bezier curve between parent right-edge and child left-edge.
 */
export function generateBezierPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  const dx = endX - startX;
  const curvature = 0.48;
  const cp1x = startX + dx * curvature;
  const cp1y = startY;
  const cp2x = endX - dx * curvature;
  const cp2y = endY;

  return `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;
}

/**
 * Calculates dynamic smart Bezier path between two node bounding boxes in 2D space.
 * Intelligently attaches anchors based on whether the target node is placed to the right, left, above or below.
 */
export function generateSmartBezierPath(
  source: { x: number; y: number; width: number; height: number },
  target: { x: number; y: number; width: number; height: number }
): { path: string; startX: number; startY: number; endX: number; endY: number } {
  // Check if target is to the right of source
  if (target.x >= source.x + source.width / 2) {
    const startX = source.x + source.width;
    const startY = source.y + source.height / 2;
    const endX = target.x;
    const endY = target.y + target.height / 2;

    const dx = Math.max(32, (endX - startX) * 0.48);
    const cp1x = startX + dx;
    const cp1y = startY;
    const cp2x = endX - dx;
    const cp2y = endY;

    return {
      path: `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      startX,
      startY,
      endX,
      endY,
    };
  } else {
    // Target is to the left of source
    const startX = source.x;
    const startY = source.y + source.height / 2;
    const endX = target.x + target.width;
    const endY = target.y + target.height / 2;

    const dx = Math.max(32, (startX - endX) * 0.48);
    const cp1x = startX - dx;
    const cp1y = startY;
    const cp2x = endX + dx;
    const cp2y = endY;

    return {
      path: `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      startX,
      startY,
      endX,
      endY,
    };
  }
}

/**
 * Calculates a branch accent path with harmonious dark-theme colors.
 */
export function getBranchColor(depth: number, explicitColor?: string): string {
  if (explicitColor) return explicitColor;

  const branchColors = [
    '#38bdf8', // sky-400
    '#34d399', // emerald-400
    '#a78bfa', // violet-400
    '#fb923c', // orange-400
    '#f472b6', // pink-400
    '#facc15', // amber-400
    '#2dd4bf', // teal-400
    '#818cf8', // indigo-400
  ];

  return branchColors[depth % branchColors.length];
}
