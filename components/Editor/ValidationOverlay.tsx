'use client';

import { validateGraph, type ValidationResult } from '@/lib/graphValidator';
import type { DendrosGraph } from '@/types/graph';

interface ValidationOverlayProps {
    graph: DendrosGraph;
}

export default function ValidationOverlay({ graph }: ValidationOverlayProps) {
    const validation: ValidationResult = validateGraph(graph);

    if (validation.isValid && validation.warnings.length === 0) {
        return null; // No issues, don't show overlay
    }

    return (
        <div className="absolute top-20 right-4 z-10 max-w-md">
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
                                <p className="text-red-200 text-sm">{error.message}</p>
                                {error.nodeId && (
                                    <p className="text-red-300/60 text-xs mt-1">Node: {error.nodeId}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                    <div className="p-4 space-y-2 border-t border-white/10">
                        <p className="text-yellow-200 text-sm font-semibold mb-2">Warnings:</p>
                        {validation.warnings.map((warning, index) => (
                            <div
                                key={index}
                                className="px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
                            >
                                <p className="text-yellow-200 text-sm">{warning.message}</p>
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
                            : 'Fix errors before publishing.'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
