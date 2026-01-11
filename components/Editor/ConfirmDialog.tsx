'use client';

import { useEffect } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'danger'
}: ConfirmDialogProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const colorClasses = {
        danger: {
            bg: 'bg-red-500/20',
            border: 'border-red-500/50',
            button: 'bg-red-500 hover:bg-red-600'
        },
        warning: {
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/50',
            button: 'bg-yellow-500 hover:bg-yellow-600'
        },
        info: {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/50',
            button: 'bg-blue-500 hover:bg-blue-600'
        }
    };

    const colors = colorClasses[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-slate-900/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={`px-6 py-4 ${colors.bg} border-b ${colors.border}`}>
                    <h3 className="text-white text-lg font-semibold">{title}</h3>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <p className="text-white/80 text-sm leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg ${colors.button} text-white transition-colors font-medium`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
