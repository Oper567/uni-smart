'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '@/lib/api';

export default function Scanner() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    }, false);

    const onScanSuccess = async (decodedText: string) => {
      try {
        // Stop the scanner first
        await scanner.clear();
        handleMarkAttendance(decodedText);
      } catch (err) {
        console.error("Failed to clear scanner:", err);
      }
    };

    const onScanFailure = (error: any) => {
      // Quietly ignore scan errors while searching for a code
    };

    scanner.render(onScanSuccess, onScanFailure);

    // FIX: Ensure the cleanup function does NOT return a Promise
    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup error:", err));
    };
  }, []);

  const handleMarkAttendance = async (qrToken: string) => {
    setStatus('loading');
    try {
      // Get user from local storage to include profileId
      const userStr = localStorage.getItem('user');
      const storedUser = userStr ? JSON.parse(userStr) : null;
      const studentId = storedUser?.profileId || storedUser?.id;

      await api.post('/student/mark-attendance', { 
        qrToken,
        studentId 
      });
      
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold uppercase tracking-tight">Scan Classroom QR</h2>
      
      <div className="relative w-full max-w-[400px]">
        <div id="reader" className="overflow-hidden rounded-3xl border-2 border-slate-100 shadow-xl"></div>
        
        {/* Status Overlay */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 rounded-3xl backdrop-blur-sm"
            >
              <div className="text-center">
                {status === 'loading' && <p className="text-blue-600 font-bold animate-pulse">Verifying...</p>}
                {status === 'success' && <p className="text-emerald-600 font-bold">✅ Attendance Marked!</p>}
                {status === 'error' && <p className="text-red-500 font-bold">❌ Failed. Try again.</p>}
                
                {status !== 'loading' && (
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 text-xs font-black uppercase text-slate-400 underline"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}