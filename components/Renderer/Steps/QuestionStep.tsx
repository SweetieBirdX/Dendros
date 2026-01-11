import { useState } from 'react';
import type { QuestionNodeData, QuestionInputType } from '@/types/graph';
import TextInput from '../Inputs/TextInput';
import MultipleChoiceInput from '../Inputs/MultipleChoiceInput';
import CheckboxInput from '../Inputs/CheckboxInput';

interface QuestionStepProps {
    data: QuestionNodeData;
    onNext: (answer: any) => void;
    onBack?: () => void;
    initialValue?: any;
}

export default function QuestionStep({ data, onNext, onBack, initialValue }: QuestionStepProps) {
    const [answer, setAnswer] = useState(initialValue || (data.inputType === 'checkbox' ? [] : ''));
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        // Basic validation
        if (data.required) {
            if (data.inputType === 'checkbox') {
                if (answer.length === 0) {
                    setError('Please select at least one option.');
                    return;
                }
            } else if (!answer || (typeof answer === 'string' && !answer.trim())) {
                setError('This field is required.');
                return;
            }
        }

        setError(null);
        onNext(answer);
    };

    const renderInput = () => {
        const commonProps = {
            placeholder: data.placeholder,
            required: data.required,
        };

        switch (data.inputType) {
            case 'text':
            case 'email':
            case 'number':
                return (
                    <TextInput
                        {...commonProps}
                        type={data.inputType as 'text' | 'email' | 'number'}
                        value={answer}
                        onChange={(val) => {
                            setAnswer(val);
                            setError(null);
                        }}
                    />
                );
            case 'multipleChoice':
                return (
                    <MultipleChoiceInput
                        options={data.options || []}
                        value={answer}
                        onChange={(val) => {
                            setAnswer(val);
                            setError(null);
                        }}
                    />
                );
            case 'checkbox':
                return (
                    <CheckboxInput
                        options={data.options || []}
                        value={answer}
                        onChange={(val) => {
                            setAnswer(val);
                            setError(null);
                        }}
                    />
                );
            default:
                return <div className="text-red-400">Unsupported input type</div>;
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-bold text-white mb-2">{data.label}</h2>

            {data.description && (
                <p className="text-slate-400 mb-6">{data.description}</p>
            )}

            <div className="mb-8">
                {renderInput()}
                {error && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 text-center rounded-full bg-red-400/20 text-red-400 leading-4">!</span>
                        {error}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Back
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
