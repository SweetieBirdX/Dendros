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
                    stroke: selected ? '#14B8A6' : '#06B6D4',
                    strokeWidth: selected ? 3 : 2,
                    filter: selected ? 'drop-shadow(0 0 4px rgba(20, 184, 166, 0.6))' : 'none',
                }}
                className="transition-all duration-200 hover:!stroke-[#14B8A6]"
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
              bg-white text-black
              border border-[#E5E5E5]
              hover:bg-[#E5E5E5]
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
