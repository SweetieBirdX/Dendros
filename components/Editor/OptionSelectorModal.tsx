import { useState, useEffect } from 'react';

interface OptionSelectorModalProps {
    isOpen: boolean;
    options: string[];
    isRequired?: boolean;
    onSelect: (option: string) => void;
    onCancel: () => void;
}

export default function OptionSelectorModal({ isOpen, options, isRequired = false, onSelect, onCancel }: OptionSelectorModalProps) {
    const [selectedOption, setSelectedOption] = useState<string>('');

    // Add special "None selected" option only if field is not required
    const allOptions = isRequired ? options : [...options, '(None selected)'];

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedOption('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedOption) {
            onSelect(selectedOption);
            setSelectedOption('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">
                        Select Option for This Connection
                    </h2>
                    <p className="text-white/60 text-sm mt-1">
                        Which option should this edge represent?
                    </p>
                </div>

                {/* Options */}
                <div className="p-6 space-y-2">
                    {allOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setSelectedOption(option)}
                            className={`
                                w-full px-4 py-3 rounded-lg text-left transition-all
                                ${selectedOption === option
                                    ? 'bg-white text-black ring-2 ring-white/50'
                                    : 'bg-[#262626] hover:bg-[#404040] text-white border border-[#404040]'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${selectedOption === option
                                        ? 'border-white bg-white'
                                        : 'border-white/40'
                                    }
                                `}>
                                    {selectedOption === option && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>
                                <span className="font-semibold">{option}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedOption}
                        className={`
                            px-4 py-2 rounded-lg transition-colors font-semibold
                            ${selectedOption
                                ? 'bg-white hover:bg-[#E5E5E5] text-black'
                                : 'bg-[#262626] hover:bg-[#404040] text-[#737373] cursor-not-allowed'
                            }
                        `}
                    >
                        Create Connection
                    </button>
                </div>
            </div>
        </div>
    );
}
