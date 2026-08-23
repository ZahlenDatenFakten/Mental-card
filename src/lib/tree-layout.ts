import {
  MindNode,
  LayoutNode,
  ConnectionLine,
  TreeBoundingBox,
  TreeStats,
  CalculatedLayout,
  NodeId,
} from '../types/mindmap';
import { generateBezierPath, getBranchColor } from './bezier';

export const HORIZONTAL_GAP = 72; // Horizontal distance between levels
export const VERTICAL_GAP = 18;   // Vertical distance between sibling subtrees

/**
 * Estimates node dimensions based on text length, metadata badges, and hierarchy depth.
 */
export function estimateNodeDimensions(node: MindNode, depth: number): { width: number; height: number } {
  const isRoot = depth === 0;
  const isL1 = depth === 1;

  // Approximate character width in pixels
  const charWidth = isRoot ? 9.5 : isL1 ? 8.5 : 8.0;
  const basePadding = isRoot ? 48 : isL1 ? 40 : 36;
  
  // Calculate text width
  const textLength = node.title ? node.title.length : 10;
  let estimatedWidth = Math.max(isRoot ? 140 : isL1 ? 110 : 90, textLength * charWidth + basePadding);

  // Extra width for badges
  if (node.notes) estimatedWidth += 22;
  if (node.url) estimatedWidth += 22;
  if (node.priority) estimatedWidth += 24;
  if (node.tags && node.tags.length > 0) estimatedWidth += node.tags.length * 28;
  if (node.children && node.children.length > 0) estimatedWidth += 26; // expand/collapse toggle pill

  // Cap max node width for very long text
  estimatedWidth = Math.min(estimatedWidth, 340);

  const estimatedHeight = isRoot ? 46 : isL1 ? 38 : 34;

  return {
    width: Math.round(estimatedWidth),
    height: estimatedHeight,
  };
}

/**
 * Recursively counts all descendant nodes.
 */
export function countDescendants(node: MindNode): number {
  if (!node.children || node.children.length === 0) return 0;
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}

interface IntermediateLayoutNode extends LayoutNode {
  subtreeHeight: number;
}

/**
 * First pass (Bottom-Up): Computes layout node objects and their total subtree heights.
 */
function computeSubtreeHeights(
  node: MindNode,
  depth: number,
  parentId: NodeId | null,
  inheritedColor?: string
): IntermediateLayoutNode {
  const { width, height } = estimateNodeDimensions(node, depth);
  const isRoot = depth === 0;
  const isCollapsed = Boolean(node.isCollapsed);
  const nodeColor = node.color || (depth === 1 ? getBranchColor(0) : inheritedColor);

  const collapsedCount = isCollapsed ? countDescendants(node) : 0;

  if (isCollapsed || !node.children || node.children.length === 0) {
    return {
      id: node.id,
      title: node.title,
      x: 0,
      y: 0,
      width,
      height,
      depth,
      isCollapsed,
      collapsedCount,
      color: node.color || inheritedColor,
      notes: node.notes,
      url: node.url,
      priority: node.priority,
      tags: node.tags,
      children: [],
      parentId,
      isRoot,
      subtreeHeight: height,
    };
  }

  // Calculate children layouts
  const layoutChildren: IntermediateLayoutNode[] = [];
  let childrenTotalHeight = 0;

  node.children.forEach((child, index) => {
    // Child branch color: for depth 1, assign unique branch color; deeper inherit
    const childColor = depth === 0 ? getBranchColor(index, child.color) : (child.color || nodeColor);
    const childLayout = computeSubtreeHeights(child, depth + 1, node.id, childColor);
    layoutChildren.push(childLayout);
    childrenTotalHeight += childLayout.subtreeHeight;
  });

  // Add vertical gaps between siblings
  if (layoutChildren.length > 1) {
    childrenTotalHeight += (layoutChildren.length - 1) * VERTICAL_GAP;
  }

  const subtreeHeight = Math.max(height, childrenTotalHeight);

  return {
    id: node.id,
    title: node.title,
    x: 0,
    y: 0,
    width,
    height,
    depth,
    isCollapsed,
    collapsedCount,
    color: node.color || inheritedColor,
    notes: node.notes,
    url: node.url,
    priority: node.priority,
    tags: node.tags,
    children: layoutChildren,
    parentId,
    isRoot,
    subtreeHeight,
  };
}

/**
 * Second pass (Top-Down): Assigns absolute (x, y) coordinates to each node.
 */
