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
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true
      }, 
      /* verbose= */ false
    );

    // 2. Define what happens when a code is found
    const onScanSuccess = async (decodedText: string) => {
      // Prevent multiple scans at once
      if (!isScanning) return; 
      
      setIsScanning(false);
      
      try {
        await scanner.clear(); // Stop camera hardware immediately
      } catch (e) {
        console.warn("Scanner stop warning", e);
      }
      
      setStatus({ type: 'loading', text: 'Verifying with server...' });

      try {
        // Pull token fresh from storage
        const token = localStorage.getItem('token');

        // Sending 'sessionId' to match backend expectation
        const res = await api.post('/attendance/mark', 
          { sessionId: decodedText }, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setStatus({ 
          type: 'success', 
          text: `Success! Attendance marked for ${res.data.courseCode || 'class'}` 
        });
        
        // Success redirect
        setTimeout(() => router.push('/student/dashboard'), 2500);
      } catch (err: any) {
        console.error("Scan Error:", err.response?.data);
        
        // Display specific error from backend (e.g., "Session Expired" or "Already Marked")
        const errorMsg = err.response?.data?.error || "Invalid or Expired QR Code";
        setStatus({ type: 'error', text: errorMsg });
        
        // Auto-refresh page after 3.5s to allow user to try again
        setTimeout(() => {
          window.location.reload();
        }, 3500);
      }
    };

    const onScanFailure = (error: any) => {
      // Quietly continue scanning
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup: stop camera hardware when user leaves the page
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
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Smart Attendance</p>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-sm aspect-square bg-black rounded-[3rem] overflow-hidden border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.3)] relative">
          
          {/* HTML5 QR Scanner target */}
          <div id="reader" className="w-full h-full"></div>
          
          {/* Status Overlay */}
          {!isScanning && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md transition-all">
              {status.type === 'loading' && (
                <>
                  <Loader2 className="animate-spin text-indigo-500 mb-6" size={60} />
                  <p className="text-white font-black text-xl">Verifying...</p>
                </>
              )}
              
              {status.type === 'success' && (
                <>
                  <div className="bg-green-500 p-5 rounded-full mb-6 text-white animate-bounce">
                    <ShieldCheck size={50} />
                  </div>
                  <p className="text-green-400 font-black text-2xl mb-2">Verified!</p>
                  <p className="text-white text-sm opacity-80">{status.text}</p>
                </>
              )}
              
              {status.type === 'error' && (
                <>
                  <div className="bg-red-500 p-5 rounded-full mb-6 text-white">
                    <AlertCircle size={50} />
                  </div>
                  <p className="text-red-400 font-black text-2xl mb-2">Failed</p>
                  <p className="text-white text-sm opacity-80 mb-6">{status.text}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white text-black font-bold rounded-xl text-xs uppercase"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center space-y-3">
            <div className="flex justify-center items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Sensor Ready</span>
            </div>
          <p className="text-slate-500 text-xs max-w-[250px] mx-auto leading-relaxed">
            Position the lecturer's QR code within the blue frame to register your attendance.
          </p>
        </div>
      </div>
    </div>
  );
}