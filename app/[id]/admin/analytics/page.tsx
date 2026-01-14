'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, Fragment, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchDendros, checkOwnership, fetchSubmissions } from '@/lib/firestore';
import type { Dendros, Submission } from '@/types/graph';
import AnalyticsCanvas from '@/components/Analytics/AnalyticsCanvas';

export default function AnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [dendros, setDendros] = useState<Dendros | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportButtonRef = useRef<HTMLButtonElement>(null);

    const dendrosId = params.id as string;

    // Export functions
    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportJSON = () => {
        console.log('Export JSON clicked', { dendros, submissions });
        if (!dendros) {
            alert('No data to export');
            return;
        }
        const data = {
            dendrosId,
            title: dendros.config.title,
            exportDate: new Date().toISOString(),
            totalSubmissions: submissions.length,
            submissions: submissions.map(s => ({
                completedAt: s.completedAt,
                path: s.path.map(p => p.nodeId)
            }))
        };
        downloadFile(
            JSON.stringify(data, null, 2),
            `${dendros.config.title || 'dendros'}-submissions.json`,
            'application/json'
        );
        setShowExportMenu(false);
    };

    const exportCSV = () => {
        console.log('Export CSV clicked', { dendros, submissions });
        if (!dendros) {
            alert('No data to export');
            return;
        }
        const headers = ['Submission #', 'Completed At', 'Path'];
        const rows = submissions.map((s, i) => [
            (i + 1).toString(),
            new Date(s.completedAt).toLocaleString(),
            s.path.map(p => p.nodeId).join(' → ')
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        downloadFile(
            csv,
            `${dendros?.config.title || 'dendros'}-submissions.csv`,
            'text/csv'
        );
        setShowExportMenu(false);
    };

    const exportGraph = () => {
        console.log('Export Graph clicked', { dendros });
        if (!dendros) {
            alert('No data to export');
            return;
        }
        const graphData = {
            dendrosId,
            title: dendros.config.title,
            exportDate: new Date().toISOString(),
            graph: dendros.graph
        };
        downloadFile(
            JSON.stringify(graphData, null, 2),
            `${dendros.config.title || 'dendros'}-graph.json`,
            'application/json'
        );
        setShowExportMenu(false);
    };

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Don't close if clicking on the export button or inside the dropdown
            if (showExportMenu &&
                !exportButtonRef.current?.contains(target) &&
                !target.closest('[data-export-dropdown]')) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportMenu]);

    useEffect(() => {
        async function loadData() {
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                // Check ownership
                const isOwner = await checkOwnership(dendrosId, user.uid);
                if (!isOwner) {
                    setError('You do not have permission to view analytics for this Dendros');
                    return;
                }

                // Fetch Dendros and submissions
                const [dendrosData, submissionsData] = await Promise.all([
                    fetchDendros(dendrosId),
                    fetchSubmissions(dendrosId)
                ]);

                if (!dendrosData) {
                    setError('Dendros not found');
                    return;
                }

                setDendros(dendrosData);
                setSubmissions(submissionsData);
            } catch (err) {
                setError(`Error loading analytics: ${err}`);
            } finally {
                setLoadingData(false);
            }
        }

        if (!loading) {
            loadData();
        }
    }, [user, loading, dendrosId, router]);

    const toggleRow = (submissionId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(submissionId)) {
            newExpanded.delete(submissionId);
        } else {
            newExpanded.add(submissionId);
        }
        setExpandedRows(newExpanded);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getNodeLabel = (nodeId: string): string => {
        if (!dendros) return nodeId;
        const node = dendros.graph.nodes.find(n => n.id === nodeId);
        if (!node) return nodeId;

        // Return the label from node data
        return node.data.label || nodeId;
    };

    if (loading || loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">Loading analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
                    <h2 className="text-red-200 text-xl font-bold mb-2">Error</h2>
                    <p className="text-red-300">{error}</p>
                    <button
                        onClick={() => router.push(`/${dendrosId}/admin`)}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Editor
                    </button>
                </div>
            </div>
        );
    }

    if (!dendros) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6 overflow-visible">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Analytics
                            </h1>
                            <p className="text-purple-200">{dendros.config.title}</p>
                        </div>
                        <div className="flex items-center gap-3 overflow-visible">
                            {/* View Toggle */}
                            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-md transition-all ${viewMode === 'list'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-purple-200 hover:text-white'
                                        }`}
                                >
                                    📋 List View
                                </button>
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`px-4 py-2 rounded-md transition-all ${viewMode === 'graph'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-purple-200 hover:text-white'
                                        }`}
                                >
                                    📊 Graph View
                                </button>
                            </div>

                            {/* Export Dropdown */}
                            <div className="relative z-50">
                                <button
                                    ref={exportButtonRef}
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2"
                                >
                                    Export Data
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showExportMenu && typeof window !== 'undefined' && createPortal(
                                    <div
                                        data-export-dropdown
                                        className="fixed w-48 bg-white/5 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl"
                                        style={{
                                            top: (exportButtonRef.current?.getBoundingClientRect().bottom || 0) + 8,
                                            left: (exportButtonRef.current?.getBoundingClientRect().right || 0) - 192,
                                            zIndex: 9999
                                        }}
                                    >
                                        <button
                                            onClick={exportJSON}
                                            className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors rounded-t-lg"
                                        >
                                            Export JSON
                                        </button>
                                        <button
                                            onClick={exportCSV}
                                            className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors"
                                        >
                                            Export CSV
                                        </button>
                                        <button
                                            onClick={exportGraph}
                                            className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors rounded-b-lg"
                                        >
                                            Export Graph
                                        </button>
                                    </div>,
                                    document.body
                                )}
                            </div>

                            <button
                                onClick={() => router.push(`/${dendrosId}/admin`)}
                                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                ← Back to Editor
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-purple-300 text-sm mb-2">Total Submissions</div>
                        <div className="text-white text-4xl font-bold">{submissions.length}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-purple-300 text-sm mb-2">Published</div>
                        <div className="text-white text-4xl font-bold">
                            {dendros.config.isPublished ? '✓' : '✗'}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="text-purple-300 text-sm mb-2">Last 24h</div>
                        <div className="text-white text-4xl font-bold">
                            {submissions.filter(s => {
                                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                                return s.completedAt > dayAgo;
                            }).length}
                        </div>
                    </div>
                </div>

                {/* Graph View */}
                {viewMode === 'graph' ? (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden" style={{ height: '600px' }}>
                        {submissions.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-purple-300 text-lg mb-2">No Data to Visualize</div>
                                    <p className="text-purple-200/60 text-sm">
                                        Share your Dendros to start collecting responses
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <AnalyticsCanvas dendros={dendros} submissions={submissions} />
                        )}
                    </div>
                ) : (
                    /* List View - Submissions Table */
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-semibold text-white">Submissions</h2>
                        </div>

                        {submissions.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-purple-300 text-lg mb-2">No submissions yet</div>
                                <p className="text-purple-200/60 text-sm">
                                    Share your Dendros to start collecting responses
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black/20">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                                                Steps Taken
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {submissions.map((submission) => (
                                            <Fragment key={submission.submissionId}>
                                                <tr className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                        {formatDate(submission.completedAt)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-purple-200">
                                                        {submission.path.length} steps
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => toggleRow(submission.submissionId)}
                                                            className="text-purple-400 hover:text-purple-300 transition-colors"
                                                        >
                                                            {expandedRows.has(submission.submissionId) ? '▼ Hide' : '▶ Show'} Details
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRows.has(submission.submissionId) && (
                                                    <tr className="bg-black/30">
                                                        <td colSpan={3} className="px-6 py-4">
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <h4 className="text-purple-300 font-semibold mb-2">Path Taken:</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {submission.path.map((step, idx) => {
                                                                            const nodeLabel = getNodeLabel(step.nodeId);
                                                                            return (
                                                                                <div key={idx} className="bg-purple-500/20 border border-purple-500/30 rounded px-3 py-1 text-sm text-purple-200">
                                                                                    <span className="font-semibold">{nodeLabel}</span>
                                                                                    {step.answer && (
                                                                                        <span className="ml-2 text-purple-300">
                                                                                            → {typeof step.answer === 'object' ? JSON.stringify(step.answer) : step.answer}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
