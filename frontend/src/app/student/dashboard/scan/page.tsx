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
    // 1. Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      }, 
      /* verbose= */ false
    );

    // 2. Define what happens when a code is found
    const onScanSuccess = async (decodedText: string) => {
      setIsScanning(false);
      scanner.clear(); // Stop the camera
      
      setStatus({ type: 'loading', text: 'Verifying with server...' });

      try {
        // Send the QR token to your backend
        const res = await api.post('/attendance/mark', { qrToken: decodedText });
        
        setStatus({ type: 'success', text: `Success! Attendance marked for ${res.data.courseCode}` });
        
        // Redirect back home after 3 seconds
        setTimeout(() => router.push('/student/dashboard'), 3000);
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || "Invalid or Expired QR Code";
        setStatus({ type: 'error', text: errorMsg });
        
        // Allow retry after 3 seconds
        setTimeout(() => window.location.reload(), 3000);
      }
    };

    const onScanFailure = (error: any) => {
      // We usually don't want to show errors for every failed frame
      // so we keep this empty to let the scanner keep looking
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup: stop camera when user leaves the page
    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup failed", err));
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Top Bar */}
      <div className="p-6 flex items-center gap-4 text-white z-10">
        <button 
          onClick={() => router.back()} 
          className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Attendance Scanner</h1>
          <p className="text-slate-400 text-sm">Align QR code within the frame</p>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-sm aspect-square bg-black rounded-[3rem] overflow-hidden border-4 border-indigo-500 shadow-2xl shadow-indigo-500/20 relative">
          <div id="reader" className="w-full h-full"></div>
          
          {/* Overlay when processing */}
          {!isScanning && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
              {status.type === 'loading' && (
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
              )}
              {status.type === 'success' && (
                <div className="bg-green-500 p-4 rounded-full mb-4 text-white">
                  <ShieldCheck size={48} />
                </div>
              )}
              {status.type === 'error' && (
                <div className="bg-red-500 p-4 rounded-full mb-4 text-white">
                  <AlertCircle size={48} />
                </div>
              )}
              <p className={`font-bold text-lg ${
                status.type === 'success' ? 'text-green-400' : 
                status.type === 'error' ? 'text-red-400' : 'text-white'
              }`}>
                {status.text}
              </p>
            </div>
          )}
        </div>

        {/* Instructional Footer */}
        <div className="mt-10 text-center space-y-2">
            <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Live Camera Active</span>
            </div>
          <p className="text-slate-500 text-sm px-8">
            Please ensure you have a stable internet connection for instant verification.
          </p>
        </div>
      </div>
    </div>
  );
}