'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateQRBatch, getDashboardStats, getAllQrIds } from '@/lib/admin-actions';
import { generateAndDownloadPDF, generateAndDownloadZip } from '@/utils/download-helpers';
import { Download, Plus, Users, QrCode as QrIcon } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalQrs: 0, claimed: 0, unclaimed: 0 });
    const [generating, setGenerating] = useState(false);
    const [lastBatch, setLastBatch] = useState<string[]>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const data = await getDashboardStats();
        setStats(data);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const ids = await generateQRBatch(50); // Fixed batch size for MVP
            setLastBatch(ids);
            await loadStats();
            // alert(`Generated ${ids.length} QRs!`);
        } catch (e) {
            console.error(e);
            alert('Failed to generate QRs');
        }
        setGenerating(false);
    };

    const handleDownloadAll = async () => {
        if (!confirm('This will generate a large ZIP file with ALL QR codes. Continue?')) return;
        try {
            const allIds = await getAllQrIds();
            if (allIds.length === 0) {
                alert('No QRs found to download.');
                return;
            }
            await generateAndDownloadZip(allIds);
        } catch (e) {
            console.error(e);
            alert('Failed to download all QRs');
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold neon-text">Admin Dashboard</h1>
                        <p className="text-gray-400">Conference Overview</p>
                    </div>
                    <div className='flex gap-4'>
                        <Button onClick={handleDownloadAll} variant="glass" className="mr-2">
                            <Download className="w-4 h-4 mr-2" />
                            Download All
                        </Button>
                        <Button onClick={handleGenerate} loading={generating} variant="primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Generate 50 QRs
                        </Button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total QRs"
                        value={stats.totalQrs}
                        icon={<QrIcon className="w-8 h-8 text-aiesec-blue" />}
                    />
                    <StatsCard
                        title="Claimed"
                        value={stats.claimed}
                        icon={<Users className="w-8 h-8 text-green-400" />}
                    />
                    <StatsCard
                        title="Unclaimed"
                        value={stats.unclaimed}
                        icon={<QrIcon className="w-8 h-8 text-gray-500" />}
                    />
                </div>

                {/* Recent Batch Download Area */}
                {lastBatch.length > 0 && (
                    <Card className="border-neon-blue/30">
                        <h3 className="text-xl font-bold mb-4">New Batch Ready ({lastBatch.length})</h3>
                        <div className="flex gap-4">
                            <Button variant="glass" onClick={() => generateAndDownloadZip(lastBatch)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download ZIP (Images)
                            </Button>
                            <Button variant="glass" onClick={() => generateAndDownloadPDF(lastBatch)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF (Print)
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) {
    return (
        <Card className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase">{title}</p>
                <p className="text-4xl font-bold mt-2 text-white">{value}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-full border border-white/10">
                {icon}
            </div>
        </Card>
    )
}
