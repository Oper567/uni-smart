import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-6">
          <CheckCircle2 size={16} />
          <span>Now Live on Vercel</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Smart <span className="text-indigo-600">Attendance</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          The modern, QR-based attendance tracking system for your university. 
          Secure, fast, and paperless.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            Get Started <ArrowRight size={20} />
          </Link>
          
          <Link 
            href="/register" 
            className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-8 text-slate-400 text-sm">
        © 2026 UniSmart Attendance System
      </footer>
    </div>
  );
}