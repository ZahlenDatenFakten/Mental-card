import LZString from 'lz-string';
import { MindNode } from '../types/mindmap';

/**
 * Encodes a MindNode tree into a compressed URL-safe string.
 */
export function encodeTreeToShareString(root: MindNode): string {
  try {
    const jsonStr = JSON.stringify(root);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error('Failed to compress tree for sharing', err);
    return '';
  }
}

/**
 * Decodes a MindNode tree from a compressed URL-safe string.
 */
export function decodeTreeFromShareString(compressedStr: string): MindNode | null {
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(compressedStr);
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.id && parsed.title) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to decompress tree from URL', err);
    return null;
  }
}

/**
 * Generates full shareable URL with the case embedded in the URL hash.
 */
export function generateShareUrl(root: MindNode): string {
  const compressed = encodeTreeToShareString(root);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#case=${compressed}`;
}

/**
 * Checks URL hash or search params on application start to load shared case.
 */
export function loadSharedCaseFromUrl(): MindNode | null {
  if (typeof window === 'undefined') return null;

  // Check URL hash first (#case=...)
  const hash = window.location.hash;
  if (hash && hash.includes('case=')) {
    const match = hash.match(/case=([^&]+)/);
    if (match && match[1]) {
      return decodeTreeFromShareString(match[1]);
    }
  }

  // Check query param (?case=...)
  const params = new URLSearchParams(window.location.search);
  const caseParam = params.get('case');
  if (caseParam) {
    return decodeTreeFromShareString(caseParam);
  }

  return null;
}
