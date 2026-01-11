import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QrCode, UserCircle, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('/grid-bg.svg')] bg-cover relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-aiesec-blue/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-neon-purple/20 rounded-full blur-[120px] -z-10" />

      <div className="z-10 text-center space-y-8 max-w-4xl mx-auto">
        {/* Hero Text */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-aiesec-light to-gray-400 drop-shadow-sm">
            CONNECT
          </h1>
          <p className="text-xl md:text-2xl text-aiesec-midBlue font-light tracking-widest uppercase">
            AIESEC Conference 2026
          </p>
          <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base">
            The future of networking is here. Connect, share, and expand your impact with your digital delegate identity.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
          <Link href="/login" className="group">
            <Card className="h-full hover:bg-glass-200 transition-colors border-neon-blue/20 hover:border-neon-blue/50 group-hover:-translate-y-1 duration-300">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-aiesec-blue/10 rounded-full text-aiesec-blue group-hover:text-white group-hover:bg-aiesec-blue transition-colors">
                  <UserCircle className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-white">Delegate Login</h3>
                <p className="text-xs text-gray-400">Access your profile, edit details, and view requests.</p>
              </div>
            </Card>
          </Link>

          <Link href="/scan" className="group">
            <Card className="h-full hover:bg-glass-200 transition-colors border-neon-purple/20 hover:border-neon-purple/50 group-hover:-translate-y-1 duration-300">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-neon-purple/10 rounded-full text-neon-purple group-hover:text-white group-hover:bg-neon-purple transition-colors">
                  <QrCode className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-white">Scan a Badge</h3>
                <p className="text-xs text-gray-400">Found a card? Scan the QR code to connect instantly.</p>
              </div>
            </Card>
          </Link>

          <Link href="/admin/login" className="group">
            <Card className="h-full hover:bg-glass-200 transition-colors border-pink-500/20 hover:border-pink-500/50 group-hover:-translate-y-1 duration-300">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-pink-500/10 rounded-full text-pink-500 group-hover:text-white group-hover:bg-pink-500 transition-colors">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-white">Admin Portal</h3>
                <p className="text-xs text-gray-400">Manage delegates, generate QRs, and view analytics.</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-[10px] text-gray-600 uppercase tracking-widest">
        Powered by AIESEC Tech • Privacy Secure
      </footer>
    </div>
  );
}
