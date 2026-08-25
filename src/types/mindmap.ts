export type NodeId = string;

export type PriorityLevel = 'low' | 'medium' | 'high';

export type LegalNodeType =
  | 'thesis'        // Тезис / Позиция стороны
  | 'fact_timeline' // Событие хронологии / Факт фабулы дела
  | 'norm'          // Норма права / Статья закона / Судебная практика
  | 'evidence'      // Доказательство / Документ
  | 'counter_arg'   // Контраргумент оппонента
  | 'rebuttal'      // Опровержение
  | 'risk'          // Риск / Слабое место
  | 'remedy'        // Исковое требование / Просительная часть
  | 'general';      // Общий узел

export type EvidenceStatus = 'attached' | 'motion_pending' | 'to_request' | 'excluded';

export type EvidenceType = 'written' | 'expertise' | 'witness' | 'audio_video' | 'electronic';

export interface LegalMetadata {
  nodeType?: LegalNodeType;
  lawArticle?: string;       // Например: "ст. 309, 310, 395 ГК РФ"
  caseVolume?: string;       // Например: "т. 1"
  casePages?: string;        // Например: "л.д. 42-45"
  evidenceStatus?: EvidenceStatus;
  evidenceType?: EvidenceType;
  eventDate?: string;        // Формат: "2024-05-15" или "15.05.2024"
  eventTime?: string;
  strengthScore?: number;    // 1-5
  opponentStance?: string;   // Позиция оппонента
  citation?: string;         // Цитата из нормы права / судебного акта
}

export interface MindNode extends LegalMetadata {
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

export interface LayoutNode extends LegalMetadata {
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
  thesesCount: number;
  evidenceCount: number;
  normsCount: number;
  eventsCount: number;
  risksCount: number;
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
  nodeType?: LegalNodeType;
  lawArticle?: string;
  eventDate?: string;
}

export interface TimelineEvent {
  nodeId: NodeId;
  title: string;
  date: string;
  time?: string;
  notes?: string;
  evidenceTitle?: string;
  casePages?: string;
  nodeType: LegalNodeType;
}

export interface CaseTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  data: MindNode;
}
