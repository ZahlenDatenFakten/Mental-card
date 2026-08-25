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

export const HORIZONTAL_GAP = 76; // Horizontal distance between levels
export const VERTICAL_GAP = 20;   // Vertical distance between sibling subtrees

/**
 * Estimates node dimensions based on text length, legal badges, and hierarchy depth.
 */
export function estimateNodeDimensions(node: MindNode, depth: number): { width: number; height: number } {
  const isRoot = depth === 0;
  const isL1 = depth === 1;

  // Approximate character width in pixels
  const charWidth = isRoot ? 9.5 : isL1 ? 8.5 : 8.0;
  const basePadding = isRoot ? 54 : isL1 ? 44 : 40;
  
  // Calculate text width
  const textLength = node.title ? node.title.length : 10;
  let estimatedWidth = Math.max(isRoot ? 160 : isL1 ? 130 : 100, textLength * charWidth + basePadding);

  // Extra width for legal badges
  if (node.nodeType && node.nodeType !== 'general') estimatedWidth += 28;
  if (node.lawArticle) estimatedWidth += Math.min(node.lawArticle.length * 6.5, 90);
  if (node.eventDate) estimatedWidth += 70;
  if (node.casePages || node.caseVolume) estimatedWidth += 55;
  if (node.notes) estimatedWidth += 22;
  if (node.url) estimatedWidth += 22;
  if (node.priority) estimatedWidth += 24;
  if (node.tags && node.tags.length > 0) estimatedWidth += node.tags.length * 28;
  if (node.children && node.children.length > 0) estimatedWidth += 26; // collapse toggle pill

  // Cap max node width
  estimatedWidth = Math.min(estimatedWidth, 420);

  const estimatedHeight = isRoot ? 48 : isL1 ? 40 : 36;

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
      nodeType: node.nodeType || 'general',
      lawArticle: node.lawArticle,
      caseVolume: node.caseVolume,
      casePages: node.casePages,
      evidenceStatus: node.evidenceStatus,
      evidenceType: node.evidenceType,
      eventDate: node.eventDate,
      eventTime: node.eventTime,
      strengthScore: node.strengthScore,
      opponentStance: node.opponentStance,
      citation: node.citation,
      children: [],
      parentId,
      isRoot,
      subtreeHeight: height,
    };
  }

  // Compute children subtrees with distinct branch colors for depth 1
  const children: IntermediateLayoutNode[] = node.children.map((child, index) => {
    const branchColor = depth === 0 ? getBranchColor(index) : nodeColor;
    return computeSubtreeHeights(child, depth + 1, node.id, branchColor);
  });

  const childrenTotalHeight =
    children.reduce((sum, child) => sum + child.subtreeHeight, 0) +
    (children.length - 1) * VERTICAL_GAP;

  const subtreeHeight = Math.max(height, childrenTotalHeight);

  return {
    id: node.id,
    title: node.title,
    x: 0,
    y: 0,
    width,
    height,
    depth,
    isCollapsed: false,
    collapsedCount: 0,
    color: node.color || inheritedColor,
    notes: node.notes,
    url: node.url,
    priority: node.priority,
    tags: node.tags,
    nodeType: node.nodeType || 'general',
    lawArticle: node.lawArticle,
    caseVolume: node.caseVolume,
    casePages: node.casePages,
    evidenceStatus: node.evidenceStatus,
    evidenceType: node.evidenceType,
    eventDate: node.eventDate,
    eventTime: node.eventTime,
    strengthScore: node.strengthScore,
    opponentStance: node.opponentStance,
    citation: node.citation,
    children,
    parentId,
    isRoot,
    subtreeHeight,
  };
}

/**
 * Second pass (Top-Down): Assigns exact (x, y) coordinates.
 */
