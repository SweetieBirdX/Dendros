import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { QuestionNodeData } from '@/types/graph';

function QuestionNode({ data, selected }: NodeProps<QuestionNodeData>) {
    const inputTypeLabels: Record<string, string> = {
        text: '📝 Text',
        email: '📧 Email',
        number: '🔢 Number',
        multipleChoice: '☑️ Multiple Choice',
        checkbox: '✅ Checkbox',
    };

    return (
        <div
            className={`
        px-6 py-4 rounded-xl border-2 shadow-lg min-w-[200px]
        bg-gradient-to-br from-blue-500/20 to-cyan-500/20
        backdrop-blur-sm
        ${selected ? 'border-blue-400 ring-2 ring-blue-400/50' : 'border-blue-500/50'}
        transition-all duration-200
      `}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-blue-500 border-2 border-blue-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
                    Question
                </span>
            </div>

            {/* Content */}
            <div className="text-white font-semibold mb-2">
                {data.label}
            </div>

            {/* Input Type Badge */}
            <div className="inline-block px-2 py-1 rounded-md bg-blue-500/30 text-blue-200 text-xs">
                {inputTypeLabels[data.inputType] || data.inputType}
            </div>

            {/* Options Preview */}
            {data.options && data.options.length > 0 && (
                <div className="mt-2 text-blue-200 text-xs opacity-80">
                    {data.options.length} option{data.options.length > 1 ? 's' : ''}
                </div>
            )}

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-blue-500 border-2 border-blue-300"
            />
        </div>
    );
}

export default memo(QuestionNode);
