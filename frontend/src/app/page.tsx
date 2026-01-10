'use client';
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-100/50 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* --- LEFT: TEXT & DESCRIPTION --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} className="fill-current" />
              <span>Smart Solutions for Universities</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
              Verify Attendance <br />
              <span className="text-indigo-600">in Seconds.</span>
            </h1>
            
            <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
              UniSmart eliminates manual roll calls using encrypted QR codes. 
              A seamless, paperless experience designed specifically for the 
              modern academic environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200"
              >
                Join Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {[
                { icon: <ShieldCheck size={18} />, text: "Anti-Proxy Tech" },
                { icon: <Users size={18} />, text: "Real-time Sync" },
                { icon: <Zap size={18} />, text: "Instant Export" },
                { icon: <BarChart3 size={18} />, text: "History Tracking" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400 font-medium">
                  <div className="text-indigo-500">{item.icon}</div>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT: ANIMATED VISUAL --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0, 0.71, 0.2, 1.01] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[400px] aspect-square bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[3rem] p-1 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-white m-1 rounded-[2.8rem] flex flex-col items-center justify-center p-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-indigo-200"
                >
                  <div className="w-40 h-40 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white fill-white" size={60} />
                  </div>
                </motion.div>
                <div className="mt-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900">Secure QR Active</h3>
                  <p className="text-slate-400 text-sm mt-1">Refreshes every 30 seconds</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}