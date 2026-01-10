'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { fetchDendros, checkOwnership } from '@/lib/firestore';
import type { Dendros } from '@/types/graph';
import EditorCanvas from '@/components/Editor/EditorCanvas';

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [dendros, setDendros] = useState<Dendros | null>(null);
    const [loadingDendros, setLoadingDendros] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                        <h1 className="text-white text-xl font-bold">{dendros.config.title}</h1>
                        <p className="text-purple-300 text-sm">{dendros.config.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
                        Save
                    </button>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
                        Publish
                    </button>
                </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1">
                <EditorCanvas dendros={dendros} />
            </div>
        </div>
    );
}
