import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { EndNodeData } from '@/types/graph';

function EndNode({ data, selected }: NodeProps<EndNodeData>) {
    return (
        <div
            className={`
        px-6 py-4 rounded-xl border-2 shadow-lg min-w-[200px]
        bg-gradient-to-br from-red-500/20 to-rose-500/20
        backdrop-blur-sm
        ${selected ? 'border-red-400 ring-2 ring-red-400/50' : 'border-red-500/50'}
        transition-all duration-200
      `}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-red-500 border-2 border-red-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-300 uppercase tracking-wide">
                    End
                </span>
            </div>

            {/* Content */}
            <div className="text-white font-semibold mb-1">
                {data.label}
            </div>

            {data.successMessage && (
                <div className="text-red-200 text-sm opacity-80">
                    {data.successMessage}
                </div>
            )}

            {data.redirectUrl && (
                <div className="mt-2 text-red-200 text-xs opacity-60">
                    → {data.redirectUrl}
                </div>
            )}
        </div>
    );
}

export default memo(EndNode);
