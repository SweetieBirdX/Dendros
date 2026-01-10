import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { RootNodeData } from '@/types/graph';

function RootNode({ data, selected }: NodeProps<RootNodeData>) {
    return (
        <div
            className={`
        px-6 py-4 rounded-xl border-2 shadow-lg min-w-[200px]
        bg-gradient-to-br from-green-500/20 to-emerald-500/20
        backdrop-blur-sm
        ${selected ? 'border-green-400 ring-2 ring-green-400/50' : 'border-green-500/50'}
        transition-all duration-200
      `}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-green-300 uppercase tracking-wide">
                    Start
                </span>
            </div>

            {/* Content */}
            <div className="text-white font-semibold mb-1">
                {data.label}
            </div>

            {data.welcomeMessage && (
                <div className="text-green-200 text-sm opacity-80">
                    {data.welcomeMessage}
                </div>
            )}

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-green-500 border-2 border-green-300"
            />
        </div>
    );
}

export default memo(RootNode);
