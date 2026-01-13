'use client';

import { useState } from 'react';
import type { NodeType } from '@/types/graph';

interface NodePaletteProps {
    onAddNode: (type: NodeType) => void;
}

export default function NodePalette({ onAddNode }: NodePaletteProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const nodeTypes: { type: NodeType; label: string; icon: string; color: string }[] = [
        { type: 'root', label: 'Start', icon: '🟢', color: 'from-green-500 to-emerald-500' },
        { type: 'question', label: 'Question', icon: '🔵', color: 'from-blue-500 to-cyan-500' },
        { type: 'info', label: 'Info', icon: 'ℹ️', color: 'from-indigo-500 to-teal-500' },
        { type: 'logic', label: 'Logic', icon: '⚡', color: 'from-yellow-500 to-amber-500' },
        { type: 'end', label: 'End', icon: '🔴', color: 'from-red-500 to-rose-500' },
    ];

    const handleDragStart = (e: React.DragEvent, type: NodeType) => {
        e.dataTransfer.setData('application/reactflow', type);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="absolute top-20 left-4 z-10">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div
                    className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">Add Nodes</span>
                    </div>
                    <button className="text-white/60 hover:text-white transition-colors">
                        {isExpanded ? '▼' : '▶'}
                    </button>
                </div>

                {/* Node List */}
                {isExpanded && (
                    <div className="p-3 space-y-2">
                        {nodeTypes.map(({ type, label, icon, color }) => (
                            <button
                                key={type}
                                onClick={() => onAddNode(type)}
                                draggable
                                onDragStart={(e) => handleDragStart(e, type)}
                                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-gradient-to-r ${color}
                  text-white font-semibold
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                  flex items-center gap-3
                  shadow-lg
                  cursor-grab active:cursor-grabbing
                `}
                            >
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Instructions */}
                {isExpanded && (
                    <div className="px-4 py-3 bg-white/5 border-t border-white/10">
                        <p className="text-white/60 text-xs">
                            Drag to canvas or click to add
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                            Shortcuts: Q, I, L, E
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
