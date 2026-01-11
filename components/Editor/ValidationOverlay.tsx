'use client';

import { validateGraph } from '@/lib/graphValidator';
import type { DendrosGraph, ValidationResult, ValidationError } from '@/types/graph';

interface ValidationOverlayProps {
    graph: DendrosGraph;
}

// Helper function to get node type label
function getNodeTypeLabel(nodeId: string, graph: DendrosGraph): string {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return 'Node';

    switch (node.type) {
        case 'root':
            return 'Start node';
        case 'question':
            return 'Question node';
        case 'logic':
            return 'Logic node';
        case 'info':
            return 'Info node';
        case 'end':
            return 'End node';
        default:
            return 'Node';
    }
}

// Helper function to make messages more user-friendly
function getUserFriendlyMessage(issue: ValidationError, graph: DendrosGraph): string {
    const message = issue.message;

    // Handle orphaned nodes
    if (message.includes('is orphaned')) {
        const nodeType = issue.nodeId ? getNodeTypeLabel(issue.nodeId, graph) : 'Node';
        return `The ${nodeType} doesn't connected`;
    }

    // Handle no outgoing edges
    if (message.includes('has no outgoing edges')) {
        const nodeType = issue.nodeId ? getNodeTypeLabel(issue.nodeId, graph) : 'Node';
        return `The ${nodeType} needs to connect to another node`;
    }

    // Handle cycle detection
    if (message.includes('cycle detected')) {
        return 'There is a circular connection that needs to be fixed';
    }

    // Handle no root node
    if (message.includes('no root node')) {
        return 'You need to add a Start node';
    }

    // Handle multiple root nodes
    if (message.includes('multiple root nodes')) {
        return 'You can only have one Start node';
    }

    // Handle no end node
    if (message.includes('no end node')) {
        return 'You need to add an End node';
    }

    return message;
}

export default function ValidationOverlay({ graph }: ValidationOverlayProps) {
    const validation: ValidationResult = validateGraph(graph);

    if (validation.isValid && (!validation.warnings || validation.warnings.length === 0)) {
        return null; // No issues, don't show overlay
    }

    return (
        <div className="absolute top-20 right-4 z-10 w-80">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className={`px-4 py-3 ${validation.isValid ? 'bg-yellow-500/20' : 'bg-red-500/20'} border-b border-white/10`}>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{validation.isValid ? '⚠️' : '❌'}</span>
                        <span className="text-white font-semibold">
                            {validation.isValid ? 'Warnings' : 'Validation Errors'}
                        </span>
                    </div>
                </div>

                {/* Errors */}
                {validation.errors.length > 0 && (
                    <div className="p-4 space-y-2">
                        <p className="text-red-200 text-sm font-semibold mb-2">Errors:</p>
                        {validation.errors.map((error, index) => (
                            <div
                                key={index}
                                className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg"
                            >
                                <p className="text-red-200 text-sm">{getUserFriendlyMessage(error, graph)}</p>
                                {error.nodeId && (
                                    <p className="text-red-300/60 text-xs mt-1">Node: {error.nodeId}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Warnings */}
                {validation.warnings && validation.warnings.length > 0 && (
                    <div className="p-4 space-y-2 border-t border-white/10">
                        <p className="text-yellow-200 text-sm font-semibold mb-2">Warnings:</p>
                        {validation.warnings.map((warning, index) => (
                            <div
                                key={index}
                                className="px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
                            >
                                <p className="text-yellow-200 text-sm">{getUserFriendlyMessage(warning, graph)}</p>
                                {warning.nodeId && (
                                    <p className="text-yellow-300/60 text-xs mt-1">Node: {warning.nodeId}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="px-4 py-3 bg-white/5 border-t border-white/10">
                    <p className="text-white/60 text-xs">
                        {validation.isValid
                            ? 'Graph is valid but has warnings. You can still publish.'
                            : 'Please fix the errors before publishing.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
