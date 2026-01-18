import { ReactNode } from 'react';

interface RendererLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function RendererLayout({ children, title }: RendererLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-4">
            <div className="w-full max-w-2xl bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">


                <div className="relative z-10">
                    {title && (
                        <h1 className="text-2xl font-bold text-white mb-8 text-center opacity-90">
                            {title}
                        </h1>
                    )}
                    {children}
                </div>
            </div>

            <div className="mt-8 text-center space-y-2">
                <div className="text-[#D4D4D4] text-sm font-medium">Powered by Dendros</div>
                <div className="text-[#A3A3A3] text-xs max-w-md px-4">
                    Don't send any critical or personal information via Dendros.
                </div>
                <div className="text-[#A3A3A3] text-xs">
                    If you see any suspicious Dendros,{' '}
                    <a
                        href="https://github.com/SweetieBirdX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white transition-colors"
                    >
                        reach us!
                    </a>
                </div>
            </div>
        </div>
    );
}
