'use client';

import { useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    type Node,
    type Edge,
    type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Dendros } from '@/types/graph';
import { nodeTypes } from '@/components/Editor/Nodes';

interface EditorCanvasProps {
    dendros: Dendros;
}

export default function EditorCanvas({ dendros }: EditorCanvasProps) {
    // Convert Dendros graph to React Flow format
    const initialNodes: Node[] = dendros.graph.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position || { x: 0, y: 0 },
        data: node.data,
    }));

    const initialEdges: Edge[] = dendros.graph.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
    }));

    const [nodes, , onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

    const onConnect: OnConnect = useCallback(
        (connection) => {
            setEdges((eds) => addEdge(connection, eds));
        },
        [setEdges]
    );

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-950"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    size={1}
                    color="#6366f1"
                    className="opacity-30"
                />
                <Controls
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg"
                    showInteractive={false}
                />
                <MiniMap
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg"
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'root':
                                return '#10b981';
                            case 'question':
                                return '#3b82f6';
                            case 'logic':
                                return '#f59e0b';
                            case 'end':
                                return '#ef4444';
                            default:
                                return '#6366f1';
                        }
                    }}
                />
            </ReactFlow>
        </div>
    );
}
