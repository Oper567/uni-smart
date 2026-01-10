'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, Mail, Lock, Building, BookOpen, GraduationCap, Loader2 } from 'lucide-react';

// Define your departments to keep data consistent
const DEPARTMENTS = ["Computer Science", "Information Communication System", "Cyber Security", "Data Science", "Software Engineering", "Information System"];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    department: '', matricNo: '', staffId: '',
    courses: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      role,
      // Convert "CSC101, DCOT205" -> ["CSC101", "DCOT205"]
      courses: role === 'LECTURER' 
        ? formData.courses.split(',').map(c => c.trim().toUpperCase()).filter(c => c !== "") 
        : []
    };

    try {
      await api.post('/auth/register', payload);
      router.push('/login');
    } catch (err: any) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-3xl font-black text-indigo-600 mb-2 text-center">Smart Attendance</h2>
        <p className="text-slate-500 text-center mb-8">Create your {role.toLowerCase()} account</p>
        
        {/* Role Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          {['STUDENT', 'LECTURER'].map((r) => (
            <button 
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${role === r ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Explicitly typing 'v' as string to satisfy TypeScript build requirements */}
            <Input icon={<User size={18}/>} placeholder="Full Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
            <Input icon={<Mail size={18}/>} type="email" placeholder="Email Address" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
            <Input icon={<Lock size={18}/>} type="password" placeholder="Password" value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})} />
            
            {/* Department Dropdown */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Building size={18}/></div>
              <select 
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            {role === 'STUDENT' ? (
              <Input icon={<GraduationCap size={18}/>} placeholder="Matric Number" value={formData.matricNo} onChange={(v: string) => setFormData({...formData, matricNo: v})} />
            ) : (
              <>
                <Input icon={<BookOpen size={18}/>} placeholder="Staff ID" value={formData.staffId} onChange={(v: string) => setFormData({...formData, staffId: v})} />
                <div className="md:col-span-2">
                  <Input 
                    icon={<BookOpen size={18}/>} 
                    placeholder="Assigned Courses (e.g. CSC101, DCOT205)" 
                    value={formData.courses}
                    onChange={(v: string) => setFormData({...formData, courses: v})} 
                  />
                  <p className="text-[10px] text-slate-400 mt-1 ml-2">* This restricts which courses you can start sessions for.</p>
                </div>
              </>
            )}
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Register Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Fixed the 'any' types here to be more specific for the build process
function Input({ icon, type = "text", placeholder, value, onChange }: { 
  icon: React.ReactNode, 
  type?: string, 
  placeholder: string, 
  value: string, 
  onChange: (v: string) => void 
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input 
        type={type}
        required
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
      />
    </div>
  );
}