/**
 * Graph Walker Test Examples
 * 
 * This file contains example usage and manual tests for the Graph Walker.
 * These examples demonstrate how to use the Graph Walker functions.
 */

import { getNextNode, getStartNode, hasValidStart, getPossibleNextNodes } from './graphWalker';
import type { DendrosGraph } from '@/types/graph';

/**
 * Example 1: Simple Yes/No Flow
 */
export const simpleYesNoGraph: DendrosGraph = {
    nodes: [
        {
            id: 'start',
            type: 'root',
            data: {
                label: 'Do you like programming?',
                welcomeMessage: 'Welcome to our survey!',
            },
        },
        {
            id: 'yes-path',
            type: 'question',
            data: {
                label: 'What is your favorite language?',
                inputType: 'text',
                placeholder: 'e.g., TypeScript',
            },
        },
        {
            id: 'no-path',
            type: 'end',
            data: {
                label: 'Thank you for your time!',
                successMessage: 'We appreciate your feedback.',
            },
        },
        {
            id: 'end',
            type: 'end',
            data: {
                label: 'Thank you!',
                successMessage: 'Your response has been recorded.',
            },
        },
    ],
    edges: [
        {
            id: 'e1',
            source: 'start',
            target: 'yes-path',
            condition: {
                type: 'exact',
                value: 'Yes',
            },
            label: 'Likes programming',
        },
        {
            id: 'e2',
            source: 'start',
            target: 'no-path',
            condition: {
                type: 'exact',
                value: 'No',
            },
            label: 'Does not like programming',
        },
        {
            id: 'e3',
            source: 'yes-path',
            target: 'end',
            label: 'Continue',
        },
    ],
};

/**
 * Example 2: Numeric Range Flow
 */
export const numericRangeGraph: DendrosGraph = {
    nodes: [
        {
            id: 'age-question',
            type: 'root',
            data: {
                label: 'What is your age?',
            },
        },
        {
            id: 'young',
            type: 'end',
            data: {
                label: 'You are young!',
            },
        },
        {
            id: 'adult',
            type: 'end',
            data: {
                label: 'You are an adult!',
            },
        },
        {
            id: 'senior',
            type: 'end',
            data: {
                label: 'You are a senior!',
            },
        },
    ],
    edges: [
        {
            id: 'e1',
            source: 'age-question',
            target: 'young',
            condition: {
                type: 'range',
                value: [0, 17],
            },
        },
        {
            id: 'e2',
            source: 'age-question',
            target: 'adult',
            condition: {
                type: 'range',
                value: [18, 64],
            },
        },
        {
            id: 'e3',
            source: 'age-question',
            target: 'senior',
            condition: {
                type: 'range',
                value: [65, 120],
            },
        },
    ],
};

/**
 * Manual test function - logs results to console
 */
export function testGraphWalker() {
    console.log('=== Graph Walker Tests ===\n');

    // Test 1: Simple Yes/No
    console.log('Test 1: Simple Yes/No Flow');
    console.log('Graph valid start:', hasValidStart(simpleYesNoGraph));

    const start = getStartNode(simpleYesNoGraph);
    console.log('Start node:', start?.id);

    if (start) {
        const result1 = getNextNode(start.id, 'Yes', simpleYesNoGraph);
        console.log('Answer "Yes":', result1);

        const result2 = getNextNode(start.id, 'No', simpleYesNoGraph);
        console.log('Answer "No":', result2);

        const result3 = getNextNode(start.id, 'Maybe', simpleYesNoGraph);
        console.log('Answer "Maybe" (should error):', result3);
    }

    console.log('\n---\n');

    // Test 2: Numeric Range
    console.log('Test 2: Numeric Range Flow');
    const ageStart = getStartNode(numericRangeGraph);

    if (ageStart) {
        const young = getNextNode(ageStart.id, 15, numericRangeGraph);
        console.log('Age 15:', young);

        const adult = getNextNode(ageStart.id, 30, numericRangeGraph);
        console.log('Age 30:', adult);

        const senior = getNextNode(ageStart.id, 70, numericRangeGraph);
        console.log('Age 70:', senior);
    }

    console.log('\n---\n');

    // Test 3: Possible Next Nodes
    console.log('Test 3: Get Possible Next Nodes');
    if (start) {
        const possibleNodes = getPossibleNextNodes(start.id, simpleYesNoGraph);
        console.log('Possible next nodes from start:', possibleNodes.map(n => n.id));
    }

    console.log('\n=== Tests Complete ===');
}
