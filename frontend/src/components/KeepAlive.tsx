'use client'; // Required for Next.js App Router
import { useEffect } from 'react';

export default function KeepAlive() {
  useEffect(() => {
    // Replace with your actual URLs
    const urls = [
      'https://unismart.com.ng/health',        // Frontend Health
      'https://uni-smart-backend.onrender.com/health' // Backend Health
    ];

    const ping = async () => {
      try {
        await Promise.all(
          urls.map(url => fetch(url, { mode: 'no-cors' }))
        );
        console.log('📡 Keep-alive ping sent at:', new Date().toLocaleTimeString());
      } catch (e) {
        console.error('📡 Ping failed', e);
      }
    };

    // Ping every 10 minutes (600,000 ms)
    const interval = setInterval(ping, 600000);
    
    // Initial ping on load
    ping();

    return () => clearInterval(interval);
  }, []);

  return null; // This component renders nothing
}