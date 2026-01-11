'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

export async function getDashboardStats() {
    const adminDb = getAdminDb();
    try {
        const qrSnapshot = await adminDb.collection('qrs').count().get();
        const claimedSnapshot = await adminDb.collection('qrs').where('status', '==', 'CLAIMED').count().get();

        // Total delegates is roughly equal to claimed QRs
        return {
            totalQrs: qrSnapshot.data().count,
            claimed: claimedSnapshot.data().count,
            unclaimed: qrSnapshot.data().count - claimedSnapshot.data().count,
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { totalQrs: 0, claimed: 0, unclaimed: 0 };
    }
}

export async function generateQRBatch(count: number) {
    const adminDb = getAdminDb();
    const batch = adminDb.batch();
    const newIds: string[] = [];
    const createdAt = new Date().toISOString();

    for (let i = 0; i < count; i++) {
        // Generate a secure random ID (8 chars hex = 4 bytes)
        // Short enough to be typed if needed, long enough to be uniqueish in small batch
        const id = randomBytes(4).toString('hex').toUpperCase();
        const qrRef = adminDb.collection('qrs').doc(id);

        batch.set(qrRef, {
            id,
            status: 'UNCLAIMED',
            createdAt,
            assignedEmail: null,
        });
        newIds.push(id);
    }

    await batch.commit();
    return newIds;
}

export async function getAllQrIds() {
    const adminDb = getAdminDb();
    try {
        const snapshot = await adminDb.collection('qrs').select('id').get();
        return snapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error('Error fetching all QR IDs:', error);
        return [];
    }
}
