'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Upload, ImageIcon } from 'lucide-react';

export default function EditProfile() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        instagram: '',
        linkedin: '',
        phone: '',
        photoUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                // Fetch User Data
                const docRef = doc(db, 'users', authUser.email!); // Assuming email is ID
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setFormData({
                        name: data.name || '',
                        bio: data.bio || '',
                        instagram: data.socials?.instagram || '',
                        linkedin: data.socials?.linkedin || '',
                        phone: data.phone?.number || '',
                        photoUrl: data.photoUrl || ''
                    });
                }
                setLoading(false);
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("File is too large. Max 5MB.");
            return;
        }

        setUploading(true);
        try {
            // Create a reference
            const storageRef = ref(storage, `avatars/${user.email}/${Date.now()}_${file.name}`);

            // Upload
            await uploadBytes(storageRef, file);

            // Get URL
            const url = await getDownloadURL(storageRef);

            // Update State
            setFormData(prev => ({ ...prev, photoUrl: url }));

        } catch (error: any) {
            console.error("Upload failed", error);
            alert("Failed to upload image. " + (error.message || ""));
        }
        setUploading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Calculate Profile Completion
            let score = 0;
            if (formData.name) score += 20;
            if (formData.bio) score += 20;
            if (formData.photoUrl) score += 20;
            if (formData.phone) score += 20;
            if (formData.instagram || formData.linkedin) score += 20;

            const docRef = doc(db, 'users', user.email);
            // Use setDoc with merge: true which handles creation if missing
            await setDoc(docRef, {
                name: formData.name,
                bio: formData.bio,
                socials: {
                    instagram: formData.instagram,
                    linkedin: formData.linkedin,
                },
                phone: {
                    number: formData.phone,
                    visibility: 'PUBLIC' // Defaults to public now
                },
                photoUrl: formData.photoUrl,
                profileCompletion: score
            }, { merge: true });

            alert('Profile Updated!');
            router.push(`/delegate/${user.email}`);
        } catch (e) {
            console.error(e);
            alert('Failed to update');
        }
        setSaving(false);
    };

    if (loading) return <div className="text-white text-center p-10">Loading...</div>;

    return (
        <div className="min-h-screen p-4 bg-background">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="flex items-center gap-4 mb-8">
                    <Link href={`/delegate/${user?.email}`} className="p-2 bg-glass-200 rounded-full hover:bg-glass-300">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <h1 className="text-2xl font-bold neon-text">Edit Profile</h1>
                </header>

                <form onSubmit={handleSave} className="space-y-6">
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4">Basic Info</h2>
                        <div className="space-y-4">

                            {/* Image Upload UI */}
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-white/20 flex-shrink-0">
                                    {formData.photoUrl ? (
                                        <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-glass-200 hover:bg-glass-300 text-white text-sm font-medium rounded-lg transition-colors">
                                        {uploading ? 'Uploading...' : 'Change Photo'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        <Upload className="w-4 h-4 ml-2" />
                                    </label>
                                    <p className="text-xs text-gray-400 mt-1">Max 5MB. JPG, PNG</p>
                                </div>
                            </div>

                            <Input
                                label="Display Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Bio</label>
                                <textarea
                                    className="w-full bg-glass-100 border border-glass-border rounded-xl px-4 py-3 outline-none text-white h-24 focus:border-neon-blue"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    maxLength={150}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4">Social Links</h2>
                        <div className="space-y-4">
                            <Input
                                label="Instagram URL"
                                placeholder="https://instagram.com/username"
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                            />
                            <Input
                                label="LinkedIn URL"
                                placeholder="https://linkedin.com/in/username"
                                value={formData.linkedin}
                                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4">Contact Info</h2>
                        <div className="space-y-4">
                            <Input
                                label="Phone Number"
                                placeholder="+94 77 123 4567"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Button type="submit" loading={saving} className="w-full" size="lg">Save Changes</Button>
                </form>
            </div>
        </div>
    );
}
