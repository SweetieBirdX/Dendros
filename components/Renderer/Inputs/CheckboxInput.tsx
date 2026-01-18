interface CheckboxInputProps {
    options: string[];
    value: string[]; // Array of selected options
    onChange: (value: string[]) => void;
}

export default function CheckboxInput({ options, value = [], onChange }: CheckboxInputProps) {
    const toggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter(v => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    return (
        <div className="space-y-3">
            {options.map((option, index) => {
                const isSelected = value.includes(option);
                return (
                    <button
                        key={index}
                        onClick={() => toggleOption(option)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 group flex items-center justify-between ${isSelected
                            ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <span>{option}</span>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${isSelected
                            ? 'bg-[#06B6D4] border-[#06B6D4]'
                            : 'border-slate-500 group-hover:border-slate-400 bg-transparent'
                            }`}>
                            {isSelected && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
