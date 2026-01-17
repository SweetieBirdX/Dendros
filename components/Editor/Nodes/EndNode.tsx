import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { EndNodeData } from '@/types/graph';

function EndNode({ data: propData, selected }: NodeProps) {
    const data = propData as unknown as EndNodeData;
    return (
        <div
            className={`
        px-6 py-4 rounded-xl border-2 shadow-lg min-w-[200px]
        bg-[#171717]
        ${selected ? 'border-white ring-2 ring-white/30' : 'border-[#404040]'}
        transition-all duration-200 hover:border-[#525252]
      `}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-white border-2 border-[#E5E5E5]"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-white" />
                <span className="text-xs font-semibold text-white uppercase tracking-wide">
                    End
                </span>
            </div>

            {/* Content */}
            <div className="text-white font-semibold mb-1">
                {data.label}
            </div>

            {data.successMessage && (
                <div className="text-[#A3A3A3] text-sm">
                    {data.successMessage}
                </div>
            )}

            {data.redirectUrl && (
                <div className="mt-2 text-[#737373] text-xs">
                    → {data.redirectUrl}
                </div>
            )}
        </div>
    );
}

export default memo(EndNode);
