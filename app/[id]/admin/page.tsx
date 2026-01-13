'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { fetchDendros, checkOwnership, updateDendros } from '@/lib/firestore';
import { validateGraph } from '@/lib/graphValidator';
import type { Dendros } from '@/types/graph';
import EditorCanvas, { type EditorCanvasHandle } from '@/components/Editor/EditorCanvas';
import ValidationOverlay from '@/components/Editor/ValidationOverlay';

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [dendros, setDendros] = useState<Dendros | null>(null);
    const [loadingDendros, setLoadingDendros] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [editingDescription, setEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');
    const editorRef = useRef<EditorCanvasHandle>(null);

    const dendrosId = params.id as string;

    useEffect(() => {
        async function loadDendros() {
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                // Check ownership
                const isOwner = await checkOwnership(dendrosId, user.uid);
                if (!isOwner) {
                    setError('You do not have permission to edit this Dendros');
                    return;
                }

                // Fetch the Dendros
                const data = await fetchDendros(dendrosId);
                if (!data) {
                    setError('Dendros not found');
                    return;
                }

                setDendros(data);
            } catch (err) {
                setError(`Error loading Dendros: ${err}`);
            } finally {
                setLoadingDendros(false);
            }
        }

        if (!loading) {
            loadDendros();
        }
    }, [user, loading, dendrosId, router]);

    const handleSave = async () => {
        if (!dendros) return;

        setSaving(true);
        try {
            await updateDendros(dendrosId, {
                graph: dendros.graph,
                config: dendros.config,
            });
            setLastSaved(new Date());
        } catch (err) {
            alert(`Error saving: ${err}`);
        } finally {
            setSaving(false);
        }
    };

    const handleTitleEdit = () => {
        if (!dendros) return;
        setTempTitle(dendros.config.title);
        setEditingTitle(true);
    };

    const handleTitleSave = async () => {
        if (!dendros || !tempTitle.trim()) {
            setEditingTitle(false);
            return;
        }

        setSaving(true);
        try {
            const updatedConfig = {
                ...dendros.config,
                title: tempTitle.trim(),
            };
            await updateDendros(dendrosId, {
                config: updatedConfig,
            });
            setDendros({
                ...dendros,
                config: updatedConfig,
            });
            setLastSaved(new Date());
            setEditingTitle(false);
        } catch (err) {
            alert(`Error updating title: ${err}`);
        } finally {
            setSaving(false);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setEditingTitle(false);
        }
    };

    const handleDescriptionEdit = () => {
        if (!dendros) return;
        setTempDescription(dendros.config.description || '');
        setEditingDescription(true);
    };

    const handleDescriptionSave = async () => {
        if (!dendros) {
            setEditingDescription(false);
            return;
        }

        setSaving(true);
        try {
            const updatedConfig = {
                ...dendros.config,
                description: tempDescription.trim(),
            };
            await updateDendros(dendrosId, {
                config: updatedConfig,
            });
            setDendros({
                ...dendros,
                config: updatedConfig,
            });
            setLastSaved(new Date());
            setEditingDescription(false);
        } catch (err) {
            alert(`Error updating description: ${err}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleDescriptionSave();
        } else if (e.key === 'Escape') {
            setEditingDescription(false);
        }
    };

    const handlePublish = async () => {
        if (!dendros) return;

        const isUnpublishing = dendros.config.isPublished;

        // If unpublishing, ask for confirmation
        if (isUnpublishing) {
            if (!confirm('Are you sure you want to unpublish this Dendros? The public link will clearly stop working, but existing data will be preserved.')) {
                return;
            }
        } else {
            // Validate before publishing
            const validation = validateGraph(dendros.graph);
            if (!validation.isValid) {
                alert('Cannot publish: Graph has validation errors. Please fix them first.');
                return;
            }
        }

        setSaving(true);
        try {
            const updatedConfig = {
                ...dendros.config,
                isPublished: !isUnpublishing,
            };
            await updateDendros(dendrosId, {
                config: updatedConfig,
            });
            setDendros({
                ...dendros,
                config: updatedConfig,
            });
            setLastSaved(new Date());
            alert(isUnpublishing ? '⏸️ Unpublished successfully. The public link is now paused.' : '✅ Published successfully!');
        } catch (err) {
            alert(`Error updating publish status: ${err}`);
        } finally {
            setSaving(false);
        }
    };

    const handleGraphChange = (updatedDendros: Dendros) => {
        setDendros(updatedDendros);
    };

    if (loading || loadingDendros) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading editor...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
                    <h2 className="text-red-200 text-xl font-bold mb-2">Error</h2>
                    <p className="text-red-300">{error}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!dendros) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-purple-200 hover:text-white transition-colors"
                    >
                        ← Back
                    </button>
                    <div>
                        {editingTitle ? (
                            <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={handleTitleKeyDown}
                                autoFocus
                                className="bg-white/10 text-white text-xl font-bold px-2 py-1 rounded border border-purple-500 focus:outline-none focus:border-purple-400"
                            />
                        ) : (
                            <h1
                                className="text-white text-xl font-bold cursor-pointer hover:text-purple-200 transition-colors"
                                onClick={handleTitleEdit}
                                title="Click to edit title"
                            >
                                {dendros.config.title}
                            </h1>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            {editingDescription ? (
                                <input
                                    type="text"
                                    value={tempDescription}
                                    onChange={(e) => setTempDescription(e.target.value)}
                                    onBlur={handleDescriptionSave}
                                    onKeyDown={handleDescriptionKeyDown}
                                    autoFocus
                                    placeholder="Add a description..."
                                    className="bg-white/10 text-purple-300 text-sm px-2 py-1 rounded border border-purple-500 focus:outline-none focus:border-purple-400 min-w-[300px]"
                                />
                            ) : (
                                <p
                                    className="text-purple-300 cursor-pointer hover:text-purple-200 transition-colors"
                                    onClick={handleDescriptionEdit}
                                    title="Click to edit description"
                                >
                                    {dendros.config.description || 'Add a description...'}
                                </p>
                            )}
                            {lastSaved && (
                                <span className="text-green-300">
                                    ✓ Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Undo/Redo Buttons */}
                    <div className="flex items-center gap-2 mr-2">
                        <button
                            onClick={() => editorRef.current?.undo()}
                            disabled={!editorRef.current?.canUndo()}
                            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/40 disabled:cursor-not-allowed transition-all text-white shadow-lg"
                            title="Undo (Ctrl+Z)"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => editorRef.current?.redo()}
                            disabled={!editorRef.current?.canRedo()}
                            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/40 disabled:cursor-not-allowed transition-all text-white shadow-lg"
                            title="Redo (Ctrl+Y)"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                            </svg>
                        </button>
                        <div className="w-px h-6 bg-purple-400 mx-1"></div>
                    </div>
                    <button
                        onClick={() => window.open(`/${dendrosId}`, '_blank')}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                        title="Preview as visitor"
                    >
                        See as Visitor
                    </button>
                    <button
                        onClick={() => router.push(`/${dendrosId}/admin/analytics`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                    >
                        Analytics
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg transition-colors font-semibold text-white ${dendros.config.isPublished
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-green-500 hover:bg-green-600 disabled:bg-green-500/50'
                            }`}
                    >
                        {dendros.config.isPublished ? '⏸️ Unpublish' : '🚀 Publish'}
                    </button>
                </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 relative">
                <EditorCanvas ref={editorRef} dendros={dendros} onGraphChange={handleGraphChange} />
                <ValidationOverlay graph={dendros.graph} />
            </div>
        </div>
    );
}
