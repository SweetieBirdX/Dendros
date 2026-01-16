'use client';

import { useState, useEffect } from 'react';
import type { GraphNode, NodeType, QuestionInputType } from '@/types/graph';
import ConfirmDialog from './ConfirmDialog';

interface NodeEditModalProps {
    node: GraphNode | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (node: GraphNode) => void;
    onDelete: (nodeId: string) => void;
}

export default function NodeEditModal({ node, isOpen, onClose, onSave, onDelete }: NodeEditModalProps) {
    const [formData, setFormData] = useState<any>({
        label: '',
        description: '',
        welcomeMessage: '',
        inputType: 'text',
        placeholder: '',
        required: false,
        condition: '',
        successMessage: '',
        redirectUrl: '',
        buttonText: '',
    });
    const [options, setOptions] = useState<string[]>(['', '']);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Option management functions
    const addOption = () => {
        setOptions([...options, '']);
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const removeOption = (index: number) => {
        if (options.length > 1) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    useEffect(() => {
        if (node) {
            setFormData({
                label: node.data.label || '',
                description: node.data.description || '',
                // Type-specific fields
                welcomeMessage: (node.data as any).welcomeMessage || '',
                inputType: (node.data as any).inputType || 'text',
                placeholder: (node.data as any).placeholder || '',
                required: (node.data as any).required || false,
                condition: (node.data as any).condition || '',
                successMessage: (node.data as any).successMessage || '',
                redirectUrl: (node.data as any).redirectUrl || '',
                buttonText: (node.data as any).buttonText || '',
            });
            // Set options array
            const nodeOptions = (node.data as any).options;
            if (nodeOptions && nodeOptions.length > 0) {
                setOptions(nodeOptions);
            } else {
                setOptions(['', '']);
            }
        }
    }, [node]);

    if (!isOpen || !node) return null;

    const handleSave = () => {
        const updatedNode: GraphNode = {
            ...node,
            data: {
                ...node.data,
                label: formData.label,
                description: formData.description,
            },
        };

        // Add type-specific fields
        if (node.type === 'root') {
            (updatedNode.data as any).welcomeMessage = formData.welcomeMessage;
        } else if (node.type === 'question') {
            (updatedNode.data as any).inputType = formData.inputType;
            (updatedNode.data as any).placeholder = formData.placeholder;
            (updatedNode.data as any).required = formData.required;
            if (formData.inputType === 'multipleChoice' || formData.inputType === 'checkbox') {
                // Filter out empty options
                (updatedNode.data as any).options = options.filter(opt => opt.trim() !== '');
            }
        } else if (node.type === 'logic') {
            (updatedNode.data as any).condition = formData.condition;
        } else if (node.type === 'end') {
            (updatedNode.data as any).successMessage = formData.successMessage;
            (updatedNode.data as any).redirectUrl = formData.redirectUrl;
        } else if (node.type === 'info') {
            (updatedNode.data as any).buttonText = formData.buttonText;
        }

        onSave(updatedNode);
        onClose();
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(node.id);
        setShowDeleteConfirm(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        Edit {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node
                    </h2>
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
                            Label *
                        </label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter node label"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-white/80 text-sm font-semibold mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            rows={2}
                            placeholder="Optional description"
                        />
                    </div>

                    {/* Type-specific fields */}
                    {node.type === 'root' && (
                        <div>
                            <label className="block text-white/80 text-sm font-semibold mb-2">
                                Welcome Message
                            </label>
                            <textarea
                                value={formData.welcomeMessage}
                                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                rows={2}
                                placeholder="Welcome to our flow!"
                            />
                        </div>
                    )}

                    {node.type === 'question' && (
                        <>
                            <div>
                                <label className="block text-white/80 text-sm font-semibold mb-2">
                                    Input Type *
                                </label>
                                <select
                                    value={formData.inputType}
                                    onChange={(e) => setFormData({ ...formData, inputType: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                                >
                                    <option value="text">Text</option>
                                    <option value="email">Email</option>
                                    <option value="number">Number</option>
                                    <option value="multipleChoice">Multiple Choice</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="none">No Input (Info Only)</option>
                                </select>
                            </div>

                            {(formData.inputType === 'multipleChoice' || formData.inputType === 'checkbox') && (
                                <div>
                                    <label className="block text-white/80 text-sm font-semibold mb-2">
                                        Options *
                                    </label>
                                    <div className="space-y-2">
                                        {options.map((option, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(index, e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder={`Option ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index)}
                                                    disabled={options.length === 1}
                                                    className={`px-3 py-2 rounded-lg transition-colors ${options.length === 1
                                                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                                            : 'bg-red-500/20 hover:bg-red-500/30 text-red-200'
                                                        }`}
                                                    title={options.length === 1 ? 'At least one option required' : 'Remove option'}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors border border-purple-500/30 font-semibold"
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-white/80 text-sm font-semibold mb-2">
                                    Placeholder
                                </label>
                                <input
                                    type="text"
                                    value={formData.placeholder}
                                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter placeholder text"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.required}
                                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                                    className="w-4 h-4 accent-purple-500"
                                />
                                <label className="text-white/80 text-sm">Required field</label>
                            </div>
                        </>
                    )}

                    {node.type === 'logic' && (
                        <div>
                            <label className="block text-white/80 text-sm font-semibold mb-2">
                                Condition *
                            </label>
                            <input
                                type="text"
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                placeholder="e.g., answer === 'Yes'"
                            />
                        </div>
                    )}

                    {node.type === 'end' && (
                        <>
                            <div>
                                <label className="block text-white/80 text-sm font-semibold mb-2">
                                    Success Message
                                </label>
                                <textarea
                                    value={formData.successMessage}
                                    onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    rows={2}
                                    placeholder="Thank you for completing!"
                                />
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-semibold mb-2">
                                    Redirect URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.redirectUrl}
                                    onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </>
                    )}

                    {node.type === 'info' && (
                        <div>
                            <label className="block text-white/80 text-sm font-semibold mb-2">
                                Button Text
                            </label>
                            <input
                                type="text"
                                value={formData.buttonText}
                                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Continue"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors border border-red-500/30"
                    >
                        Delete Node
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
                title="Delete Node"
                message="Are you sure you want to delete this node? This action cannot be retrieved."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                type="danger"
            />
        </div>
    );
}
