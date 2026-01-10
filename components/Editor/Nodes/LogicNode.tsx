import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { LogicNodeData } from '@/types/graph';

function LogicNode({ data, selected }: NodeProps<LogicNodeData>) {
    return (
        <div
            className={`
        px-6 py-4 rounded-xl border-2 shadow-lg min-w-[200px]
        bg-gradient-to-br from-yellow-500/20 to-amber-500/20
        backdrop-blur-sm
        ${selected ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-yellow-500/50'}
        transition-all duration-200
      `}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-yellow-500 border-2 border-yellow-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚡</span>
                <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wide">
                    Logic
                </span>
            </div>

            {/* Content */}
            <div className="text-white font-semibold mb-2">
                {data.label}
            </div>

            {/* Condition Preview */}
            {data.condition && (
                <div className="mt-2 px-2 py-1 rounded-md bg-yellow-500/30 text-yellow-200 text-xs font-mono">
                    {data.condition.length > 30
                        ? `${data.condition.substring(0, 30)}...`
                        : data.condition
                    }
                </div>
            )}

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-yellow-500 border-2 border-yellow-300"
            />
        </div>
    );
}

export default memo(LogicNode);
