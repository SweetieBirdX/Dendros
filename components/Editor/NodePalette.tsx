'use client';

import { useState } from 'react';
import type { NodeType } from '@/types/graph';

interface NodePaletteProps {
    onAddNode: (type: NodeType) => void;
}

export default function NodePalette({ onAddNode }: NodePaletteProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const nodeTypes: { type: NodeType; label: string; icon: string }[] = [
        { type: 'root', label: 'Start', icon: '🟢' },
        { type: 'question', label: 'Question', icon: '🔵' },
        { type: 'info', label: 'Info', icon: 'ℹ️' },
        { type: 'end', label: 'End', icon: '🔴' },
    ];

    const handleDragStart = (e: React.DragEvent, type: NodeType) => {
        e.dataTransfer.setData('application/reactflow', type);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="absolute top-4 md:top-20 left-2 md:left-4 z-10">
            <div className="bg-[#171717] rounded-lg md:rounded-xl border border-[#404040] shadow-2xl overflow-hidden">
                {/* Header */}
                <div
                    className="px-2 py-2 md:px-4 md:py-3 bg-[#0A0A0A] border-b border-[#262626] flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm md:text-base">Add Nodes</span>
                    </div>
                    <button className="text-[#737373] hover:text-white transition-colors text-xs md:text-sm">
                        {isExpanded ? '▼' : '▶'}
                    </button>
                </div>

                {/* Node List */}
                {isExpanded && (
                    <div className="p-2 md:p-3 space-y-1 md:space-y-2">
                        {nodeTypes.map(({ type, label, icon }) => (
                            <button
                                key={type}
                                onClick={() => onAddNode(type)}
                                draggable
                                onDragStart={(e) => handleDragStart(e, type)}
                                className="
                  w-full px-2 py-2 md:px-4 md:py-3 rounded-md md:rounded-lg
                  bg-[#262626] border border-[#404040]
                  text-white font-semibold text-sm md:text-base
                  hover:bg-[#404040] hover:border-white
                  active:scale-95
                  transition-all duration-200
                  flex items-center gap-2 md:gap-3
                  cursor-grab active:cursor-grabbing
                "
                            >
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
