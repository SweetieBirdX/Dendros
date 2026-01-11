'use client';

import { useState, useEffect } from 'react';
import type { GraphEdge, EdgeConditionType } from '@/types/graph';
import ConfirmDialog from './ConfirmDialog';

interface EdgeEditModalProps {
    edge: GraphEdge | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (edge: GraphEdge) => void;
    onDelete: (edgeId: string) => void;
}

export default function EdgeEditModal({ edge, isOpen, onClose, onSave, onDelete }: EdgeEditModalProps) {
    const [formData, setFormData] = useState<any>({
        label: '',
        conditionType: 'always' as EdgeConditionType,
        conditionValue: '',
        conditionPattern: '',
        rangeMin: '',
        rangeMax: '',
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (edge) {
            setFormData({
                label: edge.label || '',
                conditionType: edge.condition?.type || 'always',
                conditionValue: edge.condition?.value?.toString() || '',
                conditionPattern: edge.condition?.pattern || '',
                rangeMin: Array.isArray(edge.condition?.value) ? edge.condition.value[0]?.toString() : '',
                rangeMax: Array.isArray(edge.condition?.value) ? edge.condition.value[1]?.toString() : '',
            });
        }
    }, [edge]);

    if (!isOpen || !edge) return null;

    const handleSave = () => {
        const updatedEdge: GraphEdge = {
            ...edge,
            label: formData.label,
        };

        // Build condition based on type
        if (formData.conditionType === 'always') {
            updatedEdge.condition = { type: 'always' };
        } else if (formData.conditionType === 'exact') {
            updatedEdge.condition = {
                type: 'exact',
                value: formData.conditionValue,
            };
        } else if (formData.conditionType === 'contains') {
            updatedEdge.condition = {
                type: 'contains',
                value: formData.conditionValue,
            };
        } else if (formData.conditionType === 'range') {
            updatedEdge.condition = {
                type: 'range',
                value: [parseFloat(formData.rangeMin), parseFloat(formData.rangeMax)],
            };
        } else if (formData.conditionType === 'regex') {
            updatedEdge.condition = {
                type: 'regex',
                pattern: formData.conditionPattern,
            };
        }

        onSave(updatedEdge);
        onClose();
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(edge.id);
        setShowDeleteConfirm(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl border border-white/20 shadow-2xl w-full max-w-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Edit Connection</h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Label */}
                    <div>
                        <label className="block text-white/80 text-sm font-semibold mb-2">
                            Label
                        </label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Yes, No, Developer Path"
                        />
                    </div>

                    {/* Condition Type */}
                    <div>
                        <label className="block text-white/80 text-sm font-semibold mb-2">
                            Condition Type
                        </label>
                        <select
                            value={formData.conditionType}
                            onChange={(e) => setFormData({ ...formData, conditionType: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                        >
                            <option value="always">Always (Default Path)</option>
                            <option value="exact">Exact Match</option>
                            <option value="contains">Contains Text</option>
                            <option value="range">Numeric Range</option>
                            <option value="regex">Regular Expression</option>
                        </select>
                    </div>

                    {/* Condition Value (for exact/contains) */}
                    {(formData.conditionType === 'exact' || formData.conditionType === 'contains') && (
                        <div>
                            <label className="block text-white/80 text-sm font-semibold mb-2">
                                Value
                            </label>
                            <input
                                type="text"
                                value={formData.conditionValue}
                                onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder={formData.conditionType === 'exact' ? 'e.g., Yes' : 'e.g., developer'}
                            />
                            <p className="text-white/40 text-xs mt-1">
                                {formData.conditionType === 'exact'
                                    ? 'Answer must exactly match this value'
                                    : 'Answer must contain this text (case-insensitive)'
                                }
                            </p>
                        </div>
                    )}

                    {/* Range (min/max) */}
                    {formData.conditionType === 'range' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white/80 text-sm font-semibold mb-2">
                                    Min Value
                                </label>
                                <input
                                    type="number"
                                    value={formData.rangeMin}
                                    onChange={(e) => setFormData({ ...formData, rangeMin: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm font-semibold mb-2">
                                    Max Value
                                </label>
                                <input
                                    type="number"
                                    value={formData.rangeMax}
                                    onChange={(e) => setFormData({ ...formData, rangeMax: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="100"
                                />
                            </div>
                            <p className="text-white/40 text-xs col-span-2">
                                Answer must be a number between min and max (inclusive)
                            </p>
                        </div>
                    )}

                    {/* Regex Pattern */}
                    {formData.conditionType === 'regex' && (
                        <div>
                            <label className="block text-white/80 text-sm font-semibold mb-2">
                                Regular Expression Pattern
                            </label>
                            <input
                                type="text"
                                value={formData.conditionPattern}
                                onChange={(e) => setFormData({ ...formData, conditionPattern: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                placeholder="^[A-Z][a-z]+$"
                            />
                            <p className="text-white/40 text-xs mt-1">
                                JavaScript regex pattern (without delimiters)
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors border border-red-500/30"
                    >
                        Delete Connection
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Connection"
                message="Are you sure you want to delete this connection? This action cannot be retrieved."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                type="danger"
            />
        </div>
    );
}
