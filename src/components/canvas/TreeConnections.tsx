import React from 'react';
import { ConnectionLine, NodeId } from '../../types/mindmap';

interface TreeConnectionsProps {
  connections: ConnectionLine[];
  selectedId: NodeId | null;
}

export const TreeConnections: React.FC<TreeConnectionsProps> = ({
  connections,
  selectedId,
}) => {
  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <defs>
        <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.4" />
        </filter>
      </defs>

      {connections.map((conn) => {
        const isSelectedBranch = selectedId === conn.sourceId || selectedId === conn.targetId;
        const strokeColor = isSelectedBranch ? (conn.color || '#10b981') : '#3f3f46';
        const strokeWidth = isSelectedBranch ? 2.5 : 1.75;
        const opacity = isSelectedBranch ? 1.0 : 0.65;

        return (
          <g key={conn.id} className="transition-all duration-200">
            {/* Wider invisible hit area if needed */}
            <path
              d={conn.path}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
            />
            {/* Visible Bezier Curve */}
            <path
              d={conn.path}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
              style={{
                filter: isSelectedBranch ? 'url(#line-glow)' : 'none',
                transition: 'stroke 150ms ease-out, stroke-width 150ms ease-out, opacity 150ms ease-out',
              }}
            />
          </g>
        );
      })}
    </svg>
  );
};
