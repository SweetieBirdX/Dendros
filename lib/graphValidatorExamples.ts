/**
 * Graph Validator Test Examples
 * 
 * This file contains test graphs to demonstrate cycle detection
 * and validation functionality.
 */

import { validateGraph, detectCycles, findCycles, quickValidate } from './graphValidator';
import type { DendrosGraph } from '@/types/graph';

/**
 * Example 1: Valid Graph (No Cycles)
 */
export const validGraph: DendrosGraph = {
    nodes: [
        { id: 'start', type: 'root', data: { label: 'Start' } },
        { id: 'q1', type: 'question', data: { label: 'Question 1', inputType: 'text' } },
        { id: 'end', type: 'end', data: { label: 'End' } },
    ],
    edges: [
        { id: 'e1', source: 'start', target: 'q1' },
        { id: 'e2', source: 'q1', target: 'end' },
    ],
};

/**
 * Example 2: Simple Cycle (A → B → A)
 */
export const simpleCycleGraph: DendrosGraph = {
    nodes: [
        { id: 'start', type: 'root', data: { label: 'Start' } },
        { id: 'a', type: 'question', data: { label: 'A', inputType: 'text' } },
        { id: 'b', type: 'question', data: { label: 'B', inputType: 'text' } },
        { id: 'end', type: 'end', data: { label: 'End' } },
    ],
    edges: [
        { id: 'e1', source: 'start', target: 'a' },
        { id: 'e2', source: 'a', target: 'b' },
        { id: 'e3', source: 'b', target: 'a' }, // Cycle!
        { id: 'e4', source: 'b', target: 'end' },
    ],
};

/**
 * Example 3: Complex Cycle (A → B → C → A)
 */
export const complexCycleGraph: DendrosGraph = {
    nodes: [
        { id: 'start', type: 'root', data: { label: 'Start' } },
        { id: 'a', type: 'question', data: { label: 'A', inputType: 'text' } },
        { id: 'b', type: 'question', data: { label: 'B', inputType: 'text' } },
        { id: 'c', type: 'question', data: { label: 'C', inputType: 'text' } },
        { id: 'end', type: 'end', data: { label: 'End' } },
    ],
    edges: [
        { id: 'e1', source: 'start', target: 'a' },
        { id: 'e2', source: 'a', target: 'b' },
        { id: 'e3', source: 'b', target: 'c' },
        { id: 'e4', source: 'c', target: 'a' }, // Cycle!
        { id: 'e5', source: 'c', target: 'end' },
    ],
};

/**
 * Example 4: Self-Loop (A → A)
 */
export const selfLoopGraph: DendrosGraph = {
    nodes: [
        { id: 'start', type: 'root', data: { label: 'Start' } },
        { id: 'a', type: 'question', data: { label: 'A', inputType: 'text' } },
        { id: 'end', type: 'end', data: { label: 'End' } },
    ],
    edges: [
        { id: 'e1', source: 'start', target: 'a' },
        { id: 'e2', source: 'a', target: 'a' }, // Self-loop!
        { id: 'e3', source: 'a', target: 'end' },
    ],
};

/**
 * Example 5: Orphaned Node
 */
export const orphanedNodeGraph: DendrosGraph = {
    nodes: [
        { id: 'start', type: 'root', data: { label: 'Start' } },
        { id: 'orphan', type: 'question', data: { label: 'Orphan', inputType: 'text' } },
        { id: 'end', type: 'end', data: { label: 'End' } },
    ],
    edges: [
        { id: 'e1', source: 'start', target: 'end' },
        // 'orphan' node has no edges!
    ],
};

/**
 * Example 6: Invalid Edge Target
 */
export const invalidEdgeGraph: DendrosGraph = {
    nodes: [
        { id: 'start', type: 'root', data: { label: 'Start' } },
        { id: 'end', type: 'end', data: { label: 'End' } },
    ],
    edges: [
        { id: 'e1', source: 'start', target: 'nonexistent' }, // Invalid target!
    ],
};

/**
 * Example 7: Multiple Root Nodes (Invalid)
 */
export const multipleRootsGraph: DendrosGraph = {
    nodes: [
        { id: 'start1', type: 'root', data: { label: 'Start 1' } },
        { id: 'start2', type: 'root', data: { label: 'Start 2' } },
        { id: 'end', type: 'end', data: { label: 'End' } },
    ],
    edges: [
        { id: 'e1', source: 'start1', target: 'end' },
        { id: 'e2', source: 'start2', target: 'end' },
    ],
};

/**
 * Manual test function - logs validation results
 */
export function testGraphValidator() {
    console.log('=== Graph Validator Tests ===\n');

    const testCases = [
        { name: 'Valid Graph', graph: validGraph },
        { name: 'Simple Cycle (A → B → A)', graph: simpleCycleGraph },
        { name: 'Complex Cycle (A → B → C → A)', graph: complexCycleGraph },
        { name: 'Self-Loop (A → A)', graph: selfLoopGraph },
        { name: 'Orphaned Node', graph: orphanedNodeGraph },
        { name: 'Invalid Edge Target', graph: invalidEdgeGraph },
        { name: 'Multiple Root Nodes', graph: multipleRootsGraph },
    ];

    for (const { name, graph } of testCases) {
        console.log(`\n--- ${name} ---`);

        const hasCycles = detectCycles(graph);
        console.log('Has cycles:', hasCycles);

        if (hasCycles) {
            const cycles = findCycles(graph);
            console.log('Cycles found:', cycles);
        }

        const isQuickValid = quickValidate(graph);
        console.log('Quick validate:', isQuickValid);

        const fullValidation = validateGraph(graph);
        console.log('Full validation:', {
            isValid: fullValidation.isValid,
            errorCount: fullValidation.errors.length,
            warningCount: fullValidation.warnings?.length || 0,
        });

        if (fullValidation.errors.length > 0) {
            console.log('Errors:', fullValidation.errors.map(e => e.message));
        }

        if (fullValidation.warnings && fullValidation.warnings.length > 0) {
            console.log('Warnings:', fullValidation.warnings.map(w => w.message));
        }
    }

    console.log('\n=== Tests Complete ===');
}
