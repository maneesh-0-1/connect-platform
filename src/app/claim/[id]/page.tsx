'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ClaimPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        if (res.ok) {
            setStep('OTP');
        } else {
            const d = await res.json();
            alert(d.error || 'Failed to send OTP');
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });

        if (res.ok) {
            const { token } = await res.json();
            await signInWithCustomToken(auth, token);

            // Claim the QR (Logic to link QR to User)
            // We need an API for this: /api/claim
            // createProfile(id, email)

            // For now, assume we redirect to specific setup page
            router.push(`/delegate/setup?qr=${id}`);
        } else {
            alert('Invalid Code');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/grid-bg.svg')] bg-cover relative">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            <Card className="w-full max-w-md relative z-10 glass-card">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold neon-text mb-2">Claim Your Digital Card</h1>
                    <p className="text-gray-400 text-sm">QR ID: {id}</p>
                </div>

                {step === 'EMAIL' ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <Input
                            label="AIESEC Email"
                            type="email"
                            placeholder="name@aiesecmember.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button loading={loading} className="w-full">Send Login Code</Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="text-center text-sm text-gray-400 mb-4">
                            Sent to {email} <button type="button" onClick={() => setStep('EMAIL')} className="text-aiesec-blue underline">Edit</button>
                        </div>
                        <Input
                            label="6-Digit Code"
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest"
                            required
                        />
                        <Button loading={loading} className="w-full">Verify & Claim</Button>
                    </form>
                )}
            </Card>
        </div>
    );
}
