'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="text-center space-y-6 p-8">
                <h1 className="text-6xl font-bold text-white mb-4">
                    Dendros
                </h1>
                <p className="text-xl text-purple-200 max-w-2xl">
                    Graph-Based Workflow Engine for Dynamic, Branching Narratives
                </p>
                <div className="pt-8">
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg transition-colors font-semibold text-lg"
                    >
                        Get Started
                    </button>
                </div>
                <div className="pt-8 text-purple-300">
                    <p className="text-sm">🌳 Phase 1: Foundation - Complete</p>
                </div>
            </div>
        </div>
    );
}
