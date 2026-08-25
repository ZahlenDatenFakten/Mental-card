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
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Apple Blue Selection Glow */}
        <filter id="apple-line-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#0A84FF" floodOpacity="0.6" />
        </filter>

        {/* Ambient Subtle Shadow for all connectors */}
        <filter id="ambient-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {connections.map((conn) => {
        const isSelectedBranch = selectedId === conn.sourceId || selectedId === conn.targetId;
        const strokeColor = isSelectedBranch ? (conn.color || '#0A84FF') : (conn.color ? `${conn.color}88` : '#52525b');
        const strokeWidth = isSelectedBranch ? 2.5 : 1.75;
        const opacity = isSelectedBranch ? 1.0 : 0.65;

        return (
          <g key={conn.id} className="transition-all duration-150">
            {/* Wider invisible path */}
            <path
              d={conn.path}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
            />

            {/* Ambient Background Line */}
            <path
              d={conn.path}
              fill="none"
              stroke="#000000"
              strokeWidth={strokeWidth + 1}
              strokeLinecap="round"
              opacity={0.3}
            />

            {/* Visible Vector Spline */}
            <path
              d={conn.path}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
              style={{
                filter: isSelectedBranch ? 'url(#apple-line-glow)' : 'none',
                transition: 'stroke 150ms ease-out, stroke-width 150ms ease-out, opacity 150ms ease-out',
              }}
            />
          </g>
        );
      })}
    </svg>
  );
};