function assignCoordinates(
  node: IntermediateLayoutNode,
  currentX: number,
  centerY: number,
  nodeMap: Map<NodeId, LayoutNode>,
  connections: ConnectionLine[],
  selectedId: NodeId | null
) {
  node.x = currentX;
  node.y = Math.round(centerY - node.height / 2);

  nodeMap.set(node.id, node);

  if (node.children.length === 0) {
    return;
  }

  // Compute children total bounding height
  let totalChildrenHeight = 0;
  node.children.forEach((child) => {
    totalChildrenHeight += (child as IntermediateLayoutNode).subtreeHeight;
  });
  if (node.children.length > 1) {
    totalChildrenHeight += (node.children.length - 1) * VERTICAL_GAP;
  }

  let childStartY = centerY - totalChildrenHeight / 2;
  const childX = currentX + node.width + HORIZONTAL_GAP;
  const parentAnchorX = node.x + node.width;
  const parentAnchorY = node.y + node.height / 2;

  node.children.forEach((child) => {
    const intermediateChild = child as IntermediateLayoutNode;
    const childCenterY = childStartY + intermediateChild.subtreeHeight / 2;
    
    // Assign coords to child and its descendants
    assignCoordinates(intermediateChild, childX, childCenterY, nodeMap, connections, selectedId);

    // Create cubic Bezier connector
    const childAnchorX = intermediateChild.x;
    const childAnchorY = intermediateChild.y + intermediateChild.height / 2;

    const isLineActive = selectedId === node.id || selectedId === intermediateChild.id;

    connections.push({
      id: `conn-${node.id}-${intermediateChild.id}`,
      sourceId: node.id,
      targetId: intermediateChild.id,
      startX: parentAnchorX,
      startY: parentAnchorY,
      endX: childAnchorX,
      endY: childAnchorY,
      path: generateBezierPath(parentAnchorX, parentAnchorY, childAnchorX, childAnchorY),
      color: intermediateChild.color,
      isActive: isLineActive,
    });

    childStartY += intermediateChild.subtreeHeight + VERTICAL_GAP;
  });
}

/**
 * Main layout calculation entry point.
 * Converts raw nested MindNode hierarchy into positioned LayoutNodes and SVG connections.
 */
export function calculateTreeLayout(
  rootNode: MindNode,
  selectedId: NodeId | null = null
): CalculatedLayout {
  const intermediateRoot = computeSubtreeHeights(rootNode, 0, null);
  const nodeMap = new Map<NodeId, LayoutNode>();
  const connections: ConnectionLine[] = [];

  // Start root node at origin (0, 0)
  assignCoordinates(intermediateRoot, 0, 0, nodeMap, connections, selectedId);

  // Compute overall bounding box and statistics
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxDepth = 0;
  let totalNodes = 0;
  let collapsedNodes = 0;

  function traverseStats(node: LayoutNode) {
    totalNodes++;
    if (node.isCollapsed) collapsedNodes++;
    if (node.depth > maxDepth) maxDepth = node.depth;

    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);

    for (const child of node.children) {
      traverseStats(child);
    }
  }

  traverseStats(intermediateRoot);

  const boundingBox: TreeBoundingBox = {
    minX: minX === Infinity ? 0 : minX,
    minY: minY === Infinity ? 0 : minY,
    maxX: maxX === -Infinity ? 100 : maxX,
    maxY: maxY === -Infinity ? 100 : maxY,
    width: maxX === -Infinity ? 100 : Math.max(100, maxX - minX),
    height: maxY === -Infinity ? 100 : Math.max(100, maxY - minY),
  };

  const stats: TreeStats = {
    totalNodes,
    maxDepth,
    collapsedNodes,
  };

  return {
    root: intermediateRoot,
    nodeMap,
    connections,
    boundingBox,
    stats,
  };
}

/**
 * Finds parent node in a raw MindNode tree.
 */
export function findParentInTree(root: MindNode, targetId: NodeId): MindNode | null {
  if (root.id === targetId) return null;
  if (!root.children) return null;

  for (const child of root.children) {
    if (child.id === targetId) return root;
    const found = findParentInTree(child, targetId);
    if (found) return found;
  }
  return null;
}

/**
 * Finds a node by ID in a raw MindNode tree.
 */
export function findNodeInTree(root: MindNode, targetId: NodeId): MindNode | null {
  if (root.id === targetId) return root;
  if (!root.children) return null;

  for (const child of root.children) {
    const found = findNodeInTree(child, targetId);
    if (found) return found;
  }
  return null;
}
