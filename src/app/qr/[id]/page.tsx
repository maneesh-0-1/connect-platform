import { redirect } from 'next/navigation';
import { getAdminDb } from '@/lib/firebase-admin';

export default async function QRPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const adminDb = getAdminDb();

    let redirectPath = null;

    try {
        const qrDoc = await adminDb.collection('qrs').doc(id).get();

        if (!qrDoc.exists) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black text-white">
                    <h1 className="text-2xl font-bold">Invalid QR Code</h1>
                </div>
            );
        }

        const data = qrDoc.data();

        if (data?.status === 'DISABLED') {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black text-white text-center p-4">
                    <div>
                        <h1 className="text-3xl font-bold text-red-500 mb-2">Card Disabled</h1>
                        <p>Please contact the organizing committee.</p>
                    </div>
                </div>
            );
        }

        if (data?.status === 'CLAIMED') {
            redirectPath = `/delegate/${data.assignedEmail}`;
        } else {
            // UNCLAIMED
            redirectPath = `/claim/${id}`;
        }

    } catch (error) {
        console.error('QR Fetch Error', error);
        return <div>Error processing QR code</div>;
    }

    if (redirectPath) {
        redirect(redirectPath);
    }
}
