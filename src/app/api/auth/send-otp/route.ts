import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendOTPEmail } from '@/lib/send-email';
import { randomInt } from 'crypto';

export async function POST(request: Request) {
    const adminDb = getAdminDb();
    try {
        const { email } = await request.json();

        if (!email || (
            !email.endsWith('@aiesecmember.in') &&
            !email.endsWith('@aiesec.net') &&
            !email.endsWith('@aiesec.in')
        )) {
            return NextResponse.json({ error: 'Invalid AIESEC email' }, { status: 400 });
        }

        // Rate Limiting Logic
        const otpRef = adminDb.collection('otps').doc(email);
        const otpDoc = await otpRef.get();
        const now = Date.now();

        if (otpDoc.exists) {
            const data = otpDoc.data();
            // Check if last request was < 1 minute ago
            if (data?.lastRequest && now - data.lastRequest < 60 * 1000) {
                return NextResponse.json({ error: 'Please wait before requesting again' }, { status: 429 });
            }
            // Check limits (3 per hour) needs more complex logic, simplified here for MVP
        }

        // Generate 6-digit OTP
        const otp = randomInt(100000, 999999).toString();
        const expiresAt = now + 5 * 60 * 1000; // 5 mins

        // Store in Firestore
        await otpRef.set({
            otp,
            expiresAt,
            lastRequest: now,
            attempts: 0
        });

        // Send Email
        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
