import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { InfoNodeData } from '@/types/graph';

function InfoNode({ data: propData, selected }: NodeProps) {
    const data = propData as unknown as InfoNodeData;

    return (
        <div
            className={`
        px-6 py-4 rounded-xl border-2 shadow-lg min-w-[200px]
        bg-gradient-to-br from-indigo-500/20 to-teal-500/20
        backdrop-blur-sm
        ${selected ? 'border-indigo-400 ring-2 ring-indigo-400/50' : 'border-indigo-500/50'}
        transition-all duration-200
      `}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-indigo-500 border-2 border-indigo-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">
                    Info
                </span>
            </div>

            {/* Content */}
            <div className="text-white font-semibold mb-2">
                {data.label}
            </div>

            {/* Button Preview */}
            <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/30 text-indigo-200 text-xs">
                Button: {data.buttonText || 'Continue'}
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-indigo-500 border-2 border-indigo-300"
            />
        </div>
    );
}

export default memo(InfoNode);
