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
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    stroke: selected ? '#a855f7' : '#6366f1',
                    strokeWidth: selected ? 3 : 2,
                }}
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
