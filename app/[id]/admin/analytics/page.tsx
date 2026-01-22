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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
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

    // Helper function to convert path to readable node labels
    const getReadablePath = (path: { nodeId: string }[]) => {
        if (!dendros) return path.map(p => p.nodeId);

        return path.map((step, index) => {
            // First step is always "Start"
            if (index === 0) return 'Start';

            // Find the node in the graph and get its label
            const node = dendros.graph.nodes.find(n => n.id === step.nodeId);
            return node?.data.label || step.nodeId;
        });
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
            exportDate: new Date().toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short'
            }),
            totalSubmissions: submissions.length,
            submissions: submissions.map(s => ({
                completedAt: new Date(s.completedAt).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                }),
                journey: s.path.map((step, index) => {
                    // First step is always "Start"
                    if (index === 0) {
                        return { step: 'Start' };
                    }

                    // Find the node in the graph and get its label
                    const node = dendros.graph.nodes.find(n => n.id === step.nodeId);
                    const nodeLabel = node?.data.label || step.nodeId;

                    return {
                        question: nodeLabel,
                        answer: step.answer || 'N/A'
                    };
                })
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
        const headers = ['Submission #', 'Completed At', 'Journey'];
        const rows = submissions.map((s, i) => {
            // Build journey string with Q&A format
            const journeySteps = s.path.map((step, index) => {
                if (index === 0) return 'Start';

                const node = dendros.graph.nodes.find(n => n.id === step.nodeId);
                const question = node?.data.label || step.nodeId;
                const answer = step.answer || 'N/A';

                return `${question}: ${answer}`;
            });

            return [
                (i + 1).toString(),
                new Date(s.completedAt).toLocaleString(),
                journeySteps.join(' → ')
            ];
        });

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
            exportDate: new Date().toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short'
            }),
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
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="text-white text-xl">Loading analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="bg-[#171717] border border-white rounded-lg p-6 max-w-md">
                    <h2 className="text-white text-xl font-bold mb-2">Error</h2>
                    <p className="text-[#D4D4D4]">{error}</p>
                    <button
                        onClick={() => router.push(`/${dendrosId}/admin`)}
                        className="mt-4 bg-white hover:bg-[#E5E5E5] text-black px-4 py-2 rounded-lg"
                    >
                        Back to Editor
                    </button>
                </div>
            </div>
        );
    }

    if (!dendros) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 mb-6 overflow-visible">
                    {/* Mobile Header */}
                    <div className="md:hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">
                                    Analytics
                                </h1>
                                <p className="text-[#D4D4D4] text-sm truncate max-w-[180px]">{dendros.config.title}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push(`/${dendrosId}/admin`)}
                                    className="bg-white hover:bg-[#E5E5E5] text-black px-3 py-2 rounded-lg transition-colors font-semibold text-sm"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={() => {
                                        if (mobileMenuOpen) {
                                            setIsClosing(true);
                                        } else {
                                            setMobileMenuOpen(true);
                                        }
                                    }}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                                    title="Menu"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu Dropdown */}
                        {(mobileMenuOpen || isClosing) && (
                            <div className={`space-y-3 pt-3 border-t border-white/10 ${isClosing ? 'animate-slideUp' : 'animate-slideDown'}`}
                                onAnimationEnd={() => { if (isClosing) { setIsClosing(false); setMobileMenuOpen(false); } }}>
                                {/* View Toggle */}
                                <div>
                                    <label className="block text-[#A3A3A3] text-xs uppercase mb-2">View Mode</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setViewMode('list');
                                                setIsClosing(true);
                                            }}
                                            className={`flex-1 px-4 py-2 rounded-lg transition-all font-semibold text-sm ${viewMode === 'list'
                                                ? 'bg-white text-black'
                                                : 'bg-white/10 text-[#D4D4D4] hover:bg-white/20'
                                                }`}
                                        >
                                            List View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setViewMode('graph');
                                                setIsClosing(true);
                                            }}
                                            className={`flex-1 px-4 py-2 rounded-lg transition-all font-semibold text-sm ${viewMode === 'graph'
                                                ? 'bg-white text-black'
                                                : 'bg-white/10 text-[#D4D4D4] hover:bg-white/20'
                                                }`}
                                        >
                                            Graph View
                                        </button>
                                    </div>
                                </div>

                                {/* Export Options */}
                                <div>
                                    <label className="block text-[#A3A3A3] text-xs uppercase mb-2">Export Data</label>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                exportJSON();
                                                setIsClosing(true);
                                            }}
                                            className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm text-left"
                                        >
                                            Export JSON
                                        </button>
                                        <button
                                            onClick={() => {
                                                exportCSV();
                                                setIsClosing(true);
                                            }}
                                            className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm text-left"
                                        >
                                            Export CSV
                                        </button>
                                        <button
                                            onClick={() => {
                                                exportGraph();
                                                setIsClosing(true);
                                            }}
                                            className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm text-left"
                                        >
                                            Export Graph
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Analytics
                            </h1>
                            <p className="text-[#D4D4D4]">{dendros.config.title}</p>
                        </div>
                        <div className="flex items-center gap-3 overflow-visible">
                            {/* View Toggle */}
                            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-md transition-all font-semibold ${viewMode === 'list'
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-[#D4D4D4] hover:text-white'
                                        }`}
                                >
                                    List View
                                </button>
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`px-4 py-2 rounded-md transition-all font-semibold ${viewMode === 'graph'
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-[#D4D4D4] hover:text-white'
                                        }`}
                                >
                                    Graph View
                                </button>
                            </div>

                            {/* Export Dropdown */}
                            <div className="relative z-50">
                                <button
                                    ref={exportButtonRef}
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="bg-white hover:bg-[#E5E5E5] text-black px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2"
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
                                className="bg-white hover:bg-[#E5E5E5] text-black px-4 py-2 rounded-lg transition-colors font-semibold"
                            >
                                ← Back to Editor
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
                        <div className="text-[#A3A3A3] text-xs md:text-sm mb-2">Total Submissions</div>
                        <div className="text-white text-3xl md:text-4xl font-bold">{submissions.length}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
                        <div className="text-[#A3A3A3] text-xs md:text-sm mb-2">Published</div>
                        <div className="text-white text-3xl md:text-4xl font-bold">
                            {dendros.config.isPublished ? '✓' : '✗'}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
                        <div className="text-[#A3A3A3] text-xs md:text-sm mb-2">Last 24h</div>
                        <div className="text-white text-3xl md:text-4xl font-bold">
                            {submissions.filter(s => {
                                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                                return s.completedAt > dayAgo;
                            }).length}
                        </div>
                    </div>
                </div>

                {/* Graph View */}
                {viewMode === 'graph' ? (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden" style={{ height: window.innerWidth < 768 ? '400px' : '600px' }}>
                        {submissions.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center px-4">
                                    <div className="text-purple-300 text-base md:text-lg mb-2">No Data to Visualize</div>
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
                        <div className="p-4 md:p-6 border-b border-white/10">
                            <h2 className="text-lg md:text-xl font-semibold text-white">Submissions</h2>
                        </div>

                        {submissions.length === 0 ? (
                            <div className="p-8 md:p-12 text-center">
                                <div className="text-[#D4D4D4] text-base md:text-lg mb-2">No submissions yet</div>
                                <p className="text-[#A3A3A3] text-sm">
                                    Share your Dendros to start collecting responses
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black/20">
                                        <tr>
                                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">
                                                Steps Taken
                                            </th>
                                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-[#A3A3A3] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {submissions.map((submission) => (
                                            <Fragment key={submission.submissionId}>
                                                <tr className="hover:bg-white/5 transition-colors">
                                                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-white">
                                                        {formatDate(submission.completedAt)}
                                                    </td>
                                                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-[#D4D4D4]">
                                                        {submission.path.length} steps
                                                    </td>
                                                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                                                        <button
                                                            onClick={() => toggleRow(submission.submissionId)}
                                                            className="text-[#06B6D4] hover:text-[#14B8A6] transition-colors"
                                                        >
                                                            <span className="hidden md:inline">{expandedRows.has(submission.submissionId) ? '▼ Hide' : '▶ Show'} Details</span>
                                                            <span className="md:hidden">{expandedRows.has(submission.submissionId) ? '▼' : '▶'}</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRows.has(submission.submissionId) && (
                                                    <tr className="bg-black/30">
                                                        <td colSpan={3} className="px-3 md:px-6 py-3 md:py-4">
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <h4 className="text-[#D4D4D4] font-semibold mb-2 text-sm md:text-base">Path Taken:</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {submission.path.map((step, idx) => {
                                                                            const nodeLabel = getNodeLabel(step.nodeId);
                                                                            return (
                                                                                <div key={idx} className="bg-[#06B6D4]/20 border border-[#06B6D4]/30 rounded px-3 py-1 text-sm text-white">
                                                                                    <span className="font-semibold">{nodeLabel}</span>
                                                                                    {step.answer && (
                                                                                        <span className="ml-2 text-[#A3A3A3]">
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
