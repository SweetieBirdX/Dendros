import type { RootNodeData } from '@/types/graph';

interface RootStepProps {
    data: RootNodeData;
    onNext: () => void;
}

export default function RootStep({ data, onNext }: RootStepProps) {
    return (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-white mb-6">
                {data.label}
            </h2>

            {data.welcomeMessage && (
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                    {data.welcomeMessage}
                </p>
            )}

            <button
                onClick={onNext}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50"
            >
                Start Now
            </button>
        </div>
    );
}
