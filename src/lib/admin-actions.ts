'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

export type DelegateData = {
    qrId: string;
    status: string; // UNCLAIMED, CLAIMED, DISABLED
    scanCount: number;
    lastScan: string | null;
    email: string;
    name: string;
    entity: string;
    profileCompletion: number;
};
export async function getDashboardStats() {
    const data = await getDetailedAdminData();
    return data.stats;
}

export async function getDetailedAdminData() {
    const adminDb = getAdminDb();

    try {
        // Fetch all QRs
        const qrsSnapshot = await adminDb.collection('qrs').get();
        const qrs = qrsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        // Fetch all Users to join data
        const usersSnapshot = await adminDb.collection('users').get();
        const usersMap = new Map();

        usersSnapshot.docs.forEach(doc => {
            usersMap.set(doc.id, doc.data());
        });

        const delegates: DelegateData[] = qrs.map(qr => {
            let user = null;
            if (qr.assignedEmail) {
                user = usersMap.get(qr.assignedEmail);
            }

            return {
                qrId: qr.id,
                status: qr.status || 'UNCLAIMED',
                scanCount: qr.scanCount || 0,
                lastScan: qr.lastScanAt ? new Date(qr.lastScanAt).toLocaleString() : null,
                email: qr.assignedEmail || '-',
                name: user?.name || '-',
                entity: user?.entity || '-',
                profileCompletion: user?.profileCompletion || 0,
            };
        });

        // Calculate Stats
        const totalQrs = qrs.length;
        const claimed = qrs.filter(q => q.status === 'CLAIMED').length;
        const disabled = qrs.filter(q => q.status === 'DISABLED').length;
        const unclaimed = qrs.filter(q => q.status === 'UNCLAIMED').length;

        // Entity Distribution
        const entityCounts: Record<string, number> = {};
        delegates.forEach(d => {
            if (d.status === 'CLAIMED' && d.entity && d.entity !== '-') {
                entityCounts[d.entity] = (entityCounts[d.entity] || 0) + 1;
            }
        });

        return {
            stats: { totalQrs, claimed, unclaimed, disabled },
            delegates,
            entityDistribution: entityCounts
        };
    } catch (error) {
        console.error('Error in getDetailedAdminData:', error);
        return {
            stats: { totalQrs: 0, claimed: 0, unclaimed: 0, disabled: 0 },
            delegates: [],
            entityDistribution: {}
        };
    }
}

export async function toggleQRStatus(qrId: string, shouldDisable: boolean) {
    const adminDb = getAdminDb();
    const qrRef = adminDb.collection('qrs').doc(qrId);

    try {
        const doc = await qrRef.get();
        if (!doc.exists) throw new Error('QR not found');

        const data = doc.data();
        let newStatus = 'UNCLAIMED';

        if (shouldDisable) {
            newStatus = 'DISABLED';
        } else {
            // Re-enabling: Restore based on assignment
            if (data?.assignedEmail) {
                newStatus = 'CLAIMED';
            } else {
                newStatus = 'UNCLAIMED';
            }
        }

        await qrRef.update({ status: newStatus });
        return { success: true, newStatus };
    } catch (error) {
        console.error('Toggle QR Error:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function generateQRBatch(count: number) {
    const adminDb = getAdminDb();
    const batch = adminDb.batch();
    const newIds: string[] = [];
    const createdAt = new Date().toISOString();

    for (let i = 0; i < count; i++) {
        const id = randomBytes(4).toString('hex').toUpperCase();
        const qrRef = adminDb.collection('qrs').doc(id);

        batch.set(qrRef, {
            id,
            status: 'UNCLAIMED',
            createdAt,
            assignedEmail: null,
            scanCount: 0,
            lastScanAt: null
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

export async function deleteQRs(qrIds: string[]) {
    const adminDb = getAdminDb();
    
    try {
        const chunkSize = 500;
        for (let i = 0; i < qrIds.length; i += chunkSize) {
            const chunk = qrIds.slice(i, i + chunkSize);
            const batch = adminDb.batch();
            chunk.forEach(id => {
                const qrRef = adminDb.collection('qrs').doc(id);
                batch.delete(qrRef);
            });
            await batch.commit();
        }
        return { success: true };
    } catch (error) {
        console.error('Delete QRs Error:', error);
        return { success: false, error: 'Failed to delete QRs' };
    }
}

