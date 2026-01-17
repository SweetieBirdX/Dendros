import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { QuestionNodeData } from '@/types/graph';

function QuestionNode({ data: propData, selected }: NodeProps) {
    const data = propData as unknown as QuestionNodeData;
    const inputTypeLabels: Record<string, string> = {
        text: 'Text',
        email: 'Email',
        number: 'Number',
        multipleChoice: 'Multiple Choice',
        checkbox: 'Checkbox',
    };

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
                    Question
                </span>
            </div>

            {/* Content */}
            <div className="text-white font-semibold mb-2">
                {data.label}
            </div>

            {/* Input Type Badge */}
            <div className="inline-block px-2 py-1 rounded-md bg-[#262626] text-[#D4D4D4] text-xs border border-[#404040]">
                {inputTypeLabels[data.inputType] || data.inputType}
            </div>

            {/* Options Preview */}
            {data.options && data.options.length > 0 && (
                <div className="mt-3 space-y-1">
                    <div className="text-[#737373] text-xs mb-1">Options:</div>
                    {data.options.map((option, index) => (
                        <div
                            key={index}
                            className="inline-block px-2 py-1 mr-1 mb-1 rounded-md bg-[#262626] text-white text-xs border border-[#404040]"
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-white border-2 border-[#E5E5E5]"
            />
        </div>
    );
}

export default memo(QuestionNode);
