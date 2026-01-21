'use client';

import { useState } from 'react';
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
    const [isExpanded, setIsExpanded] = useState(false);
    const validation: ValidationResult = validateGraph(graph);

    if (validation.isValid && (!validation.warnings || validation.warnings.length === 0)) {
        return null; // No issues, don't show overlay
    }

    const totalIssues = validation.errors.length + (validation.warnings?.length || 0);

    return (
        <>
            {/* Desktop: Right side overlay */}
            <div className="hidden md:block absolute top-20 right-4 z-10 w-80">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className={`px-4 py-3 ${validation.isValid ? 'bg-[#262626]' : 'bg-[#171717]'} border-b border-[#404040]`}>
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
                                    className="px-3 py-2 bg-[#171717] border border-white rounded-lg"
                                >
                                    <p className="text-white text-sm">{getUserFriendlyMessage(error, graph)}</p>
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
                                    className="px-3 py-2 bg-[#262626] border border-[#525252] rounded-lg"
                                >
                                    <p className="text-[#D4D4D4] text-sm">{getUserFriendlyMessage(warning, graph)}</p>
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

            {/* Mobile: Collapsible dropdown below node palette */}
            <div
                className="md:hidden absolute left-2 z-10 transition-all duration-200"
                style={{
                    top: '240px',
                    maxWidth: 'calc(100vw - 16px)',
                    width: isExpanded ? '280px' : '160px'
                }}
            >
                <div className="bg-[#171717] rounded-lg border border-[#404040] shadow-2xl overflow-hidden">
                    {/* Collapsible Header */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full px-3 py-2 bg-[#0A0A0A] border-b border-[#262626] flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{validation.isValid ? '⚠️' : '❌'}</span>
                            <span className="text-white font-semibold text-sm">
                                {validation.isValid ? 'Warnings' : 'Errors'} ({totalIssues})
                            </span>
                        </div>
                        <span className="text-[#737373] text-xs">
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    </button>

                    {/* Expandable Content */}
                    {isExpanded && (
                        <div className="max-h-64 overflow-y-auto">
                            {/* Errors */}
                            {validation.errors.length > 0 && (
                                <div className="p-3 space-y-2">
                                    <p className="text-red-200 text-xs font-semibold mb-1">Errors:</p>
                                    {validation.errors.map((error, index) => (
                                        <div
                                            key={index}
                                            className="px-2 py-2 bg-[#262626] border border-white rounded-md"
                                        >
                                            <p className="text-white text-xs">{getUserFriendlyMessage(error, graph)}</p>
                                            {error.nodeId && (
                                                <p className="text-red-300/60 text-[10px] mt-1">Node: {error.nodeId}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Warnings */}
                            {validation.warnings && validation.warnings.length > 0 && (
                                <div className={`p-3 space-y-2 ${validation.errors.length > 0 ? 'border-t border-white/10' : ''}`}>
                                    <p className="text-yellow-200 text-xs font-semibold mb-1">Warnings:</p>
                                    {validation.warnings.map((warning, index) => (
                                        <div
                                            key={index}
                                            className="px-2 py-2 bg-[#262626] border border-[#525252] rounded-md"
                                        >
                                            <p className="text-[#D4D4D4] text-xs">{getUserFriendlyMessage(warning, graph)}</p>
                                            {warning.nodeId && (
                                                <p className="text-yellow-300/60 text-[10px] mt-1">Node: {warning.nodeId}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-3 py-2 bg-white/5 border-t border-white/10">
                                <p className="text-white/60 text-[10px]">
                                    {validation.isValid
                                        ? 'You can still publish.'
                                        : 'Fix errors to publish.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
