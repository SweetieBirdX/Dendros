'use client';

import { useCallback, useState } from 'react';
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
    type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Dendros, GraphNode, GraphEdge, NodeType, NodeData, EdgeCondition } from '@/types/graph';
import { nodeTypes } from '@/components/Editor/Nodes';
import { edgeTypes } from '@/components/Editor/Edges';
import NodePalette from '@/components/Editor/NodePalette';
import NodeEditModal from '@/components/Editor/NodeEditModal';
import EdgeEditModal from '@/components/Editor/EdgeEditModal';

interface EditorCanvasProps {
    dendros: Dendros;
    onGraphChange?: (updatedDendros: Dendros) => void;
}

export default function EditorCanvas({ dendros, onGraphChange }: EditorCanvasProps) {
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);

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
        data: edge.condition,
    }));

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

    // Helper to notify parent of changes
    const notifyGraphChange = useCallback((updatedNodes: Node[], updatedEdges: Edge[]) => {
        if (!onGraphChange) return;

        const graphNodes: GraphNode[] = updatedNodes.map(node => ({
            id: node.id,
            type: node.type as NodeType,
            data: node.data as unknown as NodeData,
            position: node.position,
        }));

        const graphEdges: GraphEdge[] = updatedEdges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label as string || '',
            condition: (edge.data as unknown as EdgeCondition) || { type: 'always' },
        }));

        const updatedDendros: Dendros = {
            ...dendros,
            graph: {
                nodes: graphNodes,
                edges: graphEdges,
            },
        };

        onGraphChange(updatedDendros);
    }, [dendros, onGraphChange]);

    const onConnect: OnConnect = useCallback(
        (connection) => {
            const newEdge = {
                ...connection,
                id: `edge_${Date.now()}`,
                label: 'New Connection',
            };
            const updatedEdges = addEdge(newEdge, edges as any);
            setEdges(updatedEdges);
            notifyGraphChange(nodes, updatedEdges as any);
        },
        [setEdges, edges, nodes, notifyGraphChange]
    );

    // Add new node
    const handleAddNode = useCallback((type: NodeType) => {
        const newId = `node_${Date.now()}`;
        const newNode: Node = {
            id: newId,
            type,
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: {
                label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            },
        };

        const updatedNodes = [...nodes, newNode];
        setNodes(updatedNodes);
        notifyGraphChange(updatedNodes, edges);
    }, [setNodes, nodes, edges, notifyGraphChange]);

    // Open node edit modal on double-click
    const handleNodeDoubleClick = useCallback((_event: any, node: Node) => {
        const graphNode: GraphNode = {
            id: node.id,
            type: node.type as NodeType,
            data: node.data as unknown as NodeData,
            position: node.position,
        };
        setSelectedNode(graphNode);
        setIsNodeModalOpen(true);
    }, []);

    // Open edge edit modal on click
    const handleEdgeClick = useCallback((_event: any, edge: Edge) => {
        const graphEdge: GraphEdge = {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label as string || '',
            condition: edge.data as unknown as EdgeCondition || { type: 'always' },
        };
        setSelectedEdge(graphEdge);
        setIsEdgeModalOpen(true);
    }, []);

    // Save edited node
    const handleSaveNode = useCallback((updatedNode: GraphNode) => {
        const updatedNodes = nodes.map((n) =>
            n.id === updatedNode.id
                ? {
                    ...n,
                    data: updatedNode.data,
                }
                : n
        );
        setNodes(updatedNodes);
        notifyGraphChange(updatedNodes, edges);
    }, [setNodes, nodes, edges, notifyGraphChange]);

    // Save edited edge
    const handleSaveEdge = useCallback((updatedEdge: GraphEdge) => {
        const updatedEdges = edges.map((e) =>
            e.id === updatedEdge.id
                ? {
                    ...e,
                    label: updatedEdge.label,
                    data: updatedEdge.condition,
                }
                : e
        );
        setEdges(updatedEdges);
        notifyGraphChange(nodes, updatedEdges);
    }, [setEdges, edges, nodes, notifyGraphChange]);

    // Delete node
    const handleDeleteNode = useCallback((nodeId: string) => {
        const updatedNodes = nodes.filter((n) => n.id !== nodeId);
        const updatedEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        setNodes(updatedNodes);
        setEdges(updatedEdges);
        notifyGraphChange(updatedNodes, updatedEdges);
    }, [setNodes, setEdges, nodes, edges, notifyGraphChange]);

    // Delete edge
    const handleDeleteEdge = useCallback((edgeId: string) => {
        const updatedEdges = edges.filter((e) => e.id !== edgeId);
        setEdges(updatedEdges);
        notifyGraphChange(nodes, updatedEdges);
    }, [setEdges, edges, nodes, notifyGraphChange]);

    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={handleNodeDoubleClick}
                onEdgeClick={handleEdgeClick}
                nodeTypes={nodeTypes as unknown as NodeTypes}
                edgeTypes={edgeTypes as any}
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

            {/* Node Palette */}
            <NodePalette onAddNode={handleAddNode} />

            {/* Node Edit Modal */}
            <NodeEditModal
                node={selectedNode}
                isOpen={isNodeModalOpen}
                onClose={() => {
                    setIsNodeModalOpen(false);
                    setSelectedNode(null);
                }}
                onSave={handleSaveNode}
                onDelete={handleDeleteNode}
            />

            {/* Edge Edit Modal */}
            <EdgeEditModal
                edge={selectedEdge}
                isOpen={isEdgeModalOpen}
                onClose={() => {
                    setIsEdgeModalOpen(false);
                    setSelectedEdge(null);
                }}
                onSave={handleSaveEdge}
                onDelete={handleDeleteEdge}
            />
        </div>
    );
}
