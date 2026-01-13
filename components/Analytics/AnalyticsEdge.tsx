import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react';

interface AnalyticsEdgeData {
    count: number;
    percentage: number;
    maxCount: number;
}

function AnalyticsEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
}: EdgeProps) {
    const edgeData = data as unknown as AnalyticsEdgeData;
    const { count = 0, percentage = 0, maxCount = 1 } = edgeData || {};

    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    // Calculate stroke width based on traffic (2-8px range)
    const calculateStrokeWidth = () => {
        if (count === 0) return 2;
        const ratio = count / maxCount;
        return 2 + (ratio * 6); // 2-8px
    };

    // Calculate color intensity based on traffic
    const getEdgeColor = () => {
        if (count === 0) return '#9333ea'; // purple-600 (dim)
        const ratio = count / maxCount;
        if (ratio > 0.7) return '#a855f7'; // purple-500 (bright)
        if (ratio > 0.4) return '#9333ea'; // purple-600
        return '#7c3aed'; // purple-700 (darker)
    };

    const strokeWidth = calculateStrokeWidth();
    const edgeColor = getEdgeColor();

    return (
        <>
            {/* Main edge path */}
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    stroke: edgeColor,
                    strokeWidth: strokeWidth,
                    opacity: count === 0 ? 0.3 : 0.9,
                }}
            />

            {/* Label with percentage and count */}
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className={`
                        px-3 py-1 rounded-md font-semibold
                        bg-purple-600/95 text-white
                        border border-purple-400/50
                        shadow-lg backdrop-blur-sm
                        ${count === 0 ? 'text-xs opacity-50' : 'text-sm'}
                        ${count > maxCount * 0.5 ? 'scale-110' : ''}
                        transition-all duration-200
                    `}
                    title={`${count} user${count !== 1 ? 's' : ''} took this path`}
                >
                    {percentage}% ({count})
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export default memo(AnalyticsEdge);
