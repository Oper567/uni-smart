'use client'; // This must be at the very top now
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Define routes that should hide the Global Nav/Footer
  const isDashboard = 
    pathname?.startsWith("/student") || 
    pathname?.startsWith("/lecturer") || 
    pathname?.startsWith("/scan");

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-black min-h-screen flex flex-col`}
      >
        {/* --- GLOBAL NAVBAR --- */}
        {!isDashboard && (
          <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-black p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                  <QrCode className="text-white" size={20} />
                </div>
                <span className="text-xl font-black tracking-tighter text-black">UniSmart</span>
              </Link>
              
              <div className="flex items-center gap-6">
                <Link href="/login" className="text-sm font-bold text-black hover:opacity-70 transition-opacity">
                  Log In
                </Link>
                <Link href="/register" className="bg-black text-white px-5 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all">
                  Register
                </Link>
              </div>
            </div>
          </nav>
        )}

        <main className={`flex-grow ${!isDashboard ? "pt-16" : ""}`}>
          {children}
        </main>

        {!isDashboard && (
          <footer className="py-8 border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm font-medium">
              © 2026 UniSmart System • Built for modern universities
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}