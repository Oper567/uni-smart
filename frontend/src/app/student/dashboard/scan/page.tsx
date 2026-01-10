'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ScanPage() {
  const router = useRouter();
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // 1. Initialize the scanner with optimized mobile settings
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 20, // Increased FPS for faster recognition
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true
      }, 
      /* verbose= */ false
    );

    // 2. Define what happens when a code is found
    const onScanSuccess = async (decodedText: string) => {
      if (!isScanning) return; 
      
      setIsScanning(false);
      
      // Haptic feedback for mobile devices
      if (typeof window !== 'undefined' && window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
      
      try {
        await scanner.clear(); 
      } catch (e) {
        console.warn("Scanner stop warning", e);
      }
      
      setStatus({ type: 'loading', text: 'Verifying with server...' });

      try {
        const token = localStorage.getItem('token');

        // Sending 'qrToken' to match the backend controller's primary expectation
        const res = await api.post('/attendance/mark', 
          { qrToken: decodedText }, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setStatus({ 
          type: 'success', 
          text: res.data.message || `Attendance marked for ${res.data.courseCode}` 
        });
        
        setTimeout(() => router.push('/student/dashboard'), 2500);
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || "Invalid or Expired QR Code";
        setStatus({ type: 'error', text: errorMsg });
        
        // Auto-refresh to retry after error
        setTimeout(() => {
          window.location.reload();
        }, 3500);
      }
    };

    const onScanFailure = () => { /* Continue scanning */ };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup failed", err));
    };
  }, [router, isScanning]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Top Bar */}
      <div className="p-6 flex items-center gap-4 text-white z-10">
        <button 
          onClick={() => router.back()} 
          className="p-3 bg-white/10 rounded-2xl active:scale-90 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Scanner</h1>
          <p className="text-indigo-400 text-[10px] uppercase tracking-[0.2em] font-bold">Smart Attendance v2</p>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-sm aspect-square bg-black rounded-[3rem] overflow-hidden border-4 border-indigo-500 shadow-[0_0_60px_rgba(99,102,241,0.4)] relative">
          
          <div id="reader" className="w-full h-full"></div>
          
          {/* Status Overlay */}
          {!isScanning && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md z-20">
              {status.type === 'loading' && (
                <>
                  <Loader2 className="animate-spin text-indigo-500 mb-6" size={64} />
                  <p className="text-white font-black text-xl animate-pulse">Processing...</p>
                </>
              )}
              
              {status.type === 'success' && (
                <>
                  <div className="bg-green-500 p-6 rounded-full mb-6 text-white animate-bounce shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                    <ShieldCheck size={56} />
                  </div>
                  <p className="text-green-400 font-black text-2xl mb-2">Verified!</p>
                  <p className="text-white/80 text-sm font-medium">{status.text}</p>
                </>
              )}
              
              {status.type === 'error' && (
                <>
                  <div className="bg-red-500 p-6 rounded-full mb-6 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                    <AlertCircle size={56} />
                  </div>
                  <p className="text-red-400 font-black text-2xl mb-2">Error</p>
                  <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed">{status.text}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-white text-black font-black rounded-2xl text-sm uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Tap to Retry
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Awaiting Scan</span>
            </div>
          <p className="text-slate-500 text-xs max-w-[280px] mx-auto leading-relaxed font-medium">
            Keep your device steady and point the camera at the QR code displayed by your lecturer.
          </p>
        </div>
      </div>
    </div>
  );
}