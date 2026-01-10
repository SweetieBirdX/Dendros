'use client';

import { useAuth } from '@/contexts/AuthContext';
import { seedDatabase } from '@/lib/firestore';
import { testGraphWalker } from '@/lib/graphWalkerExamples';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<string | null>(null);

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

    const handleTestGraphWalker = () => {
        setTestResult('Running tests... Check browser console for detailed output.');

        // Run tests and capture console output
        const originalLog = console.log;
        const logs: string[] = [];

        console.log = (...args) => {
            logs.push(args.join(' '));
            originalLog(...args);
        };

        try {
            testGraphWalker();
            setTestResult(`✅ Tests completed! Check browser console for details.\n\nSummary:\n${logs.slice(0, 5).join('\n')}\n... (see console for full output)`);
        } catch (error) {
            setTestResult(`❌ Test error: ${error}`);
        } finally {
            console.log = originalLog;
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
                                🧠 Graph Walker Test
                            </h2>
                            <p className="text-purple-200 mb-4 text-sm">
                                Test the Graph Walker logic with example flows (Yes/No, Numeric Range).
                            </p>
                            <button
                                onClick={handleTestGraphWalker}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                            >
                                Run Graph Walker Tests
                            </button>

                            {testResult && (
                                <div className="mt-4 p-4 bg-black/30 rounded-lg">
                                    <pre className="text-sm text-white font-mono whitespace-pre-wrap">{testResult}</pre>
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
                                ✅ Phase 2 Progress
                            </h2>
                            <p className="text-purple-200 text-sm mb-4">
                                Core Logic Implementation
                            </p>
                            <ul className="text-purple-300 text-sm space-y-2">
                                <li>✓ Schema & TypeScript Interfaces</li>
                                <li>✓ Graph Walker Function</li>
                                <li className="text-purple-400">⏳ Cycle Detection (Next)</li>
                                <li className="text-purple-400">⏳ Firestore Validation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
