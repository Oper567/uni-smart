import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { QrCode } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniSmart | Digital Attendance System",
  description: "Secure QR-based attendance tracking for students and lecturers.",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
      >
        {/* --- GLOBAL NAVBAR --- */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <QrCode className="text-white" size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900">UniSmart</span>
            </Link>
            
            {/* Direct Auth Links */}
            <div className="flex items-center gap-6">
              <Link 
                href="/login" 
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all"
              >
                Register
              </Link>
            </div>
          </div>
        </nav>

        {/* --- PAGE CONTENT --- */}
        <main className="flex-grow pt-16">
          {children}
        </main>

        {/* --- SIMPLE FOOTER --- */}
        <footer className="py-8 border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
            © 2026 UniSmart System • Built for modern universities
          </div>
        </footer>
      </body>
    </html>
  );
}