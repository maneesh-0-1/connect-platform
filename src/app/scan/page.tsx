'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/components/ui/Button';

export default function ScanPage() {
    const router = useRouter();
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const initializedRef = useRef(false);
    const isProcessingRef = useRef(false);
    const [scanError, setScanError] = useState<string | null>(null);

    useEffect(() => {
        // Prevent double init in React Strict Mode
        if (initializedRef.current) return;
        initializedRef.current = true;
        // Reset processing flag on mount
        isProcessingRef.current = false;

        // Check for Secure Context
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.protocol === 'http:') {
            setScanError("Security restriction: Camera access requires HTTPS or Localhost.");
            alert("Camera access requires HTTPS. Please accept the security warning or use a secure tunnel (ngrok).");
            return;
        }

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText, decodedResult) => {
                onScanSuccess(decodedText, decodedResult);
            },
            (errorMessage) => {
                // ignore errors for better UX
            }
        ).catch(err => {
            console.error("Error starting scanner", err);
            setScanError("Camera failed to start. Permissions might be denied.");
        });

        return () => {
            // Cleanup function
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(err => console.error("Filter stop error", err));
            }
            initializedRef.current = false;
        };
    }, []);

    function onScanSuccess(decodedText: string, decodedResult: any) {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        console.log(`Code matched = ${decodedText}`, decodedResult);

        // Stop scanning immediately to prevent duplicate reads
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
            }).catch(console.error);
        }

        // Parse ID
        let targetId = decodedText;
        if (decodedText.includes('/qr/')) {
            const parts = decodedText.split('/qr/');
            if (parts.length > 1) {
                targetId = parts[1];
            }
        }
        if (targetId.includes('?')) {
            targetId = targetId.split('?')[0];
        }

        // Redirect
        router.push(`/qr/${targetId}`);
    }

    return (
        <div className="min-h-screen bg-[url('/grid-bg.svg')] bg-cover relative p-4 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

            <div className="relative z-10 w-full max-w-md space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold neon-text">Scan Badge</h1>
                </div>

                {/* Scanner Container */}
                <Card className="p-0 overflow-hidden bg-black border-neon-blue/50 relative shadow-[0_0_30px_rgba(0,243,255,0.2)]">

                    {/* The Scan Region */}
                    <div id="reader" className="w-full h-[400px] bg-black"></div>

                    {/* Custom Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* Darkened Borders */}
                        <div className="absolute inset-0 border-[40px] border-black/60 z-10"></div>

                        {/* Scan Frame */}
                        <div className="w-[280px] h-[280px] border-2 border-neon-blue relative z-20 shadow-[0_0_20px_rgba(0,243,255,0.5)] bg-transparent">
                            {/* Corner Markers */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-aiesec-blue -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-aiesec-blue -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-aiesec-blue -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-aiesec-blue -mb-1 -mr-1"></div>

                            {/* Scanning Animation */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-neon-blue shadow-[0_0_10px_#00c7ff] animate-scan"></div>
                        </div>
                    </div>

                    {scanError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30 p-6 text-center">
                            <p className="text-red-400 font-medium">{scanError}</p>
                        </div>
                    )}
                </Card>

                <p className="text-center text-gray-400 text-sm animate-pulse">
                    Align the QR code within the frame
                </p>
            </div>
        </div>
    );
}
