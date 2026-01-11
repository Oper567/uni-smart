'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  User, Mail, Lock, Building, BookOpen, 
  GraduationCap, Loader2, Eye, EyeOff, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEPARTMENTS = ["Computer Science", "Information Communication System", "Cyber Security", "Data Science", "Software Engineering", "Information System"];
const LEVELS = ["100", "200", "300", "400", "500"];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '',
    department: '', 
    matricNo: '', 
    staffId: '',
    courses: '',
    level: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      return alert("Password must be at least 6 characters long");
    }

    setLoading(true);
    
    const payload = {
      ...formData,
      role,
      level: role === 'STUDENT' ? formData.level : null,
      courses: role === 'LECTURER' 
        ? formData.courses.split(',').map(c => c.trim().toUpperCase()).filter(c => c !== "") 
        : []
    };

    try {
      await api.post('/auth/register', payload);
      
      // Removed isSuccess state
      // Immediate redirect to login with a success message
      alert("Account created successfully! Please log in.");
      router.push('/login');

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Registration failed. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start sm:justify-center p-4 pt-10 font-[family-name:var(--font-geist-sans)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white sm:shadow-2xl sm:border border-slate-100 rounded-[2.5rem] p-6 sm:p-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-black tracking-tighter mb-2">Join UniSmart</h2>
          <p className="text-slate-600 font-medium tracking-tight">Create your {role.toLowerCase()} account</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          {['STUDENT', 'LECTURER'].map((r) => (
            <button 
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setFormData(prev => ({ ...prev, matricNo: '', staffId: '', courses: '', level: '' }));
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                role === r ? 'bg-white shadow-sm text-black' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            icon={<User size={20}/>} 
            placeholder="Full Name" 
            value={formData.name} 
            onChange={(v) => setFormData({...formData, name: v})} 
          />
          
          <Input 
            icon={<Mail size={20}/>} 
            type="email" 
            placeholder="Email Address" 
            value={formData.email} 
            onChange={(v) => setFormData({...formData, email: v})} 
          />

          <div className="relative">
            <Input 
              icon={<Lock size={20}/>} 
              type={showPassword ? "text" : "password"} 
              placeholder="Create Password" 
              value={formData.password} 
              onChange={(v) => setFormData({...formData, password: v})} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-transform group-focus-within:scale-110"><Building size={20}/></div>
            <select 
              required
              className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black focus:bg-white outline-none transition-all text-[16px] text-black appearance-none font-medium"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>

          <AnimatePresence mode="wait">
            {role === 'STUDENT' ? (
              <motion.div
                key="student-fields"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Input 
                  icon={<GraduationCap size={20}/>} 
                  placeholder="Matric Number (e.g. 19/CSC/001)" 
                  value={formData.matricNo} 
                  onChange={(v) => setFormData({...formData, matricNo: v.toUpperCase()})} 
                />

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-transform group-focus-within:scale-110"><Layers size={20}/></div>
                  <select 
                    required
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black focus:bg-white outline-none transition-all text-[16px] text-black appearance-none font-medium"
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                  >
                    <option value="">Select Level</option>
                    {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl} Level</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="lecturer-fields"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Input 
                  icon={<BookOpen size={20}/>} 
                  placeholder="Staff ID" 
                  value={formData.staffId} 
                  onChange={(v) => setFormData({...formData, staffId: v.toUpperCase()})} 
                />
                <Input 
                  icon={<BookOpen size={20}/>} 
                  placeholder="Courses (e.g. CSC101, DCOT205)" 
                  value={formData.courses}
                  onChange={(v) => setFormData({...formData, courses: v})} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-lg active:scale-[0.98] disabled:bg-slate-300 disabled:scale-100 transition-all mt-4 flex items-center justify-center gap-3 shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 font-medium text-sm">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="text-black font-black underline underline-offset-4 decoration-2">Log In</button>
        </p>
      </motion.div>
    </div>
  );
}

function Input({ icon, type = "text", placeholder, value, onChange }: { 
  icon: React.ReactNode, 
  type?: string, 
  placeholder: string, 
  value: string, 
  onChange: (v: string) => void 
}) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:scale-110 transition-transform">{icon}</div>
      <input 
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black focus:bg-white outline-none transition-all text-[16px] text-black placeholder:text-slate-400 font-medium"
      />
    </div>
  );
}