function assignCoordinates(
  node: IntermediateLayoutNode,
  currentX: number,
  currentY: number,
  nodeMap: Map<NodeId, LayoutNode>,
  connections: ConnectionLine[],
  selectedId: NodeId | null
) {
  node.x = currentX;
  node.y = currentY;

  // Add to lookup map
  nodeMap.set(node.id, node);

  if (node.isCollapsed || node.children.length === 0) {
    return;
  }

  // Calculate starting Y position for children
  const childrenTotalHeight =
    node.children.reduce((sum, child) => sum + (child as IntermediateLayoutNode).subtreeHeight, 0) +
    (node.children.length - 1) * VERTICAL_GAP;

  let childYCursor = currentY + node.height / 2 - childrenTotalHeight / 2;
  const childX = currentX + node.width + HORIZONTAL_GAP;

  for (const child of node.children as IntermediateLayoutNode[]) {
    const childNodeY = childYCursor + child.subtreeHeight / 2 - child.height / 2;

    // Source anchor: middle-right of parent node
    const startX = currentX + node.width;
    const startY = currentY + node.height / 2;

    // Target anchor: middle-left of child node
    const endX = childX;
    const endY = childNodeY + child.height / 2;

    // Generate Bezier path
    const path = generateBezierPath(startX, startY, endX, endY);

    const isConnectionActive = selectedId === node.id || selectedId === child.id;

    connections.push({
      id: `conn-${node.id}-${child.id}`,
      sourceId: node.id,
      targetId: child.id,
      startX,
      startY,
      endX,
      endY,
      path,
      color: child.color,
      isActive: isConnectionActive,
    });

    assignCoordinates(
      child,
      childX,
      childNodeY,
      nodeMap,
      connections,
      selectedId
    );

    childYCursor += child.subtreeHeight + VERTICAL_GAP;
  }
}

/**
 * Calculates complete tree layout with node bounds and statistics.
 */
export function calculateTreeLayout(
  root: MindNode,
  selectedId: NodeId | null = null
): CalculatedLayout {
  const intermediateRoot = computeSubtreeHeights(root, 0, null);

  const nodeMap = new Map<NodeId, LayoutNode>();
  const connections: ConnectionLine[] = [];

  // Center root node vertically at 0
  assignCoordinates(
    intermediateRoot,
    0,
    -intermediateRoot.height / 2,
    nodeMap,
    connections,
    selectedId
  );

  // Compute bounding box and stats
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  let totalNodes = 0;
  let maxDepth = 0;
  let collapsedNodes = 0;
  let thesesCount = 0;
  let evidenceCount = 0;
  let normsCount = 0;
  let eventsCount = 0;
  let risksCount = 0;

  function traverseStats(n: LayoutNode) {
    totalNodes++;
    maxDepth = Math.max(maxDepth, n.depth);
    if (n.isCollapsed) collapsedNodes += n.collapsedCount;

    if (n.nodeType === 'thesis') thesesCount++;
    if (n.nodeType === 'evidence') evidenceCount++;
    if (n.nodeType === 'norm') normsCount++;
    if (n.nodeType === 'fact_timeline') eventsCount++;
    if (n.nodeType === 'risk') risksCount++;

    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);

    for (const child of n.children) {
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
    thesesCount,
    evidenceCount,
    normsCount,
    eventsCount,
    risksCount,
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
 * Finds parent node ID in a layout tree.
 */
export function findParentNodeId(root: LayoutNode, targetId: NodeId): NodeId | null {
  if (root.id === targetId) return null;
  for (const child of root.children) {
    if (child.id === targetId) return root.id;
    const found = findParentNodeId(child, targetId);
    if (found) return found;
  }
  return null;
}

/**
 * Finds sibling node ID in a layout tree.
 */
export function findSiblingNodeId(
  root: LayoutNode,
  targetId: NodeId,
  direction: 'next' | 'prev'
): NodeId | null {
  if (root.id === targetId) return null;
  const parentId = findParentNodeId(root, targetId);
  if (!parentId) return null;

  function findNode(n: LayoutNode, id: NodeId): LayoutNode | null {
    if (n.id === id) return n;
    for (const c of n.children) {
      const res = findNode(c, id);
      if (res) return res;
    }
    return null;
  }

  const parent = findNode(root, parentId);
  if (!parent || !parent.children) return null;

  const idx = parent.children.findIndex((c) => c.id === targetId);
  if (idx === -1) return null;

  if (direction === 'next' && idx < parent.children.length - 1) {
    return parent.children[idx + 1].id;
  }
  if (direction === 'prev' && idx > 0) {
    return parent.children[idx - 1].id;
  }
  return null;
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
