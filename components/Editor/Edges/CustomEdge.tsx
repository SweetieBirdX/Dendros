import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react';

function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label,
    selected,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            {/* Invisible wider path for easier clicking */}
            <BaseEdge
                id={`${id}-hitarea`}
                path={edgePath}
                style={{
                    stroke: 'transparent',
                    strokeWidth: 20,
                    cursor: 'pointer',
                }}
            />
            {/* Visible edge with glow effect */}
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    stroke: selected ? '#a855f7' : '#6366f1',
                    strokeWidth: selected ? 3 : 2,
                    filter: selected ? 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.6))' : 'none',
                }}
                className="transition-all duration-200 hover:!stroke-purple-400"
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className={`
              px-3 py-1 rounded-md text-xs font-semibold
              bg-purple-500/90 text-white
              border border-purple-400/50
              shadow-lg backdrop-blur-sm
              ${selected ? 'ring-2 ring-purple-400' : ''}
              transition-all duration-200
              hover:bg-purple-500
              cursor-pointer
            `}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export default memo(CustomEdge);
