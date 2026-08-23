/**
 * Calculates a smooth horizontal cubic Bezier curve between parent right-edge and child left-edge.
 * Produces crisp, organic connection lines typical of modern mind mapping tools.
 */
export function generateBezierPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  const dx = endX - startX;
  // Dynamic tangent strength based on horizontal distance
  const curvature = 0.48;
  const cp1x = startX + dx * curvature;
  const cp1y = startY;
  const cp2x = endX - dx * curvature;
  const cp2y = endY;

  return `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;
}

/**
 * Calculates a branch accent path with glowing gradient or dot markers.
 */
export function getBranchColor(depth: number, explicitColor?: string): string {
  if (explicitColor) return explicitColor;
  
  // High-contrast, subdued, non-neon dark theme palette
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
