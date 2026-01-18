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
        // Manual Validation to replace browser default
        if (!email || !password) {
            setError('Please fill in all required fields');
            return;
        }

        if (isSignUp && !confirmPassword) {
            setError('Please fill in all required fields');
            return;
        }

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
                case 'auth/invalid-credential':
                    setError('Invalid email or password');
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
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Dendros
                    </h1>
                    <p className="text-[#A3A3A3] text-sm">
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
                                    ? 'bg-white text-black'
                                    : 'bg-white/5 text-[#D4D4D4] hover:bg-white/10'
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
                                    ? 'bg-white text-black'
                                    : 'bg-white/5 text-[#D4D4D4] hover:bg-white/10'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
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
                                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
                                    />
                                </div>
                            )}

                            {error && (
                                <div className="bg-[#171717] border border-white rounded-lg p-3">
                                    <p className="text-white text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-white hover:bg-[#E5E5E5] disabled:bg-[#737373] text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {isSubmitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                            </button>
                        </form>
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-6">
                        <p className="text-sm text-[#D4D4D4] font-medium">
                            {isSignUp ? (
                                <>
                                    <span>Ready to start?</span>
                                    <span className="block text-[#A3A3A3] text-xs mt-1 font-normal">
                                        Create an account to start building branching narratives
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>Welcome back</span>
                                    <span className="block text-[#A3A3A3] text-xs mt-1 font-normal">
                                        Sign in to manage your branching narratives
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
