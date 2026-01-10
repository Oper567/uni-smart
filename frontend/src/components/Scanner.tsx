'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '@/lib/api';

export default function Scanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    }, false);

    scanner.render(async (decodedText) => {
      scanner.clear(); // Stop scanning once we get a result
      handleMarkAttendance(decodedText);
    }, (error) => {
      // Quietly ignore scan errors while searching for a code
    });

    return () => scanner.clear();
  }, []);

  const handleMarkAttendance = async (qrToken: string) => {
    setStatus('loading');
    try {
      await api.post('/attendance/mark', { qrToken });
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Scan Classroom QR</h2>
      <div id="reader" className="w-full max-w-[400px] overflow-hidden rounded-lg"></div>
      
      {status === 'loading' && <p className="text-blue-500">Verifying attendance...</p>}
      {status === 'success' && <p className="text-green-500 font-bold">✅ Attendance Marked!</p>}
      {status === 'error' && <p className="text-red-500">❌ Failed. QR may be expired.</p>}
    </div>
  );
}