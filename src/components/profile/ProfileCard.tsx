'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Instagram, Linkedin, Mail, Phone, Download, Share2, Edit2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileProps {
    user: any; // Type strictly later
    isOwner: boolean;
    onEdit?: () => void;
}

export function ProfileCard({ user, isOwner, onEdit }: ProfileProps) {
    const [showPhone, setShowPhone] = useState(false);

    // Generate vCard
    const downloadVCard = () => {
        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${user.name}
ORG:AIESEC - ${user.entity}
EMAIL:${user.email}
TEL:${user.phone?.number || ''}
URL;type=Instagram:${user.socials?.instagram || ''}
URL;type=LinkedIn:${user.socials?.linkedin || ''}
NOTE:${user.bio || ''}
END:VCARD`;
        const blob = new Blob([vCardData], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `${user.name}.vcf`);
        a.click();
    };

    return (
        <div className="w-full max-w-md mx-auto relative">
            {/* Edit Trigger */}
            {isOwner && (
                <button
                    onClick={onEdit}
                    className="absolute top-4 right-4 z-50 p-2 bg-glass-200 rounded-full hover:bg-glass-300 transition-colors"
                    title="Edit Profile"
                >
                    <Edit2 className="w-4 h-4 text-white" />
                </button>
            )}

            {/* Profile Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="overflow-hidden border-glass-border/40 bg-black/40 backdrop-blur-xl">
                    {/* Hero Section */}
                    <div className="flex flex-col items-center pt-6 pb-8">
                        <div className="relative mb-6">
                            {/* Avatar Pulsing Glow */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple blur-md opacity-70 animate-pulse" />
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-gray-800 flex items-center justify-center">
                                {user.photoUrl ? (
                                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-white font-light">{user.name.charAt(0)}</span>
                                )}
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-white text-center">{user.name}</h1>
                        <p className="text-neon-blue text-sm font-medium tracking-wide mt-1">{user.entity}</p>

                        {user.bio && (
                            <p className="text-white text-sm text-center mt-4 px-4 leading-relaxed font-light italic">
                                &quot;{user.bio}&quot;
                            </p>
                        )}
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <SocialButton
                            href={user.socials?.instagram}
                            icon={<Instagram className="w-5 h-5" />}
                            label="Instagram"
                            color="bg-glass-200 hover:bg-[#E1306C] hover:text-white"
                        />
                        <SocialButton
                            href={user.socials?.linkedin}
                            icon={<Linkedin className="w-5 h-5" />}
                            label="LinkedIn"
                            color="bg-glass-200 hover:bg-[#0077b5] hover:text-white"
                        />
                        <SocialButton
                            href={`mailto:${user.email}`}
                            icon={<Mail className="w-5 h-5" />}
                            label="Email"
                            color="bg-glass-200 hover:bg-yellow-500 hover:text-white"
                        />

                        {/* Phone Logic */}
                        {user.phone?.number && (
                            <Button variant="ghost" className="h-full flex-col gap-1 py-3 border border-white/5 bg-white/5" onClick={() => window.open(`tel:${user.phone.number}`, '_self')}>
                                <Phone className="w-5 h-5 mb-1" />
                                <span className="text-xs">{user.phone.number}</span>
                            </Button>
                        )}
                    </div>

                    {/* Footers */}
                    <div className="space-y-3">
                        <Button onClick={downloadVCard} className="w-full bg-gradient-to-r from-neon-purple to-pink-600 border-none shadow-neon hover:shadow-pink-500/50">
                            <Download className="w-4 h-4 mr-2" />
                            Save Contact
                        </Button>

                        <div className="text-center pt-4 border-t border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Powered by AIESEC in India</p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

function SocialButton({ href, icon, label, color }: any) {
    if (!href) return (
        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/5 opacity-30 cursor-not-allowed">
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </div>
    );

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-300 ${color}`}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </a>
    )
}
