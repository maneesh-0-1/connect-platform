import { getAdminDb } from '@/lib/firebase-admin';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProfileWrapper } from './wrapper';

export default async function DelegateProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // id is email (URL decoded)
    const email = decodeURIComponent(id);
    const adminDb = getAdminDb();

    try {
        const userDoc = await adminDb.collection('users').doc(email).get();

        if (!userDoc.exists) {
            return (
                <div className="min-h-screen grid place-items-center text-white p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
                        <p className="text-gray-400 mb-6">This delegate profile hasn&apos;t been set up yet.</p>
                        <Link href="/login" className="text-neon-blue underline">Are you this delegate? Login here.</Link>
                    </div>
                </div>
            );
        }

        const userData = userDoc.data();

        return (
            <div className="min-h-screen bg-[url('/grid-bg.svg')] bg-fixed bg-cover relative py-12 px-4">
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

                {/* Header */}
                <div className="relative z-10 max-w-md mx-auto mb-6 flex items-center">
                    <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                </div>

                <div className="relative z-10">
                    <ProfileWrapper userData={userData} />
                </div>
            </div>
        );

    } catch (error) {
        console.error(error);
        return <div>Error loading profile</div>;
    }
}
