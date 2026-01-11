'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchUserDendros } from '@/lib/firestore';
import type { Dendros } from '@/types/graph';

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [dendrosList, setDendrosList] = useState<Dendros[]>([]);
    const [loadingDendros, setLoadingDendros] = useState(true);

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

    const handleCreateNew = () => {
        // Navigate to a new Dendros creation flow (to be implemented)
        alert('Create new Dendros - Coming soon!');
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
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                            >
                                + New Dendros
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
                                        {dendros.config.isPublished && (
                                            <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                                Published
                                            </span>
                                        )}
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
        </div>
    );
}
