'use client';

import { useState, useEffect, useRef } from 'react';

interface InlineEdgeLabelEditorProps {
    initialLabel: string;
    position: { x: number; y: number };
    onSave: (newLabel: string) => void;
    onCancel: () => void;
}

export default function InlineEdgeLabelEditor({
    initialLabel,
    position,
    onSave,
    onCancel
}: InlineEdgeLabelEditorProps) {
    const [label, setLabel] = useState(initialLabel);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus input on mount
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSave(label);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
    };

    const handleBlur = () => {
        onSave(label);
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
            }}
            className="bg-[#171717] rounded-lg shadow-2xl border-2 border-white p-1"
        >
            <input
                ref={inputRef}
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="bg-transparent text-white text-sm font-semibold px-2 py-1 outline-none min-w-[120px]"
                placeholder="Edge label..."
            />
        </div>
    );
}
