'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
    useReactFlow,
    type Node,
    type Edge,
    type OnConnect,
    type NodeTypes,
    type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Dendros, GraphNode, GraphEdge, NodeType, NodeData, EdgeCondition } from '@/types/graph';
import { nodeTypes } from '@/components/Editor/Nodes';
import { edgeTypes } from '@/components/Editor/Edges';
import NodePalette from '@/components/Editor/NodePalette';
import NodeEditModal from '@/components/Editor/NodeEditModal';
import EdgeEditModal from '@/components/Editor/EdgeEditModal';
import ConfirmDialog from '@/components/Editor/ConfirmDialog';
import InlineEdgeLabelEditor from '@/components/Editor/InlineEdgeLabelEditor';


interface EditorCanvasProps {
    dendros: Dendros;
    onGraphChange?: (updatedDendros: Dendros) => void;
}

// Inner component that uses useReactFlow hook
function EditorCanvasInner({ dendros, onGraphChange }: EditorCanvasProps) {
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
    const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
    const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);

    // Selection state for keyboard deletion
    const [currentSelection, setCurrentSelection] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });

    // Visual connection feedback
    const [isConnecting, setIsConnecting] = useState(false);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    // Inline edge label editing
    const [inlineEdgeEdit, setInlineEdgeEdit] = useState<{ edgeId: string; position: { x: number; y: number }; label: string } | null>(null);

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

    // Add new node (with optional position)
    const handleAddNode = useCallback((type: NodeType, position?: { x: number; y: number }) => {
        const newId = `node_${Date.now()}`;
        const newNode: Node = {
            id: newId,
            type,
            position: position || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
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

    // Inline edge label editing on double-click
    const handleEdgeDoubleClick = useCallback((event: any, edge: Edge) => {
        // Calculate position from event
        const position = {
            x: event.clientX,
            y: event.clientY,
        };

        setInlineEdgeEdit({
            edgeId: edge.id,
            position,
            label: edge.label as string || '',
        });
    }, []);

    // Save inline edge label
    const handleSaveInlineEdgeLabel = useCallback((newLabel: string) => {
        if (!inlineEdgeEdit) return;

        const updatedEdges = edges.map((e) =>
            e.id === inlineEdgeEdit.edgeId
                ? { ...e, label: newLabel }
                : e
        );
        setEdges(updatedEdges);
        notifyGraphChange(nodes, updatedEdges);
        setInlineEdgeEdit(null);
    }, [inlineEdgeEdit, edges, nodes, setEdges, notifyGraphChange]);

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

    // Handle Selection Change
    const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
        setCurrentSelection({
            nodes: params.nodes,
            edges: params.edges,
        });
    }, []);

    // Perform the deletion after confirmation
    const confirmDeleteSelection = useCallback(() => {
        const nodesToDelete = currentSelection.nodes.map(n => n.id);
        const edgesToDelete = currentSelection.edges.map(e => e.id);

        let updatedNodes = [...nodes];
        let updatedEdges = [...edges];

        if (nodesToDelete.length > 0) {
            updatedNodes = updatedNodes.filter(n => !nodesToDelete.includes(n.id));
            // Also remove edges connected to deleted nodes
            updatedEdges = updatedEdges.filter(e => !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target));
        }

        if (edgesToDelete.length > 0) {
            updatedEdges = updatedEdges.filter(e => !edgesToDelete.includes(e.id));
        }

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        notifyGraphChange(updatedNodes, updatedEdges);
        setDeleteConfirm({ isOpen: false, title: '', message: '' });
    }, [currentSelection, nodes, edges, setNodes, setEdges, notifyGraphChange]);

    // Keyboard shortcuts for deletion and node creation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input is focused
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement as HTMLElement)?.tagName)) {
                return;
            }

            // Delete/Backspace for deletion
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const totalSelected = currentSelection.nodes.length + currentSelection.edges.length;
                if (totalSelected > 0) {
                    e.preventDefault();
                    setDeleteConfirm({
                        isOpen: true,
                        title: 'Delete Selected Items',
                        message: `Are you sure you want to delete ${totalSelected} selected item(s)? This action cannot be undone.`
                    });
                }
                return;
            }

            // Quick node creation shortcuts
            const centerPosition = { x: 250, y: 250 };
            const key = e.key.toLowerCase();
            switch (key) {
                case 'q':
                    handleAddNode('question', centerPosition);
                    break;
                case 'i':
                case 'ı': // Turkish lowercase i
                    handleAddNode('info', centerPosition);
                    break;
                case 'l':
                    handleAddNode('logic', centerPosition);
                    break;
                case 'e':
                    handleAddNode('end', centerPosition);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSelection, handleAddNode]);

    // Drag and drop handler
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();

        const type = e.dataTransfer.getData('application/reactflow') as NodeType;
        if (!type) return;

        const position = screenToFlowPosition({
            x: e.clientX,
            y: e.clientY,
        });

        handleAddNode(type, position);
    }, [screenToFlowPosition, handleAddNode]);

    // Visual connection feedback
    const onConnectStart = useCallback(() => {
        setIsConnecting(true);
    }, []);

    const onConnectEnd = useCallback(() => {
        setIsConnecting(false);
    }, []);



    return (
        <div
            className="w-full h-full relative"
            ref={reactFlowWrapper}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onNodeDoubleClick={handleNodeDoubleClick}
                onEdgeClick={handleEdgeClick}
                onEdgeDoubleClick={handleEdgeDoubleClick}
                onSelectionChange={onSelectionChange}
                deleteKeyCode={null} // Disable default delete behavior
                nodeTypes={nodeTypes as unknown as NodeTypes}
                edgeTypes={edgeTypes as any}
                fitView
                className={`bg-slate-950 ${isConnecting ? 'cursor-crosshair' : ''}`}
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
                    className="bg-slate-900/80 backdrop-blur-lg border border-purple-500/30 rounded-lg"
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'root':
                                return '#059669'; // Darker emerald
                            case 'question':
                                return '#2563eb'; // Darker blue
                            case 'logic':
                                return '#d97706'; // Darker amber
                            case 'end':
                                return '#dc2626'; // Darker red
                            case 'info':
                                return '#0f766e'; // Darker teal
                            default:
                                return '#7c3aed'; // Darker purple
                        }
                    }}
                    nodeStrokeColor={(node) => {
                        return node.type === 'info' ? '#14b8a6' : '#10b981';
                    }}
                    nodeStrokeWidth={2}
                    maskColor="rgba(15, 23, 42, 0.7)"
                    style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
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

            {/* Keyboard Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={deleteConfirm.title}
                message={deleteConfirm.message}
                onConfirm={confirmDeleteSelection}
                onCancel={() => setDeleteConfirm({ isOpen: false, title: '', message: '' })}
                confirmText="Delete"
                type="danger"
            />

            {/* Inline Edge Label Editor */}
            {inlineEdgeEdit && (
                <InlineEdgeLabelEditor
                    initialLabel={inlineEdgeEdit.label}
                    position={inlineEdgeEdit.position}
                    onSave={handleSaveInlineEdgeLabel}
                    onCancel={() => setInlineEdgeEdit(null)}
                />
            )}
        </div>
    );
}

// Wrapper component with ReactFlowProvider
export default function EditorCanvas(props: EditorCanvasProps) {
    return (
        <ReactFlowProvider>
            <EditorCanvasInner {...props} />
        </ReactFlowProvider>
    );
}
