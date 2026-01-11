interface TextInputProps {
    value: string | number;
    onChange: (value: string) => void;
    type: 'text' | 'email' | 'number';
    placeholder?: string;
    required?: boolean;
}

export default function TextInput({ value, onChange, type, placeholder, required }: TextInputProps) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/10"
        />
    );
}
