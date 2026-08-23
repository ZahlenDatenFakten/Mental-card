export type NodeId = string;

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface MindNode {
  id: NodeId;
  title: string;
  children?: MindNode[];
  isCollapsed?: boolean;
  color?: string;
  notes?: string;
  url?: string;
  priority?: PriorityLevel;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface LayoutNode {
  id: NodeId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  isCollapsed: boolean;
  collapsedCount: number;
  color?: string;
  notes?: string;
  url?: string;
  priority?: PriorityLevel;
  tags?: string[];
  children: LayoutNode[];
  parentId: NodeId | null;
  isRoot: boolean;
}

export interface ConnectionLine {
  id: string;
  sourceId: NodeId;
  targetId: NodeId;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  path: string;
  color?: string;
  isActive: boolean;
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface TreeBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface TreeStats {
  totalNodes: number;
  maxDepth: number;
  collapsedNodes: number;
}

export interface CalculatedLayout {
  root: LayoutNode;
  nodeMap: Map<NodeId, LayoutNode>;
  connections: ConnectionLine[];
  boundingBox: TreeBoundingBox;
  stats: TreeStats;
}

export interface SearchResult {
  nodeId: NodeId;
  title: string;
  snippet?: string;
  path: string[];
}
