import { useState, useCallback, useEffect } from 'react';
import { getNextNode } from '@/lib/graphWalker';
import type { DendrosGraph, GraphNode, UserAnswer, UserPath } from '@/types/graph';

interface UseFlowNavigationProps {
    graph: DendrosGraph;
}

export function useFlowNavigation({ graph }: UseFlowNavigationProps) {
    // Find root node to start
    const getRootNode = useCallback(() => graph.nodes.find(n => n.type === 'root'), [graph]);

    const [currentNode, setCurrentNode] = useState<GraphNode | undefined>(getRootNode);
    const [history, setHistory] = useState<string[]>([]); // Stack of previous node IDs
    const [path, setPath] = useState<UserPath[]>([]); // Full journey for submission
    const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});

    // Initialize/Sync when graph loads
    useEffect(() => {
        // If we have no current node (initial load) and graph has nodes, find root
        if (!currentNode && graph.nodes.length > 0) {
            setCurrentNode(getRootNode());
        }
    }, [graph, currentNode, getRootNode]);

    // Reset flow
    const reset = useCallback(() => {
        setCurrentNode(getRootNode());
        setHistory([]);
        setPath([]);
        setAnswers({});
    }, [getRootNode]);

    // Handle next step
    const next = useCallback((answer?: UserAnswer) => {
        if (!currentNode) return;

        // Save answer if provided
        if (answer !== undefined) {
            setAnswers(prev => ({
                ...prev,
                [currentNode.id]: answer
            }));
        }

        // Add current node to history and path
        setHistory(prev => [...prev, currentNode.id]);
        setPath(prev => [
            ...prev,
            {
                nodeId: currentNode.id,
                answer: answer,
                timestamp: new Date(),
            }
        ]);

        // Calculate next node using graph walker
        let nextResult = getNextNode(currentNode.id, answer || answers[currentNode.id], graph);

        // Handle automatic traversal (Logic nodes or simple pass-throughs)
        // Only stop at interactive nodes (Question, End) or if path ends
        const visitedInStep = new Set<string>();

        while (nextResult.nextNodeId && !visitedInStep.has(nextResult.nextNodeId)) {
            const nextNode = graph.nodes.find(n => n.id === nextResult.nextNodeId);
            if (!nextNode) break;

            // If it's a Logic node, continue automatically
            // If it's a Root node (shouldn't happen mid-flow but safe guard), continue
            // If it's Question, Info, or End, stop and render
            if (nextNode.type === 'question' || nextNode.type === 'info' || nextNode.type === 'end') {
                setCurrentNode(nextNode);
                return;
            }

            // Logic/Intermediate node - keep walking
            visitedInStep.add(nextNode.id);

            // For intermediate nodes without user direct input, we use undefined for answer
            // This assumes logic nodes rely on 'always' edges or internal logic we don't handle yet
            nextResult = getNextNode(nextNode.id, undefined as unknown as UserAnswer, graph);
        }

        // If loop detected or end of path (null)
        if (!nextResult.nextNodeId) {
            console.warn('Flow ended without an End node');
        }
    }, [graph, currentNode, answers]);

    // Handle back button
    const back = useCallback(() => {
        if (history.length === 0) return;

        const newHistory = [...history];
        const prevNodeId = newHistory.pop();
        setHistory(newHistory);

        // Update path (remove last entry)
        setPath(prev => prev.slice(0, -1));

        if (prevNodeId) {
            const prevNode = graph.nodes.find(n => n.id === prevNodeId);
            setCurrentNode(prevNode);
        }
    }, [history, graph]);

    return {
        currentNode,
        answers,
        next,
        back,
        reset,
        path,
        canGoBack: history.length > 0
    };
}
