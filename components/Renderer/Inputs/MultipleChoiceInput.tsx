interface MultipleChoiceInputProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

export default function MultipleChoiceInput({ options, value, onChange }: MultipleChoiceInputProps) {
    return (
        <div className="space-y-3">
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => onChange(option)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 group flex items-center justify-between ${value === option
                            ? 'bg-purple-500/20 border-purple-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                >
                    <span>{option}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${value === option
                            ? 'border-purple-500'
                            : 'border-slate-500 group-hover:border-slate-400'
                        }`}>
                        {value === option && (
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
}
