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
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            setHasUnsavedChanges(false);
            setMobileMenuOpen(false);
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
            if (!confirm('Are you sure you want to unpublish this Dendros? The public link will stop working, but existing data will be preserved.')) {
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
            setMobileMenuOpen(false);
            alert(isUnpublishing ? '⏸️ Unpublished successfully. The public link is now paused.' : '✅ Published successfully!');
        } catch (err) {
            alert(`Error updating publish status: ${err}`);
        } finally {
            setSaving(false);
        }
    };

    const handleGraphChange = (updatedDendros: Dendros) => {
        setDendros(updatedDendros);
        setHasUnsavedChanges(true);
    };

    if (loading || loadingDendros) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-white text-xl">Loading editor...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
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
        <div className="h-screen flex flex-col bg-[#1A1A1A]">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-3 md:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-[#D4D4D4] hover:text-white transition-colors flex-shrink-0"
                    >
                        ← <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {editingTitle ? (
                            <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={handleTitleKeyDown}
                                autoFocus
                                className="bg-white/10 text-white text-lg md:text-xl font-bold px-2 py-1 rounded border border-[#06B6D4] focus:outline-none focus:border-[#14B8A6] w-full"
                            />
                        ) : (
                            <>
                                <h1
                                    className="text-white text-lg md:text-xl font-bold cursor-pointer hover:text-[#D4D4D4] transition-colors truncate max-w-[180px] md:max-w-none"
                                    onClick={handleTitleEdit}
                                    title="Click to edit title"
                                >
                                    {dendros.config.title}
                                </h1>
                                {/* Compact Save Indicator */}
                                {saving && (
                                    <div className="animate-spin flex-shrink-0" title="Saving...">
                                        <svg className="w-5 h-5 text-[#06B6D4]" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                                {!saving && lastSaved && (
                                    <span
                                        className="text-green-400 text-lg flex-shrink-0"
                                        title={`Saved at ${lastSaved.toLocaleTimeString()}`}
                                    >
                                        ✓
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Compact Undo/Redo */}
                    <div className="flex items-center gap-1 mr-1">
                        <button
                            onClick={() => editorRef.current?.undo()}
                            disabled={!editorRef.current?.canUndo()}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                            title="Undo (Ctrl+Z)"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </button>
                        <button
                            onClick={() => editorRef.current?.redo()}
                            disabled={!editorRef.current?.canRedo()}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                            title="Redo (Ctrl+Y)"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                            </svg>
                        </button>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <button
                        onClick={() => window.open(`/${dendrosId}`, '_blank')}
                        className="bg-[#262626] hover:bg-[#404040] text-white px-4 py-2 rounded-lg transition-colors font-semibold border border-[#404040]"
                        title="Preview as visitor"
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => router.push(`/${dendrosId}/admin/analytics`)}
                        className="bg-[#262626] hover:bg-[#404040] text-white px-4 py-2 rounded-lg transition-colors font-semibold border border-[#404040]"
                    >
                        Analytics
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg transition-colors font-semibold ${hasUnsavedChanges
                            ? 'bg-white hover:bg-[#E5E5E5] text-black'
                            : 'bg-[#262626] hover:bg-[#404040] text-white border border-[#404040]'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={saving}
                        className={`px-4 py-2 rounded-lg transition-colors font-semibold ${dendros.config.isPublished
                            ? 'bg-[#171717] hover:bg-[#262626] text-white border border-white'
                            : 'bg-white hover:bg-[#E5E5E5] disabled:bg-[#737373] text-black'
                            }`}
                    >
                        {dendros.config.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                </div>

                {/* Mobile Actions */}
                <div className="flex md:hidden items-center gap-2">
                    {/* Undo/Redo on mobile */}
                    <button
                        onClick={() => editorRef.current?.undo()}
                        disabled={!editorRef.current?.canUndo()}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                        title="Undo"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={() => editorRef.current?.redo()}
                        disabled={!editorRef.current?.canRedo()}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                        title="Redo"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                        </svg>
                    </button>
                    {/* Hamburger Menu */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                        title="Menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-black/40 backdrop-blur-sm border-b border-white/10 px-4 py-3 space-y-2">
                    <button
                        onClick={() => {
                            window.open(`/${dendrosId}`, '_blank');
                            setMobileMenuOpen(false);
                        }}
                        className="w-full bg-[#262626] hover:bg-[#404040] text-white px-4 py-2 rounded-lg transition-colors font-semibold border border-[#404040]"
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => {
                            router.push(`/${dendrosId}/admin/analytics`);
                            setMobileMenuOpen(false);
                        }}
                        className="w-full bg-[#262626] hover:bg-[#404040] text-white px-4 py-2 rounded-lg transition-colors font-semibold border border-[#404040]"
                    >
                        Analytics
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full px-4 py-2 rounded-lg transition-colors font-semibold ${hasUnsavedChanges
                            ? 'bg-white hover:bg-[#E5E5E5] text-black'
                            : 'bg-[#262626] hover:bg-[#404040] text-white border border-[#404040]'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={saving}
                        className={`w-full px-4 py-2 rounded-lg transition-colors font-semibold ${dendros.config.isPublished
                            ? 'bg-[#171717] hover:bg-[#262626] text-white border border-white'
                            : 'bg-white hover:bg-[#E5E5E5] disabled:bg-[#737373] text-black'
                            }`}
                    >
                        {dendros.config.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                </div>
            )}

            {/* Editor Canvas */}
            <div className="flex-1 relative">
                <EditorCanvas ref={editorRef} dendros={dendros} onGraphChange={handleGraphChange} />
                <ValidationOverlay graph={dendros.graph} />
            </div>
        </div>
    );
}
