'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchDendros, submitResponse } from '@/lib/firestore';
import type { Dendros } from '@/types/graph';
import RendererLayout from '@/components/Renderer/RendererLayout';

import { useFlowNavigation } from '@/hooks/useFlowNavigation';
import RootStep from '@/components/Renderer/Steps/RootStep';
import QuestionStep from '@/components/Renderer/Steps/QuestionStep';

import EndStep from '@/components/Renderer/Steps/EndStep';
import InfoStep from '@/components/Renderer/Steps/InfoStep';
import type {
    RootNodeData,
    QuestionNodeData,
    EndNodeData,
    InfoNodeData
} from '@/types/graph';

export default function PublicRendererPage() {
    const params = useParams();
    const dendrosId = params.id as string;

    const [dendros, setDendros] = useState<Dendros | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useEffect(() => {
        async function loadDendros() {
            try {
                const data = await fetchDendros(dendrosId);

                if (!data) {
                    setError('Dendros not found');
                    return;
                }

                setDendros(data);
            } catch (err) {
                setError('Failed to load Dendros');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadDendros();
    }, [dendrosId]);

    // Initialize flow navigation once dendros is loaded
    const {
        currentNode,
        next,
        back,
        reset,
        canGoBack,
        answers,
        path
    } = useFlowNavigation({
        graph: dendros?.graph || { nodes: [], edges: [] }
    });

    // Handle submission when reaching End node
    useEffect(() => {
        async function handleSubmission() {
            if (currentNode?.type === 'end' && !hasSubmitted && dendros) {
                setHasSubmitted(true);
                try {
                    await submitResponse(dendros.dendrosId, {
                        dendrosId: dendros.dendrosId,
                        path: path,
                        completedAt: new Date(),
                    });
                    console.log('Response submitted successfully');
                } catch (err) {
                    console.error('Failed to submit response:', err);
                }
            }
        }

        handleSubmission();
    }, [currentNode, hasSubmitted, dendros, path]);

    // Reset submission state when resetting flow
    const handleReset = () => {
        setHasSubmitted(false);
        reset();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2 text-red-400">Error</h1>
                    <p className="text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!dendros) return null;

    if (!dendros.config.isPublished) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
                <div className="text-center max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
                    <div className="text-4xl mb-4">⏸️</div>
                    <h1 className="text-2xl font-bold mb-2 text-amber-400">Not Currently Accepting Responses</h1>
                    <p className="text-slate-300">
                        This workflow is currently paused or under maintenance.
                        Please check back later!
                    </p>
                </div>
            </div>
        );
    }

    const renderCurrentStep = () => {
        if (!currentNode) {
            return (
                <div className="text-center text-red-400">
                    <p>Something went wrong. Could not find the next step.</p>
                    <button
                        onClick={handleReset}
                        className="mt-4 text-sm text-slate-400 hover:text-white underline"
                    >
                        Reset Flow
                    </button>
                </div>
            );
        }

        switch (currentNode.type) {
            case 'root':
                return (
                    <RootStep
                        data={currentNode.data as RootNodeData}
                        onNext={() => next()}
                    />
                );
            case 'question':
                return (
                    <QuestionStep
                        key={currentNode.id} // Force re-render on node change
                        data={currentNode.data as QuestionNodeData}
                        onNext={(answer) => next(answer)}
                        onBack={canGoBack ? back : undefined}
                        initialValue={answers[currentNode.id]}
                    />
                );
            case 'end':
                return (
                    <EndStep
                        data={currentNode.data as EndNodeData}
                        onStartOver={handleReset}
                    />
                );
            case 'info':
                return (
                    <InfoStep
                        data={currentNode.data as InfoNodeData}
                        onNext={() => next()}
                    />
                );
            default:
                // Logic nodes should be auto-skipped by useFlowNavigation, so this shouldn't render usually
                return (
                    <div className="text-center text-red-400">
                        Processing...
                    </div>
                );
        }
    };

    return (
        <RendererLayout title={dendros.config.title}>
            <div className="w-full">
                {renderCurrentStep()}
            </div>
        </RendererLayout>
    );
}
