import { create } from 'zustand';
import type {
    Dendros,
    DendrosGraph,
    GraphNode,
    GraphEdge,
} from '@/types/graph';

interface GraphStore {
    currentDendros: Dendros | null;
    setCurrentDendros: (dendros: Dendros | null) => void;
    updateGraph: (graph: DendrosGraph) => void;
    addNode: (node: GraphNode) => void;
    removeNode: (nodeId: string) => void;
    updateNode: (nodeId: string, updates: Partial<GraphNode>) => void;
    addEdge: (edge: GraphEdge) => void;
    removeEdge: (edgeId: string) => void;
    updateEdge: (edgeId: string, updates: Partial<GraphEdge>) => void;
    reset: () => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
    currentDendros: null,

    setCurrentDendros: (dendros) => set({ currentDendros: dendros }),

    updateGraph: (graph) => set((state) => ({
        currentDendros: state.currentDendros
            ? { ...state.currentDendros, graph, updatedAt: new Date() }
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
                updatedAt: new Date(),
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
                updatedAt: new Date(),
            }
            : null,
    })),

    updateNode: (nodeId, updates) => set((state) => ({
        currentDendros: state.currentDendros
            ? {
                ...state.currentDendros,
                graph: {
                    ...state.currentDendros.graph,
                    nodes: state.currentDendros.graph.nodes.map((n) =>
                        n.id === nodeId ? { ...n, ...updates } : n
                    ),
                },
                updatedAt: new Date(),
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
                updatedAt: new Date(),
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
                updatedAt: new Date(),
            }
            : null,
    })),

    updateEdge: (edgeId, updates) => set((state) => ({
        currentDendros: state.currentDendros
            ? {
                ...state.currentDendros,
                graph: {
                    ...state.currentDendros.graph,
                    edges: state.currentDendros.graph.edges.map((e) =>
                        e.id === edgeId ? { ...e, ...updates } : e
                    ),
                },
                updatedAt: new Date(),
            }
            : null,
    })),

    reset: () => set({ currentDendros: null }),
}));
