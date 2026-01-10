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
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Dendros } from '@/types/graph';

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
 * Delete a Dendros document
 */
export async function deleteDendros(dendrosId: string): Promise<void> {
    const dendrosRef = doc(db, DENDROS_COLLECTION, dendrosId);
    await deleteDoc(dendrosRef);
}

/**
 * Fetch all Dendros documents owned by a specific user
 */
export async function fetchUserDendros(ownerId: string): Promise<Dendros[]> {
    const dendrosQuery = query(
        collection(db, DENDROS_COLLECTION),
        where('ownerId', '==', ownerId)
    );

    const querySnapshot = await getDocs(dendrosQuery);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as Dendros;
    });
}

/**
 * Check if a user owns a specific Dendros document
 */
export async function checkOwnership(dendrosId: string, userId: string): Promise<boolean> {
    const dendros = await fetchDendros(dendrosId);
    return dendros?.ownerId === userId;
}

/**
 * Seed the database with a sample Dendros document for testing
 */
export async function seedDatabase(ownerId: string): Promise<string> {
    const sampleDendrosId = `dndr_${Date.now()}`;

    const sampleDendros: Omit<Dendros, 'createdAt' | 'updatedAt'> = {
        dendrosId: sampleDendrosId,
        ownerId: ownerId,
        config: {
            title: 'Sample Onboarding Flow',
            slug: 'sample-onboarding',
            description: 'A sample branching narrative for testing',
        },
        graph: {
            nodes: [
                {
                    id: 'n1',
                    type: 'root',
                    data: {
                        label: 'Welcome! Are you a Developer?',
                        welcomeMessage: 'Welcome to our onboarding flow!',
                    },
                    position: { x: 250, y: 0 },
                },
                {
                    id: 'n2',
                    type: 'question',
                    data: {
                        label: 'What is your GitHub username?',
                        inputType: 'text',
                        placeholder: 'Enter your GitHub username',
                        required: true,
                    },
                    position: { x: 100, y: 150 },
                },
                {
                    id: 'n3',
                    type: 'question',
                    data: {
                        label: 'What interests you most?',
                        inputType: 'multipleChoice',
                        options: ['Design', 'Marketing', 'Business'],
                        required: true,
                    },
                    position: { x: 400, y: 150 },
                },
                {
                    id: 'n4',
                    type: 'end',
                    data: {
                        label: 'Thank you! Your application has been submitted.',
                        successMessage: 'We will review your application and get back to you soon!',
                    },
                    position: { x: 250, y: 300 },
                },
            ],
            edges: [
                {
                    id: 'e1-2',
                    source: 'n1',
                    target: 'n2',
                    condition: {
                        type: 'exact',
                        value: 'Yes',
                    },
                    label: 'Developer Path',
                },
                {
                    id: 'e1-3',
                    source: 'n1',
                    target: 'n3',
                    condition: {
                        type: 'exact',
                        value: 'No',
                    },
                    label: 'Non-Developer Path',
                },
                {
                    id: 'e2-4',
                    source: 'n2',
                    target: 'n4',
                },
                {
                    id: 'e3-4',
                    source: 'n3',
                    target: 'n4',
                },
            ],
        },
    };

    await createDendros(sampleDendros);
    return sampleDendrosId;
}
