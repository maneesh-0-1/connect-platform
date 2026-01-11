'use client';

import { useEffect, useState } from 'react';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export function ProfileWrapper({ userData }: { userData: any }) {
    const [isOwner, setIsOwner] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && user.email === userData.email) {
                setIsOwner(true);
            }
        });
        return () => unsubscribe();
    }, [userData.email]);

    return (
        <ProfileCard
            user={userData}
            isOwner={isOwner}
            onEdit={() => router.push('/delegate/edit')}
        />
    );
}

// Needed to export default for file structure if simplified,
// but here we used it as named export for the Page.
