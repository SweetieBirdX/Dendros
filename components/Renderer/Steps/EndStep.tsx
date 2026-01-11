import type { EndNodeData } from '@/types/graph';
import { useRouter } from 'next/navigation';

interface EndStepProps {
    data: EndNodeData;
    onStartOver: () => void;
}

export default function EndStep({ data, onStartOver }: EndStepProps) {
    const router = useRouter();

    return (
        <div className="text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
                {data.label || 'Completed!'}
            </h2>

            <p className="text-lg text-slate-300 mb-8">
                {data.successMessage || 'Thank you for completing the flow.'}
            </p>

            <div className="flex flex-col gap-3">
                {data.redirectUrl && (
                    <a
                        href={data.redirectUrl}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                    >
                        Continue to Website
                    </a>
                )}

                <button
                    onClick={onStartOver}
                    className="text-slate-400 hover:text-white px-6 py-2 transition-colors text-sm"
                >
                    Submit Another Response
                </button>
            </div>
        </div>
    );
}
