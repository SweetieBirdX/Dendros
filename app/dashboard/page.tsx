'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchUserDendros, deleteDendros, createNewDendros } from '@/lib/firestore';
import type { Dendros } from '@/types/graph';
import ConfirmDialog from '@/components/Editor/ConfirmDialog';

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [dendrosList, setDendrosList] = useState<Dendros[]>([]);
    const [loadingDendros, setLoadingDendros] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; dendrosId: string | null }>({ isOpen: false, dendrosId: null });
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function loadUserDendros() {
            if (!user) return;

            try {
                const dendros = await fetchUserDendros(user.uid);
                setDendrosList(dendros);
            } catch (error) {
                console.error('Error loading dendros:', error);
            } finally {
                setLoadingDendros(false);
            }
        }

        if (user) {
            loadUserDendros();
        }
    }, [user]);

    const handleCreateNew = async () => {
        if (!user) return;

        setCreating(true);
        try {
            const newDendrosId = await createNewDendros(user.uid);
            router.push(`/${newDendrosId}/admin`);
        } catch (error) {
            console.error('Error creating dendros:', error);
            alert('Failed to create new Dendros. Please try again.');
            setCreating(false);
        }
    };

    const handleDeleteClick = (dendrosId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setDeleteConfirm({ isOpen: true, dendrosId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.dendrosId) return;

        try {
            await deleteDendros(deleteConfirm.dendrosId);
            // Remove from local state
            setDendrosList(prev => prev.filter(d => d.dendrosId !== deleteConfirm.dendrosId));
            setDeleteConfirm({ isOpen: false, dendrosId: null });
        } catch (error) {
            console.error('Error deleting dendros:', error);
            alert('Failed to delete. Please try again.');
        }
    };

    const handleShareClick = (dendrosId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/${dendrosId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(dendrosId);
            setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
        });
    };

    if (loading || loadingDendros) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Dashboard
                            </h1>
                            <p className="text-purple-200">
                                Welcome, {user.displayName || user.email}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCreateNew}
                                disabled={creating}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                            >
                                {creating ? 'Creating...' : '+ New Dendros'}
                            </button>
                            <button
                                onClick={signOut}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dendros List */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h2 className="text-2xl font-semibold text-white mb-6">Your Dendros</h2>

                    {dendrosList.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-purple-300 text-lg mb-4">No Dendros yet</div>
                            <p className="text-purple-200/60 text-sm mb-6">
                                Create your first interactive flow to get started
                            </p>
                            <button
                                onClick={handleCreateNew}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                            >
                                Create Your First Dendros
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                            {dendrosList.map((dendros) => (
                                <div
                                    key={dendros.dendrosId}
                                    onClick={() => router.push(`/${dendros.dendrosId}/admin`)}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl p-6 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                                            {dendros.config.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {dendros.config.isPublished ? (
                                                <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="bg-gray-500/20 text-gray-300 text-xs px-2 py-1 rounded-full border border-gray-500/30">
                                                    Unpublished
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => handleShareClick(dendros.dendrosId, e)}
                                                className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
                                                title="Copy Link"
                                            >
                                                {copiedId === dendros.dendrosId ? (
                                                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(dendros.dendrosId, e)}
                                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                title="Delete Dendros"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {dendros.config.description && (
                                        <p className="text-purple-200/80 text-sm mb-4 line-clamp-2">
                                            {dendros.config.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-purple-300/60">
                                        <span>{dendros.graph.nodes.length} nodes</span>
                                        <span>
                                            {dendros.updatedAt
                                                ? new Intl.DateTimeFormat('tr-TR', {
                                                    day: '2-digit',
                                                    month: 'short'
                                                }).format(dendros.updatedAt)
                                                : 'Recently'
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Dendros"
                message="Are you sure you want to delete this Dendros? All responses will be lost and this action cannot be retrieved."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, dendrosId: null })}
                type="danger"
            />
        </div>
    );
}
