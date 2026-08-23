import { CalculatedLayout, MindNode } from '../types/mindmap';

/**
 * Initiates a browser download for a blob or text content.
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Serializes the tree layout into a standalone, styled, high-quality SVG string.
 */
export function exportLayoutToSvgString(layout: CalculatedLayout): string {
  const { boundingBox, nodeMap, connections } = layout;
  const padding = 60;
  const width = boundingBox.width + padding * 2;
  const height = boundingBox.height + padding * 2;
  const offsetX = -boundingBox.minX + padding;
  const offsetY = -boundingBox.minY + padding;

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <!-- Background grid -->
    <pattern id="export-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="0.75" fill="#27272a" />
    </pattern>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#09090b"/>
  <rect width="100%" height="100%" fill="url(#export-grid)" opacity="0.6"/>

  <g transform="translate(${offsetX}, ${offsetY})">
    <!-- Connections -->
    <g class="connections">
`;

  // Draw Bezier connection paths
  for (const conn of connections) {
    const strokeColor = conn.color || '#52525b';
    svgContent += `      <path d="${conn.path}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" opacity="0.75" />\n`;
  }

  svgContent += `    </g>\n    <!-- Nodes -->\n    <g class="nodes">\n`;

  // Draw Nodes
  for (const node of nodeMap.values()) {
    const isRoot = node.isRoot;
    const bgColor = isRoot ? '#18181b' : '#18181b';
    const borderColor = node.color || (isRoot ? '#10b981' : '#3f3f46');
    const borderWidth = isRoot ? '2' : '1.5';
    const textColor = isRoot ? '#ffffff' : '#f4f4f5';
    const fontSize = isRoot ? '14' : '12';
    const fontWeight = isRoot ? '600' : '500';

    // Safe XML escaping for text
    const escapedTitle = node.title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    svgContent += `      <g class="node" transform="translate(${node.x}, ${node.y})">
        <rect width="${node.width}" height="${node.height}" rx="8" ry="8" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" filter="url(#shadow)" />
        ${node.color ? `<rect x="3" y="3" width="4" height="${node.height - 6}" rx="2" fill="${node.color}" />` : ''}
        <text x="${node.color ? 18 : 14}" y="${node.height / 2 + 4}" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}">${escapedTitle}</text>
      </g>\n`;
  }

  svgContent += `    </g>\n  </g>\n</svg>`;
  return svgContent;
}

/**
 * Exports the mental map to a PNG file with 2x scale for crisp retina display.
 */
export async function exportLayoutToPng(layout: CalculatedLayout, filename: string = 'mindmap.png') {
  const svgString = exportLayoutToSvgString(layout);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const scale = 2; // Hi-DPI 2x scale
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          downloadFile(blob, filename, 'image/png');
          resolve();
        } else {
          reject(new Error('PNG conversion failed'));
        }
      }, 'image/png');
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Exports mind node tree to JSON format.
 */
export function exportTreeToJson(root: MindNode, filename: string = 'mindmap.json') {
  const jsonString = JSON.stringify(root, null, 2);
  downloadFile(jsonString, filename, 'application/json');
}
