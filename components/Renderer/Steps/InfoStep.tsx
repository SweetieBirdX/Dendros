import type { InfoNodeData } from '@/types/graph';

interface InfoStepProps {
    data: InfoNodeData;
    onNext: () => void;
}

export default function InfoStep({ data, onNext }: InfoStepProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                {data.label}
            </h2>

            {/* Description / Content */}
            {data.description && (
                <div className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto text-center leading-relaxed whitespace-pre-line">
                    {data.description}
                </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-center mt-8">
                <button
                    onClick={onNext}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <span>{data.buttonText || 'Continue'}</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
