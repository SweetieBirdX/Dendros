import { ReactNode } from 'react';

interface RendererLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function RendererLayout({ children, title }: RendererLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="w-full max-w-2xl bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background decorative blob */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    {title && (
                        <h1 className="text-2xl font-bold text-white mb-8 text-center opacity-90">
                            {title}
                        </h1>
                    )}
                    {children}
                </div>
            </div>

            <div className="mt-8 text-white/20 text-sm">
                Powered by Dendros
            </div>
        </div>
    );
}
