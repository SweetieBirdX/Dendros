import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    Timestamp,
    addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Dendros, Submission, RootNodeData, QuestionNodeData, EndNodeData } from '@/types/graph';
import { validateGraph } from '@/lib/graphValidator';

const DENDROS_COLLECTION = 'dendros';

/**
 * Create a new Dendros document in Firestore
 */
export async function createDendros(dendros: Omit<Dendros, 'createdAt' | 'updatedAt'>): Promise<void> {
    const dendrosRef = doc(db, DENDROS_COLLECTION, dendros.dendrosId);

    const dendrosData = {
        ...dendros,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };

    await setDoc(dendrosRef, dendrosData);
}

/**
 * Create a new Dendros document with validation
 * Validates the graph before saving to Firestore
 */
export async function createDendrosWithValidation(
    dendros: Omit<Dendros, 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; error?: string; dendrosId?: string }> {
    // Validate the graph
    const validation = validateGraph(dendros.graph);

    if (!validation.isValid) {
        const errorMessages = validation.errors.map(e => e.message).join('; ');
        return {
            success: false,
            error: `Graph validation failed: ${errorMessages}`,
        };
    }

    try {
        await createDendros(dendros);
        return {
            success: true,
            dendrosId: dendros.dendrosId,
        };
    } catch (error) {
        return {
            success: false,
            error: `Firestore error: ${error}`,
        };
    }
}

/**
 * Fetch a Dendros document by ID
 */
export async function fetchDendros(dendrosId: string): Promise<Dendros | null> {
    const dendrosRef = doc(db, DENDROS_COLLECTION, dendrosId);
    const dendrosSnap = await getDoc(dendrosRef);

    if (!dendrosSnap.exists()) {
        return null;
    }

    const data = dendrosSnap.data();
    return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as Dendros;
}

/**
 * Update an existing Dendros document
 */
export async function updateDendros(dendrosId: string, updates: Partial<Dendros>): Promise<void> {
    const dendrosRef = doc(db, DENDROS_COLLECTION, dendrosId);

    await updateDoc(dendrosRef, {
        ...updates,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Submit a flow response
 */
export async function submitResponse(dendrosId: string, submission: Omit<Submission, 'submissionId'>): Promise<string> {
    const dendrosRef = doc(db, DENDROS_COLLECTION, dendrosId);
    const submissionsRef = collection(dendrosRef, 'submissions');

    const docRef = await addDoc(submissionsRef, {
        ...submission,
        completedAt: Timestamp.fromDate(submission.completedAt),
    });

    return docRef.id;
}

/**
 * Check if a user is the owner of a Dendros document
 */
export async function checkOwnership(dendrosId: string, userId: string): Promise<boolean> {
    const dendros = await fetchDendros(dendrosId);
    if (!dendros) return false;
    return dendros.ownerId === userId;
}

/**
 * Seed the database with a sample Dendros flow
 */
export async function seedDatabase(userId: string): Promise<string> {
    // Generate a random ID (simple approach as we don't have uuid lib)
    const dendrosId = doc(collection(db, DENDROS_COLLECTION)).id;

    const dendros: Omit<Dendros, 'createdAt' | 'updatedAt'> = {
        dendrosId,
        ownerId: userId,
        config: {
            title: 'My First Flow',
            slug: 'my-first-flow',
            description: 'A sample flow to get you started',
            isPublished: false,
        },
        graph: {
            nodes: [
                { id: '1', type: 'root', position: { x: 100, y: 100 }, data: { label: 'Start', welcomeMessage: 'Welcome to your first flow!' } as RootNodeData },
                { id: '2', type: 'question', position: { x: 100, y: 300 }, data: { label: 'What is your name?', inputType: 'text', required: true, placeholder: 'Enter your name' } as QuestionNodeData },
                { id: '3', type: 'end', position: { x: 100, y: 500 }, data: { label: 'End', successMessage: 'Thanks for participating!' } as EndNodeData },
            ],
            edges: [
                { id: 'e1', source: '1', target: '2', condition: { type: 'always' } },
                { id: 'e2', source: '2', target: '3', condition: { type: 'always' } },
            ]
        }
    };

    await createDendros(dendros);
    return dendrosId;
}

/**
 * Seed the database with a validated sample flow
 */
export async function seedDatabaseWithValidation(userId: string): Promise<{ success: boolean; error?: string; dendrosId?: string }> {
    const dendrosId = doc(collection(db, DENDROS_COLLECTION)).id;

    const dendros: Omit<Dendros, 'createdAt' | 'updatedAt'> = {
        dendrosId,
        ownerId: userId,
        config: {
            title: 'My Validated Flow',
            slug: 'my-validated-flow',
            description: 'A sample flow checked by validation',
            isPublished: false,
        },
        graph: {
            nodes: [
                { id: '1', type: 'root', position: { x: 100, y: 100 }, data: { label: 'Start', welcomeMessage: 'Validation Test Flow' } as RootNodeData },
                { id: '2', type: 'end', position: { x: 100, y: 300 }, data: { label: 'End', successMessage: 'Validation Successful.' } as EndNodeData },
            ],
            edges: [
                { id: 'e1', source: '1', target: '2', condition: { type: 'always' } },
            ]
        }
    };
    return await createDendrosWithValidation(dendros);
}

/**
 * Fetch all submissions for a specific Dendros
 */
export async function fetchSubmissions(dendrosId: string): Promise<Submission[]> {
    const dendrosRef = doc(db, DENDROS_COLLECTION, dendrosId);
    const submissionsRef = collection(dendrosRef, 'submissions');

    const q = query(submissionsRef);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            submissionId: docSnap.id,
            ...data,
            completedAt: data.completedAt?.toDate(),
            path: data.path || []
        } as Submission;
    }).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
}
