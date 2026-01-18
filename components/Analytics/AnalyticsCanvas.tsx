'use client';

import { useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    BackgroundVariant,
    type Node,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Dendros, Submission } from '@/types/graph';
import { nodeTypes } from '@/components/Editor/Nodes';
import AnalyticsEdge from './AnalyticsEdge';

interface AnalyticsCanvasProps {
    dendros: Dendros;
    submissions: Submission[];
}

interface EdgeStats {
    edgeId: string;
    count: number;
    percentage: number;
    sourceNodeId: string;
}

export default function AnalyticsCanvas({ dendros, submissions }: AnalyticsCanvasProps) {
    // Calculate edge statistics from submissions
    const edgeStats = useMemo(() => {
        const edgeTraversalCounts = new Map<string, number>();
        const nodeExitCounts = new Map<string, number>();

        // Count how many times each edge was traversed
        submissions.forEach(submission => {
            for (let i = 0; i < submission.path.length - 1; i++) {
                const fromNode = submission.path[i].nodeId;
                const toNode = submission.path[i + 1].nodeId;

                // Find edge between these nodes
                const edge = dendros.graph.edges.find(e =>
                    e.source === fromNode && e.target === toNode
                );

                if (edge) {
                    edgeTraversalCounts.set(edge.id, (edgeTraversalCounts.get(edge.id) || 0) + 1);
                    nodeExitCounts.set(fromNode, (nodeExitCounts.get(fromNode) || 0) + 1);
                }
            }
        });

        // Calculate percentages for each edge
        const stats: EdgeStats[] = dendros.graph.edges.map(edge => {
            const count = edgeTraversalCounts.get(edge.id) || 0;
            const totalFromSource = nodeExitCounts.get(edge.source) || 1;
            const percentage = totalFromSource > 0 ? Math.round((count / totalFromSource) * 100) : 0;

            return {
                edgeId: edge.id,
                count,
                percentage,
                sourceNodeId: edge.source,
            };
        });

        return stats;
    }, [dendros.graph.edges, submissions]);

    // Find max count for stroke width calculation
    const maxCount = useMemo(() => {
        return Math.max(...edgeStats.map(s => s.count), 1);
    }, [edgeStats]);

    // Convert Dendros graph to React Flow format
    const nodes: Node[] = useMemo(() => {
        return dendros.graph.nodes.map(node => ({
            id: node.id,
            type: node.type,
            position: node.position || { x: 0, y: 0 },
            data: node.data,
        }));
    }, [dendros.graph.nodes]);

    const edges: Edge[] = useMemo(() => {
        return dendros.graph.edges.map(edge => {
            const stats = edgeStats.find(s => s.edgeId === edge.id);

            return {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'analytics',
                data: {
                    count: stats?.count || 0,
                    percentage: stats?.percentage || 0,
                    maxCount: maxCount,
                },
            };
        });
    }, [dendros.graph.edges, edgeStats, maxCount]);

    const edgeTypes = {
        analytics: AnalyticsEdge,
    };

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes as any}
                edgeTypes={edgeTypes}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                panOnDrag={true}
                zoomOnScroll={true}
                className="bg-slate-950"
                minZoom={0.1}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    size={1}
                    color="#404040"
                />
                <Controls />
            </ReactFlow>
        </div>
    );
}
