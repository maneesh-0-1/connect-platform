'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement actual auth logic or Server Action
        // For now, simple client-side check for demo
        // NOTE: In production, use a Server Action to check secure environment variables
        if (email === 'musunuru.maneesh@aiesecmember.in' && password === 'Maneesh@9398449785') {
            router.push('/admin/dashboard');
        } else {
            alert('Invalid credentials');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[url('/grid-bg.svg')] bg-cover relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-aiesec-blue/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-purple/30 rounded-full blur-[100px]" />

            <Card className="w-full max-w-md relative z-10 border-glass-border/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 neon-text">Admin Portal</h1>
                    <p className="text-gray-400 text-sm">AIESEC Conference 2026</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="user@aiesecmember.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-aiesec-blue to-blue-600 hover:from-blue-600 hover:to-aiesec-blue"
                        loading={loading}
                        size="lg"
                    >
                        Access Dashboard
                    </Button>
                </form>
            </Card>
        </div>
    );
}
