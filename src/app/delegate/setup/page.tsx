'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function SetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const qrId = searchParams.get('qr');
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [entity, setEntity] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/login'); // Should not happen if flow is correct
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleCompleProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Call Claim API
        const res = await fetch('/api/delegate/claim', {
            method: 'POST',
            body: JSON.stringify({
                qrId,
                email: user.email,
                name,
                entity
            })
        });

        if (res.ok) {
            router.push(`/delegate/${user.email}`);
        } else {
            alert('Failed to create profile');
        }
        setLoading(false);
    };

    if (!user) return <div className="text-white text-center p-10">Loading auth...</div>;

    return (
        <Card className="w-full max-w-md relative z-10 glass-card">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold neon-text mb-2">Setup Profile</h1>
                <p className="text-gray-400 text-sm">One last step to activate your card</p>
            </div>

            <form onSubmit={handleCompleProfile} className="space-y-6">
                <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    label="AIESEC Entity (LC)"
                    placeholder="AIESEC in Entity Name"
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                    required
                />
                <Button loading={loading} className="w-full" size="lg">Activate Card</Button>
            </form>
        </Card>
    );
}

export default function SetupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/grid-bg.svg')] bg-cover relative">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <SetupContent />
            </Suspense>
        </div>
    )
}
