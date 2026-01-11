'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchDendros } from '@/lib/firestore';
import type { Dendros } from '@/types/graph';
import RendererLayout from '@/components/Renderer/RendererLayout';

export default function PublicRendererPage() {
    const params = useParams();
    const dendrosId = params.id as string;

    const [dendros, setDendros] = useState<Dendros | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDendros() {
            try {
                const data = await fetchDendros(dendrosId);

                if (!data) {
                    setError('Dendros not found');
                    return;
                }

                setDendros(data);
            } catch (err) {
                setError('Failed to load Dendros');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadDendros();
    }, [dendrosId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2 text-red-400">Error</h1>
                    <p className="text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!dendros) return null;

    if (!dendros.config.isPublished) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2 text-yellow-400">Not Available</h1>
                    <p className="text-slate-400">This Dendros has not been published yet.</p>
                </div>
            </div>
        );
    }

    return (
        <RendererLayout title={dendros.config.title}>
            <div className="text-center">
                <p className="text-slate-300 mb-8">{dendros.config.description}</p>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-slate-400">Flow Renderer Content Will Go Here</p>
                    <p className="text-xs text-slate-500 mt-2">Node Count: {dendros.graph.nodes.length}</p>
                </div>
            </div>
        </RendererLayout>
    );
}
