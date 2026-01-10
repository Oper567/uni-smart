import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  manifest: "/manifest.json", // Good for PWA support later
};

export const viewport: Viewport = {
  themeColor: "#4f46e5", // Indigo-600 to match your UI
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen`}
      >
        {/* You can wrap {children} with a Provider here later if you add Redux or Context */}
        {children}
      </body>
    </html>
  );
}