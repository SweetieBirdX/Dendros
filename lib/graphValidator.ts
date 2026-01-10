/**
 * Graph Validator - Cycle Detection & Validation
 * 
 * This module contains functions to validate graph integrity,
 * detect cycles, and ensure the graph is well-formed.
 */

import type {
    DendrosGraph,
    GraphNode,
    GraphEdge,
    ValidationResult,
    ValidationError,
} from '@/types/graph';

/**
 * Detect cycles in the graph using Depth-First Search (DFS)
 * 
 * A cycle exists if we can reach a node that's already in our current path.
 * This uses the "white-gray-black" algorithm:
 * - White: unvisited
 * - Gray: currently being explored (in current path)
 * - Black: fully explored
 */
export function detectCycles(graph: DendrosGraph): boolean {
    const visited = new Set<string>(); // Black nodes
    const inPath = new Set<string>(); // Gray nodes

    function dfs(nodeId: string): boolean {
        // If node is in current path, we found a cycle
        if (inPath.has(nodeId)) {
            return true;
        }

        // If already fully explored, skip
        if (visited.has(nodeId)) {
            return false;
        }

        // Mark as being explored (gray)
        inPath.add(nodeId);

        // Get all outgoing edges
        const outgoingEdges = graph.edges.filter(edge => edge.source === nodeId);

        // Explore all neighbors
        for (const edge of outgoingEdges) {
            if (dfs(edge.target)) {
                return true; // Cycle found
            }
        }

        // Done exploring this node
        inPath.delete(nodeId);
        visited.add(nodeId); // Mark as fully explored (black)

        return false;
    }

    // Check from all nodes (handles disconnected graphs)
    for (const node of graph.nodes) {
        if (!visited.has(node.id)) {
            if (dfs(node.id)) {
                return true; // Cycle detected
            }
        }
    }

    return false; // No cycles
}

/**
 * Find all cycles in the graph and return the paths
 */
export function findCycles(graph: DendrosGraph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const inPath = new Set<string>();
    const currentPath: string[] = [];

    function dfs(nodeId: string): void {
        if (inPath.has(nodeId)) {
            // Found a cycle - extract it from current path
            const cycleStart = currentPath.indexOf(nodeId);
            const cycle = currentPath.slice(cycleStart);
            cycle.push(nodeId); // Complete the cycle
            cycles.push(cycle);
            return;
        }

        if (visited.has(nodeId)) {
            return;
        }

        inPath.add(nodeId);
        currentPath.push(nodeId);

        const outgoingEdges = graph.edges.filter(edge => edge.source === nodeId);
        for (const edge of outgoingEdges) {
            dfs(edge.target);
        }

        currentPath.pop();
        inPath.delete(nodeId);
        visited.add(nodeId);
    }

    for (const node of graph.nodes) {
        if (!visited.has(node.id)) {
            dfs(node.id);
        }
    }

    return cycles;
}

/**
 * Find orphaned nodes (nodes with no incoming or outgoing edges)
 */
export function findOrphanedNodes(graph: DendrosGraph): GraphNode[] {
    const orphans: GraphNode[] = [];

    for (const node of graph.nodes) {
        // Skip root and end nodes (they're allowed to have no incoming/outgoing edges)
        if (node.type === 'root' || node.type === 'end') {
            continue;
        }

        const hasIncoming = graph.edges.some(edge => edge.target === node.id);
        const hasOutgoing = graph.edges.some(edge => edge.source === node.id);

        if (!hasIncoming || !hasOutgoing) {
            orphans.push(node);
        }
    }

    return orphans;
}

/**
 * Validate that all edges have valid source and target nodes
 */
export function validateEdgeTargets(graph: DendrosGraph): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeIds = new Set(graph.nodes.map(n => n.id));

    for (const edge of graph.edges) {
        if (!nodeIds.has(edge.source)) {
            errors.push({
                type: 'invalidEdge',
                message: `Edge "${edge.id}" has invalid source node "${edge.source}"`,
                edgeId: edge.id,
            });
        }

        if (!nodeIds.has(edge.target)) {
            errors.push({
                type: 'invalidEdge',
                message: `Edge "${edge.id}" has invalid target node "${edge.target}"`,
                edgeId: edge.id,
            });
        }
    }

    return errors;
}

/**
 * Validate that the graph has exactly one root node
 */
export function validateRootNode(graph: DendrosGraph): ValidationError | null {
    const rootNodes = graph.nodes.filter(node => node.type === 'root');

    if (rootNodes.length === 0) {
        return {
            type: 'missingNode',
            message: 'Graph must have exactly one root node',
        };
    }

    if (rootNodes.length > 1) {
        return {
            type: 'invalidData',
            message: `Graph has ${rootNodes.length} root nodes, but should have exactly one`,
        };
    }

    return null;
}

/**
 * Validate that the graph has at least one end node
 */
export function validateEndNodes(graph: DendrosGraph): ValidationError | null {
    const endNodes = graph.nodes.filter(node => node.type === 'end');

    if (endNodes.length === 0) {
        return {
            type: 'missingNode',
            message: 'Graph must have at least one end node',
        };
    }

    return null;
}

/**
 * Comprehensive graph validation
 * 
 * Checks for:
 * - Cycles
 * - Invalid edge targets
 * - Orphaned nodes
 * - Missing root/end nodes
 */
export function validateGraph(graph: DendrosGraph): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check for root node
    const rootError = validateRootNode(graph);
    if (rootError) {
        errors.push(rootError);
    }

    // Check for end nodes
    const endError = validateEndNodes(graph);
    if (endError) {
        errors.push(endError);
    }

    // Check for invalid edge targets
    const edgeErrors = validateEdgeTargets(graph);
    errors.push(...edgeErrors);

    // Check for cycles
    if (detectCycles(graph)) {
        const cycles = findCycles(graph);
        for (const cycle of cycles) {
            errors.push({
                type: 'cycle',
                message: `Cycle detected: ${cycle.join(' → ')}`,
            });
        }
    }

    // Check for orphaned nodes (warnings, not errors)
    const orphans = findOrphanedNodes(graph);
    for (const orphan of orphans) {
        warnings.push({
            type: 'orphan',
            message: `Node "${orphan.id}" (${orphan.data.label}) is orphaned`,
            nodeId: orphan.id,
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Quick validation - just checks for cycles and critical errors
 */
export function quickValidate(graph: DendrosGraph): boolean {
    // Check for cycles
    if (detectCycles(graph)) {
        return false;
    }

    // Check for root node
    const rootNodes = graph.nodes.filter(node => node.type === 'root');
    if (rootNodes.length !== 1) {
        return false;
    }

    // Check for end nodes
    const endNodes = graph.nodes.filter(node => node.type === 'end');
    if (endNodes.length === 0) {
        return false;
    }

    return true;
}
