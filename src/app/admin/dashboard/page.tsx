'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    generateQRBatch,
    getDetailedAdminData,
    getAllQrIds,
    toggleQRStatus,
    deleteQRs,
    DelegateData
} from '@/lib/admin-actions';
import { generateAndDownloadPDF, generateAndDownloadZip } from '@/utils/download-helpers';
import { Download, Plus, Users, QrCode as QrIcon, Search, Ban, CheckCircle, FileSpreadsheet, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
    const [data, setData] = useState<{
        stats: { totalQrs: number, claimed: number, unclaimed: number, disabled: number },
        delegates: DelegateData[],
        entityDistribution: Record<string, number>
    } | null>(null);

    const [generating, setGenerating] = useState(false);
    const [lastBatch, setLastBatch] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'CLAIMED' | 'UNCLAIMED' | 'DISABLED'>('ALL');
    const [selectedQRs, setSelectedQRs] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const result = await getDetailedAdminData();
        setData(result);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const ids = await generateQRBatch(50);
            setLastBatch(ids);
            await loadData();
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

    const handleToggleStatus = async (qrId: string, shouldDisable: boolean) => {
        if (!confirm(`Are you sure you want to ${shouldDisable ? 'DISABLE' : 'ENABLE'} this QR?`)) return;
        const result = await toggleQRStatus(qrId, shouldDisable);
        if (result.success) {
            loadData();
        } else {
            alert('Failed to update status');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedQRs(new Set(filteredDelegates.map(d => d.qrId)));
        } else {
            setSelectedQRs(new Set());
        }
    };

    const handleSelectQR = (qrId: string) => {
        const newSet = new Set(selectedQRs);
        if (newSet.has(qrId)) {
            newSet.delete(qrId);
        } else {
            newSet.add(qrId);
        }
        setSelectedQRs(newSet);
    };

    const handleDeleteSelected = async () => {
        if (selectedQRs.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedQRs.size} selected QRs? This action cannot be undone.`)) return;

        setDeleting(true);
        const result = await deleteQRs(Array.from(selectedQRs));
        if (result.success) {
            setSelectedQRs(new Set());
            await loadData();
        } else {
            alert('Failed to delete selected QRs');
        }
        setDeleting(false);
    };

    const handleDeleteSingle = async (qrId: string) => {
        if (!confirm('Are you sure you want to delete this QR? This action cannot be undone.')) return;
        
        setDeleting(true);
        const result = await deleteQRs([qrId]);
        if (result.success) {
            const newSet = new Set(selectedQRs);
            newSet.delete(qrId);
            setSelectedQRs(newSet);
            await loadData();
        } else {
            alert('Failed to delete QR');
        }
        setDeleting(false);
    };

    const handleExportCSV = () => {
        if (!data?.delegates) return;

        const headers = ["QR ID", "Status", "Name", "Email", "Entity", "Profile %", "Last Scan", "Scan Count"];
        const rows = data.delegates.map(d => [
            d.qrId,
            d.status,
            d.name,
            d.email,
            d.entity,
            d.profileCompletion + '%',
            d.lastScan || 'Never',
            d.scanCount
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `delegates_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredDelegates = useMemo(() => {
        if (!data?.delegates) return [];
        return data.delegates.filter(d => {
            const matchesSearch =
                d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.qrId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.entity.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = statusFilter === 'ALL' || d.status === statusFilter;

            return matchesSearch && matchesFilter;
        });
    }, [data?.delegates, searchTerm, statusFilter]);

    if (!data) return <div className="p-8 text-white min-h-screen">Loading dashboard data...</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Actions */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold neon-text">Admin Dashboard</h1>
                        <p className="text-gray-400">Conference Overview & Delegate Management</p>
                    </div>
                    <div className='flex gap-4 flex-wrap'>
                        <Button onClick={handleExportCSV} variant="glass">
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Export Data
                        </Button>
                        <Button onClick={handleDownloadAll} variant="glass">
                            <Download className="w-4 h-4 mr-2" />
                            Download All QRs
                        </Button>
                        <Button onClick={handleGenerate} loading={generating} variant="primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Generate 50 QRs
                        </Button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatsCard title="Total QRs" value={data.stats.totalQrs} icon={<QrIcon className="w-8 h-8 text-blue-400" />} />
                    <StatsCard title="Claimed" value={data.stats.claimed} icon={<Users className="w-8 h-8 text-green-400" />} />
                    <StatsCard title="Unclaimed" value={data.stats.unclaimed} icon={<QrIcon className="w-8 h-8 text-gray-500" />} />
                    <StatsCard title="Disabled" value={data.stats.disabled} icon={<Ban className="w-8 h-8 text-red-500" />} />
                </div>

                {/* Entity Distribution */}
                <Card className="border-neon-blue/30 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" /> Entity Distribution
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(data.entityDistribution).map(([entity, count]) => (
                            <div key={entity} className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                                <span className="block text-2xl font-bold text-white">{count}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider">{entity}</span>
                            </div>
                        ))}
                        {Object.keys(data.entityDistribution).length === 0 && (
                            <p className="text-gray-500 col-span-full">No entity data available yet.</p>
                        )}
                    </div>
                </Card>

                {/* Recent Batch Download Area */}
                {lastBatch.length > 0 && (
                    <Card className="border-neon-blue/30 p-6 bg-green-900/10">
                        <h3 className="text-xl font-bold mb-4 text-green-400">New Batch Ready ({lastBatch.length})</h3>
                        <div className="flex gap-4">
                            <Button variant="glass" onClick={() => generateAndDownloadZip(lastBatch)}>
                                <Download className="w-4 h-4 mr-2" /> Download ZIP (Images)
                            </Button>
                            <Button variant="glass" onClick={() => generateAndDownloadPDF(lastBatch)}>
                                <Download className="w-4 h-4 mr-2" /> Download PDF (Print)
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Delegate Table Section */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex gap-2 items-center flex-wrap">
                            <div className="relative flex-1 max-w-md min-w-[250px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, QR ID..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-neon-blue outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {selectedQRs.size > 0 && (
                                <Button 
                                    onClick={handleDeleteSelected} 
                                    loading={deleting} 
                                    className="bg-red-900/40 hover:bg-red-900/60 text-red-500 border border-red-900/50 text-sm whitespace-nowrap h-[42px] px-4 py-2"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Selected ({selectedQRs.size})
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {(['ALL', 'CLAIMED', 'UNCLAIMED', 'DISABLED'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === filter
                                        ? 'bg-neon-blue text-black'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 w-12">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded bg-black/40 border-white/20 text-neon-blue focus:ring-neon-blue cursor-pointer"
                                                checked={filteredDelegates.length > 0 && selectedQRs.size === filteredDelegates.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="p-4">QR ID</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Entity</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Profile %</th>
                                        {/* <th className="p-4">Visibility</th> */}
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredDelegates.map(d => (
                                        <tr key={d.qrId} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded bg-black/40 border-white/20 text-neon-blue focus:ring-neon-blue cursor-pointer"
                                                    checked={selectedQRs.has(d.qrId)}
                                                    onChange={() => handleSelectQR(d.qrId)}
                                                />
                                            </td>
                                            <td className="p-4 font-mono text-xs text-gray-500">{d.qrId.substring(0, 8)}...</td>
                                            <td className="p-4">
                                                <Badge status={d.status} />
                                            </td>
                                            <td className="p-4 font-medium text-white">{d.name}</td>
                                            <td className="p-4 text-gray-300">{d.entity}</td>
                                            <td className="p-4 text-gray-400 text-sm max-w-[200px] truncate">{d.email}</td>
                                            <td className="p-4 text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-neon-blue"
                                                            style={{ width: `${d.profileCompletion}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs">{d.profileCompletion}%</span>
                                                </div>
                                            </td>
                                            {/* <td className="p-4 text-xs text-gray-500">{d.phoneVisible}</td> */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {d.status !== 'DISABLED' ? (
                                                        <button
                                                            onClick={() => handleToggleStatus(d.qrId, true)}
                                                            className="text-orange-400 hover:text-orange-300 text-xs font-medium px-3 py-1 bg-orange-900/20 rounded border border-orange-900/50 hover:bg-orange-900/40 transition-colors"
                                                        >
                                                            Disable
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleToggleStatus(d.qrId, false)}
                                                            className="text-green-400 hover:text-green-300 text-xs font-medium px-3 py-1 bg-green-900/20 rounded border border-green-900/50 hover:bg-green-900/40 transition-colors"
                                                        >
                                                            Enable
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteSingle(d.qrId)}
                                                        className="text-red-400 hover:text-red-300 text-xs font-medium p-1.5 bg-red-900/20 rounded border border-red-900/50 hover:bg-red-900/40 transition-colors"
                                                        title="Delete QR"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredDelegates.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-gray-500">
                                                No delegates found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">Showing {filteredDelegates.length} results</p>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
    return (
        <Card className="flex items-center justify-between p-6 bg-black/40 border-white/10 hover:border-neon-blue/50 transition-all">
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                <p className="text-4xl font-bold mt-2 text-white">{value}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-full border border-white/10">
                {icon}
            </div>
        </Card>
    );
}

function Badge({ status }: { status: string }) {
    const styles = {
        CLAIMED: 'bg-green-900/20 text-green-400 border-green-900/50',
        UNCLAIMED: 'bg-gray-800 text-gray-400 border-gray-700',
        DISABLED: 'bg-red-900/20 text-red-400 border-red-900/50',
    };
    const style = styles[status as keyof typeof styles] || styles.UNCLAIMED;

    return (
        <span className={`px-2 py-1 rounded text-xs font-medium border ${style}`}>
            {status}
        </span>
    );
}
