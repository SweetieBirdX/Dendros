'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-sm border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🌳</span>
                        <span className="text-white text-xl font-bold">Dendros</span>
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-all font-semibold"
                    >
                        Login
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-6 pt-20">
                <div className="text-center max-w-5xl">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Build Interactive{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            Decision Trees
                        </span>
                        {' '}in Minutes
                    </h1>
                    <p className="text-xl md:text-2xl text-purple-200 mb-12 max-w-3xl mx-auto">
                        Create smart workflows, surveys, and decision guides with our visual editor.
                        No coding required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-lg transition-all font-semibold text-lg shadow-lg hover:shadow-purple-500/50 hover:scale-105 transform"
                        >
                            Get Started Now
                        </button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg transition-all font-semibold text-lg border border-white/20"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
                        Everything you need to build smart workflows
                    </h2>
                    <p className="text-xl text-purple-200 text-center mb-16 max-w-2xl mx-auto">
                        Powerful features designed for creators, researchers, and teams
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1: Visual Editor */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105 transform">
                            <div className="text-5xl mb-4">🎨</div>
                            <h3 className="text-2xl font-bold text-white mb-3">Visual Editor</h3>
                            <p className="text-purple-200 leading-relaxed">
                                Drag-and-drop interface for building complex decision trees.
                                Create nodes, connect paths, and design workflows visually.
                            </p>
                            <ul className="mt-4 space-y-2 text-purple-300">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Drag-and-drop nodes
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Real-time preview
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Undo/Redo support
                                </li>
                            </ul>
                        </div>

                        {/* Feature 2: Smart Logic */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105 transform">
                            <div className="text-5xl mb-4">⚡</div>
                            <h3 className="text-2xl font-bold text-white mb-3">Smart Logic</h3>
                            <p className="text-purple-200 leading-relaxed">
                                Conditional branching and dynamic workflows.
                                Build intelligent decision paths that adapt to user responses.
                            </p>
                            <ul className="mt-4 space-y-2 text-purple-300">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Conditional logic
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Multiple choice paths
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Dynamic branching
                                </li>
                            </ul>
                        </div>

                        {/* Feature 3: Analytics */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all hover:scale-105 transform">
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold text-white mb-3">Visual Analytics</h3>
                            <p className="text-purple-200 leading-relaxed">
                                Track user journeys and visualize traffic patterns.
                                See which paths are most popular at a glance.
                            </p>
                            <ul className="mt-4 space-y-2 text-purple-300">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Traffic visualization
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    User path tracking
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-400">✓</span>
                                    Real-time insights
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-20 px-6 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
                        Perfect for any use case
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3">📋 Surveys & Forms</h3>
                            <p className="text-purple-200">
                                Create dynamic surveys that adapt based on user responses.
                                Perfect for research and data collection.
                            </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3">🎯 Decision Guides</h3>
                            <p className="text-purple-200">
                                Help users make informed decisions with interactive guides.
                                Great for product recommendations and troubleshooting.
                            </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3">🔄 Workflows</h3>
                            <p className="text-purple-200">
                                Design complex business workflows and processes.
                                Visualize and optimize your operations.
                            </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-3">🎮 Interactive Stories</h3>
                            <p className="text-purple-200">
                                Build branching narratives and interactive experiences.
                                Perfect for education and entertainment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-purple-200 mb-8">
                        Join creators building amazing decision trees today
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-12 py-4 rounded-lg transition-all font-semibold text-lg shadow-lg hover:shadow-purple-500/50 hover:scale-105 transform"
                    >
                        Start Building Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black/20 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🌳</span>
                        <span className="text-white font-semibold">Dendros</span>
                        <span className="text-purple-300 text-sm">© 2026</span>
                    </div>
                    <div className="flex gap-6 text-purple-300">
                        <a href="https://github.com/SweetieBirdX/Dendros" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            GitHub
                        </a>
                        <a href="https://x.com/eyupefekrkc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
