import { create } from 'zustand';

// Node types for the graph
export type NodeType = 'root' | 'question' | 'logic' | 'end';

export interface NodeData {
    label: string;
    type?: string;
    options?: string[];
    [key: string]: any;
}

export interface GraphNode {
    id: string;
    type: NodeType;
    data: NodeData;
    position?: { x: number; y: number };
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    condition?: string;
    label?: string;
}

export interface DendrosGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface Dendros {
    dendrosId: string;
    ownerId: string;
    config: {
        title: string;
        slug: string;
        description?: string;
    };
    graph: DendrosGraph;
    createdAt?: Date;
    updatedAt?: Date;
}

interface GraphStore {
    currentDendros: Dendros | null;
    setCurrentDendros: (dendros: Dendros | null) => void;
    updateGraph: (graph: DendrosGraph) => void;
    addNode: (node: GraphNode) => void;
    removeNode: (nodeId: string) => void;
    addEdge: (edge: GraphEdge) => void;
    removeEdge: (edgeId: string) => void;
    reset: () => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
    currentDendros: null,

    setCurrentDendros: (dendros) => set({ currentDendros: dendros }),

    updateGraph: (graph) => set((state) => ({
        currentDendros: state.currentDendros
            ? { ...state.currentDendros, graph }
            : null,
    })),

    addNode: (node) => set((state) => ({
        currentDendros: state.currentDendros
            ? {
                ...state.currentDendros,
                graph: {
                    ...state.currentDendros.graph,
                    nodes: [...state.currentDendros.graph.nodes, node],
                },
            }
            : null,
    })),

    removeNode: (nodeId) => set((state) => ({
        currentDendros: state.currentDendros
            ? {
                ...state.currentDendros,
                graph: {
                    nodes: state.currentDendros.graph.nodes.filter((n) => n.id !== nodeId),
                    edges: state.currentDendros.graph.edges.filter(
                        (e) => e.source !== nodeId && e.target !== nodeId
                    ),
                },
            }
            : null,
    })),

    addEdge: (edge) => set((state) => ({
        currentDendros: state.currentDendros
            ? {
                ...state.currentDendros,
                graph: {
                    ...state.currentDendros.graph,
                    edges: [...state.currentDendros.graph.edges, edge],
                },
            }
            : null,
    })),

    removeEdge: (edgeId) => set((state) => ({
        currentDendros: state.currentDendros
            ? {
                ...state.currentDendros,
                graph: {
                    ...state.currentDendros.graph,
                    edges: state.currentDendros.graph.edges.filter((e) => e.id !== edgeId),
                },
            }
            : null,
    })),

    reset: () => set({ currentDendros: null }),
}));
