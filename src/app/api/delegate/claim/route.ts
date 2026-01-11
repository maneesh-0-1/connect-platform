import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    const adminDb = getAdminDb();
    try {
        const { qrId, email, name, entity } = await request.json();

        if (!qrId || !email) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        const qrRef = adminDb.collection('qrs').doc(qrId);
        const qrDoc = await qrRef.get();

        if (!qrDoc.exists || qrDoc.data()?.status !== 'UNCLAIMED') {
            return NextResponse.json({ error: 'QR not available' }, { status: 400 });
        }

        const batch = adminDb.batch();

        // 1. Update QR
        batch.update(qrRef, {
            status: 'CLAIMED',
            assignedEmail: email,
            claimedAt: new Date().toISOString(),
        });

        // 2. Create/Update User Profile
        const userRef = adminDb.collection('users').doc(email);
        batch.set(userRef, {
            email,
            name: name || '',
            entity: entity || '',
            qrId,
            photoUrl: '', // Default or upload later
            bio: '',
            socials: { instagram: '', linkedin: '' },
            phone: { number: '', visibility: 'HIDDEN' },
            updatedAt: new Date().toISOString(),
        }, { merge: true });

        await batch.commit();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
