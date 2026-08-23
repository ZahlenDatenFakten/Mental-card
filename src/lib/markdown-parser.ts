import { MindNode } from '../types/mindmap';

/**
 * Generates a unique node ID.
 */
export function generateNodeId(): string {
  return 'node_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

interface ParsedLine {
  level: number;
  title: string;
  url?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  notes?: string;
}

/**
 * Parses markdown text lines with tabs or spaces into a structured tree.
 * Supports:
 * - # Header (root)
 * - - Bullet points (children)
 * - * Bullet points
 * - 1. Numbered lists
 * - [Link text](https://...)
 * - #tags
 * - !high, !medium, !low priority markers
 */
export function parseMarkdownToTree(markdown: string): MindNode {
  const lines = markdown.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    return {
      id: generateNodeId(),
      title: 'Новая ментальная карта',
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  const parsedLines: ParsedLine[] = [];

  for (const rawLine of lines) {
    // Count leading tabs or 2-space increments
    let indentLevel = 0;
    let stripped = rawLine;

    // Detect indentation
    const matchIndent = rawLine.match(/^(\s+)/);
    if (matchIndent) {
      const whitespace = matchIndent[1];
      const tabs = (whitespace.match(/\t/g) || []).length;
      const spaces = (whitespace.match(/ /g) || []).length;
      indentLevel = tabs + Math.floor(spaces / 2);
      stripped = rawLine.trimStart();
    }

    // Check markdown header level # / ## / ###
    const headerMatch = stripped.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      indentLevel = headerMatch[1].length - 1;
      stripped = headerMatch[2];
    } else {
      // Strip bullet symbols: -, *, +, 1.
      stripped = stripped.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '');
    }

    // Extract URL if markdown link [title](url)
    let url: string | undefined;
    const linkMatch = stripped.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    if (linkMatch) {
      stripped = stripped.replace(linkMatch[0], linkMatch[1]);
      url = linkMatch[2];
    }

    // Extract tags: #tagname
    const tags: string[] = [];
    const tagMatches = stripped.match(/#([\w\u0400-\u04FF_-]+)/g);
    if (tagMatches) {
      for (const t of tagMatches) {
        tags.push(t.substring(1));
        stripped = stripped.replace(t, '');
      }
    }

    // Extract priority: !high, !medium, !low or !высокий, !средний, !низкий
    let priority: 'low' | 'medium' | 'high' | undefined;
    if (stripped.includes('!high') || stripped.includes('!высокий')) {
      priority = 'high';
      stripped = stripped.replace(/!(high|высокий)/g, '');
    } else if (stripped.includes('!medium') || stripped.includes('!средний')) {
      priority = 'medium';
      stripped = stripped.replace(/!(medium|средний)/g, '');
    } else if (stripped.includes('!low') || stripped.includes('!низкий')) {
      priority = 'low';
      stripped = stripped.replace(/!(low|низкий)/g, '');
    }

    const title = stripped.trim();
    if (title) {
      parsedLines.push({
        level: indentLevel,
        title,
        url,
        priority,
        tags: tags.length > 0 ? tags : undefined,
      });
    }
  }

  if (parsedLines.length === 0) {
    return {
      id: generateNodeId(),
      title: 'Новая ментальная карта',
      children: [],
    };
  }

  // Build tree hierarchy using stack
  const rootNode: MindNode = {
    id: generateNodeId(),
    title: parsedLines[0].title,
    url: parsedLines[0].url,
    priority: parsedLines[0].priority,
    tags: parsedLines[0].tags,
    children: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const stack: { node: MindNode; level: number }[] = [{ node: rootNode, level: parsedLines[0].level }];

  for (let i = 1; i < parsedLines.length; i++) {
    const item = parsedLines[i];
    const newNode: MindNode = {
      id: generateNodeId(),
      title: item.title,
      url: item.url,
      priority: item.priority,
      tags: item.tags,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Pop from stack until top has lower level
    while (stack.length > 1 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(newNode);
    stack.push({ node: newNode, level: item.level });
  }

  return rootNode;
}

/**
 * Converts a MindNode tree back into clean, formatted Markdown.
 */
export function exportTreeToMarkdown(root: MindNode): string {
  const lines: string[] = [];

  function traverse(node: MindNode, depth: number) {
    const indent = '  '.repeat(depth);
    let line = `${indent}- ${node.title}`;

    if (node.url) {
      line += ` [Ссылка](${node.url})`;
    }
    if (node.priority) {
      line += ` !${node.priority}`;
    }
    if (node.tags && node.tags.length > 0) {
      line += ' ' + node.tags.map((t) => `#${t}`).join(' ');
    }
    if (node.notes) {
      line += ` <!-- ${node.notes.replace(/\n/g, ' ')} -->`;
    }

    lines.push(line);

    if (node.children) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(root, 0);
  return lines.join('\n');
}
