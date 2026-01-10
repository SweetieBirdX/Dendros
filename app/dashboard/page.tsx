'use client';

import { useAuth } from '@/contexts/AuthContext';
import { seedDatabase } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleSeedDatabase = async () => {
        if (!user) return;

        setSeeding(true);
        setSeedResult(null);

        try {
            const dendrosId = await seedDatabase(user.uid);
            setSeedResult(`✅ Database seeded successfully! Dendros ID: ${dendrosId}`);
        } catch (error) {
            setSeedResult(`❌ Error seeding database: ${error}`);
        } finally {
            setSeeding(false);
        }
    };

    if (loading) {
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
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Dashboard
                            </h1>
                            <p className="text-purple-200">
                                Welcome, {user.displayName || user.email}
                            </p>
                        </div>
                        <button
                            onClick={signOut}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
                        >
                            Sign Out
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                🌱 Database Seeding
                            </h2>
                            <p className="text-purple-200 mb-4 text-sm">
                                Create a sample Dendros document in Firestore to test the connection.
                            </p>
                            <button
                                onClick={handleSeedDatabase}
                                disabled={seeding}
                                className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                            >
                                {seeding ? 'Seeding...' : 'Seed Database'}
                            </button>

                            {seedResult && (
                                <div className="mt-4 p-4 bg-black/30 rounded-lg">
                                    <p className="text-sm text-white font-mono">{seedResult}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                📊 Your Dendros
                            </h2>
                            <p className="text-purple-200 text-sm">
                                Your branching narratives will appear here. (Coming in Phase 3)
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-2">
                                ✅ Phase 1 Complete
                            </h2>
                            <p className="text-purple-200 text-sm mb-4">
                                The foundation is ready. Next up: Phase 2 - The Core Logic
                            </p>
                            <ul className="text-purple-300 text-sm space-y-2">
                                <li>✓ Next.js 14 + TypeScript + Tailwind</li>
                                <li>✓ Firebase Auth & Firestore</li>
                                <li>✓ Authentication System</li>
                                <li>✓ Middleware Protection</li>
                                <li>✓ Zustand State Management</li>
                                <li>✓ Firestore CRUD Services</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
