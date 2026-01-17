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
                <span className="text-xs font-semibold text-white uppercase tracking-wide">
                    Info
                </span>
            </div>

            {/* Content */}
            <div className="text-white font-semibold mb-2">
                {data.label}
            </div>

            {/* Button Preview */}
            <div className="inline-block px-3 py-1 rounded-md bg-[#262626] text-[#D4D4D4] text-xs border border-[#404040]">
                Button: {data.buttonText || 'Continue'}
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-white border-2 border-[#E5E5E5]"
            />
        </div>
    );
}

export default memo(InfoNode);
