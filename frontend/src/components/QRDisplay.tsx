'use client';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';

export default function QRDisplay({ sessionId }: { sessionId: string }) {
  const [qrToken, setQrToken] = useState('');

  const fetchNewToken = async () => {
    try {
      const res = await api.get(`/session/refresh/${sessionId}`);
      setQrToken(res.data.qrToken);
    } catch (err) {
      console.error("Failed to refresh token");
    }
  };

  useEffect(() => {
    fetchNewToken();
    const interval = setInterval(fetchNewToken, 20000); // Refresh every 20s
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Scan to Mark Attendance</h3>
      {qrToken ? (
        <QRCodeSVG value={qrToken} size={300} level="H" includeMargin={true} />
      ) : (
        <div className="w-[300px] h-[300px] bg-gray-100 animate-pulse flex items-center justify-center">
          Loading QR...
        </div>
      )}
      <p className="mt-4 text-sm text-gray-500 italic">This code updates every 20 seconds</p>
    </div>
  );
}