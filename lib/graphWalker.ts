/**
 * Graph Walker - The Core Logic Engine
 * 
 * This module contains pure functions for traversing the Dendros graph.
 * The Graph Walker determines the next node based on the current position
 * and user input, without any side effects.
 */

import type {
    DendrosGraph,
    GraphNode,
    GraphEdge,
    UserAnswer,
    TraversalResult,
    EdgeCondition,
    NodeType,
} from '@/types/graph';

/**
 * Find a node by its ID in the graph
 */
function findNodeById(graph: DendrosGraph, nodeId: string): GraphNode | null {
    return graph.nodes.find(node => node.id === nodeId) || null;
}

/**
 * Find all edges originating from a specific node
 */
function findOutgoingEdges(graph: DendrosGraph, nodeId: string): GraphEdge[] {
    return graph.edges.filter(edge => edge.source === nodeId);
}

/**
 * Evaluate if an edge condition matches the user's answer
 */
function evaluateCondition(
    condition: EdgeCondition | undefined,
    userAnswer: UserAnswer
): boolean {
    // If no condition, this is a default/always path
    if (!condition) {
        return true;
    }

    const { type, value, pattern } = condition;

    switch (type) {
        case 'always':
            return true;

        case 'exact':
            // Exact match comparison
            if (typeof userAnswer === 'string' || typeof userAnswer === 'number') {
                return userAnswer === value;
            }
            // For array answers (checkboxes), check if it contains the value
            if (Array.isArray(userAnswer) && typeof value === 'string') {
                return userAnswer.includes(value);
            }
            return false;

        case 'contains':
            // Substring match (case-insensitive)
            if (typeof userAnswer === 'string' && typeof value === 'string') {
                return userAnswer.toLowerCase().includes(value.toLowerCase());
            }
            return false;

        case 'range':
            // Numeric range check
            if (typeof userAnswer === 'number' && Array.isArray(value) && value.length === 2) {
                const [min, max] = value;
                return userAnswer >= min && userAnswer <= max;
            }
            return false;

        case 'regex':
            // Regular expression match
            if (typeof userAnswer === 'string' && pattern) {
                try {
                    const regex = new RegExp(pattern);
                    return regex.test(userAnswer);
                } catch (error) {
                    console.error('Invalid regex pattern:', pattern, error);
                    return false;
                }
            }
            return false;

        default:
            return false;
    }
}

/**
 * Find the next node based on current node and user answer
 * 
 * This is the main Graph Walker function - pure and testable.
 * 
 * @param currentNodeId - The ID of the current node
 * @param userAnswer - The user's answer/input
 * @param graph - The complete graph structure
 * @returns TraversalResult with next node ID or completion status
 */
export function getNextNode(
    currentNodeId: string,
    userAnswer: UserAnswer,
    graph: DendrosGraph
): TraversalResult {
    // Find the current node
    const currentNode = findNodeById(graph, currentNodeId);

    if (!currentNode) {
        return {
            nextNodeId: null,
            isComplete: false,
            error: `Node with ID "${currentNodeId}" not found in graph`,
        };
    }

    // If current node is an end node, the flow is complete
    if (currentNode.type === 'end') {
        return {
            nextNodeId: null,
            isComplete: true,
        };
    }

    // Find all outgoing edges from current node
    const outgoingEdges = findOutgoingEdges(graph, currentNodeId);

    if (outgoingEdges.length === 0) {
        return {
            nextNodeId: null,
            isComplete: false,
            error: `No outgoing edges found from node "${currentNodeId}"`,
        };
    }

    // Find the first edge whose condition matches the user's answer
    const matchingEdge = outgoingEdges.find(edge => {
        const matches = evaluateCondition(edge.condition, userAnswer);
        return matches;
    });

    if (!matchingEdge) {
        return {
            nextNodeId: null,
            isComplete: false,
            error: `No matching edge found for answer "${userAnswer}" from node "${currentNodeId}"`,
        };
    }

    // Verify the target node exists
    const targetNode = findNodeById(graph, matchingEdge.target);

    if (!targetNode) {
        return {
            nextNodeId: null,
            isComplete: false,
            error: `Target node "${matchingEdge.target}" not found in graph`,
        };
    }

    // Success! Return the next node
    return {
        nextNodeId: matchingEdge.target,
        isComplete: targetNode.type === 'end',
    };
}

/**
 * Get the starting node of a graph (first root node)
 */
export function getStartNode(graph: DendrosGraph): GraphNode | null {
    return graph.nodes.find(node => node.type === 'root') || null;
}

/**
 * Validate if a graph has a valid starting point
 */
export function hasValidStart(graph: DendrosGraph): boolean {
    const rootNodes = graph.nodes.filter(node => node.type === 'root');
    return rootNodes.length === 1; // Should have exactly one root node
}

/**
 * Get all possible next nodes from current position
 * (useful for previewing available paths)
 */
export function getPossibleNextNodes(
    currentNodeId: string,
    graph: DendrosGraph
): GraphNode[] {
    const outgoingEdges = findOutgoingEdges(graph, currentNodeId);
    const nextNodeIds = outgoingEdges.map(edge => edge.target);

    return nextNodeIds
        .map(id => findNodeById(graph, id))
        .filter((node): node is GraphNode => node !== null);
}

/**
 * Check if a specific path exists between two nodes
 */
export function pathExists(
    fromNodeId: string,
    toNodeId: string,
    graph: DendrosGraph
): boolean {
    const outgoingEdges = findOutgoingEdges(graph, fromNodeId);
    return outgoingEdges.some(edge => edge.target === toNodeId);
}
