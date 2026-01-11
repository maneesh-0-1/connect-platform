import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();

    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Missing email or OTP' }, { status: 400 });
        }

        const otpRef = adminDb.collection('otps').doc(email);
        const otpDoc = await otpRef.get();

        if (!otpDoc.exists) {
            return NextResponse.json({ error: 'No OTP found' }, { status: 400 });
        }

        const data = otpDoc.data();

        // Check expiry
        if (Date.now() > data?.expiresAt) {
            return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
        }

        // Check match
        if (data?.otp !== otp) {
            // Increment attempts
            await otpRef.update({ attempts: (data?.attempts || 0) + 1 });
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // Valid OTP - Generate Firebase Custom Token
        // We use the email as the UID for simplicity in this closed system
        // Or we find the user by email if they exist
        let uid = email;

        // Check if user exists in our 'users' collection to get their real UID if needed
        // But for now, we enforce email as ID or hash it.
        // Let's create a Firebase Auth user if not exists
        try {
            await adminAuth.getUserByEmail(email);
        } catch (e) {
            // Create user
            await adminAuth.createUser({
                uid: email, // Explicitly set UID to email for consistency
                email: email,
                emailVerified: true,
            });
        }

        const userRecord = await adminAuth.getUserByEmail(email);
        const customToken = await adminAuth.createCustomToken(userRecord.uid);

        // Clear OTP
        await otpRef.delete();

        return NextResponse.json({ token: customToken });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
