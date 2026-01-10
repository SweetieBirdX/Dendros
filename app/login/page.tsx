'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
    const { user, loading, signIn, signUp } = useAuth();
    const router = useRouter();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isSignUp) {
                // Sign Up validation
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsSubmitting(false);
                    return;
                }
                if (password.length < 6) {
                    setError('Password must be at least 6 characters');
                    setIsSubmitting(false);
                    return;
                }
                await signUp(email, password);
            } else {
                // Sign In
                await signIn(email, password);
            }
        } catch (err: any) {
            // Firebase error handling
            const errorCode = err.code;
            switch (errorCode) {
                case 'auth/email-already-in-use':
                    setError('This email is already registered');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                case 'auth/user-not-found':
                    setError('No account found with this email');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password');
                    break;
                case 'auth/weak-password':
                    setError('Password is too weak');
                    break;
                default:
                    setError('An error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Dendros
                    </h1>
                    <p className="text-purple-200 text-sm">
                        Graph-Based Workflow Engine
                    </p>

                    <div className="pt-4">
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => {
                                    setIsSignUp(false);
                                    setError('');
                                }}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${!isSignUp
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/5 text-purple-200 hover:bg-white/10'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    setIsSignUp(true);
                                    setError('');
                                }}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${isSignUp
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/5 text-purple-200 hover:bg-white/10'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {isSignUp && (
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                                    <p className="text-red-200 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {isSubmitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    <p className="text-xs text-purple-300 pt-4">
                        {isSignUp
                            ? 'Create an account to start building branching narratives'
                            : 'Sign in to manage your branching narratives'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
