'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useMosiStore } from '@/lib/store'
import { 
  User, Building2, Globe, Mic, Video, Type,
  Calendar, Clock, MapPin, ChevronRight,
  ShieldCheck, Briefcase, LinkIcon, Sparkles, CheckCircle,
  Activity, Layers, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SetupPage() {
  const router = useRouter()
  const { setCurrentSession, scheduleSession } = useMosiStore()

  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({
    name: '', role: '', phone: '', email: '', linkedin: '',
    company: '', sector: '', products: '', employees: '', revenue: '',
    yearsInBusiness: '', geography: '',
    audio: true, video: true, transcript: true, translate: false,
    scheduleDate: '', scheduleTime: '', location: ''
  })

  const update = (key: string, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleStart = () => {
    setCurrentSession({
      stakeholder: {
        name: form.name, role: form.role, phone: form.phone,
        email: form.email, linkedin: form.linkedin,
        company: form.company, sector: form.sector, products: form.products,
        employees: form.employees, revenue: form.revenue,
        yearsInBusiness: form.yearsInBusiness, geography: form.geography
      },
      settings: {
        audio: form.audio, video: form.video
      },
      opportunities: [],
      location: form.location,
      status: 'Recording'
    })
    router.push('/interview/live')
  }

  const inputClass = "w-full h-20 px-8 rounded-[2rem] bg-white/[0.03] border-2 border-white/5 focus:bg-white/[0.07] focus:border-blue-500/50 outline-none transition-all text-lg font-black tracking-tight placeholder:text-slate-800 text-white"
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2"

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 lg:p-12 space-y-12 animate-in fade-in duration-1000">
      
      {/* 🧭 INITIATION HEADER */}
      <section className="max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-12 pt-12">
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                    <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Initiation Sequence</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-white/90">
                Setup<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Discovery</span>
            </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center bg-white/[0.03] p-1.5 rounded-full border border-white/5 shadow-2xl">
          {[1, 2, 3].map((s) => (
            <button
                key={s}
                onClick={() => setStep(s)}
                className={cn(
                    "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    step === s ? 'bg-white text-black shadow-xl scale-105 z-10' : 'text-slate-600 hover:text-slate-400'
                )}
            >
                {s === 1 ? 'Identity' : s === s ? (s === 2 ? 'Enterprise' : 'Protocol') : ''}
            </button>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto">
        {/* Step 1: Stakeholder */}
        {step === 1 && (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className={labelClass}>Stakeholder Name</label>
                    <input className={inputClass} placeholder="ELON MUSK" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>Designation</label>
                    <input className={inputClass} placeholder="FOUNDER / CEO" value={form.role} onChange={e => update('role', e.target.value)} />
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className={labelClass}>Corporate Email</label>
                    <input className={inputClass} type="email" placeholder="ELON@SPACE.X" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>LinkedIn Matrix</label>
                    <input className={inputClass} placeholder="LN/ELONMUSK" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} />
                </div>
             </div>
          </div>
        )}

        {/* Step 2: Enterprise */}
        {step === 2 && (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className={labelClass}>Entity Name</label>
                    <input className={inputClass} placeholder="SPACE X" value={form.company} onChange={e => update('company', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>Sector Context</label>
                    <input className={inputClass} placeholder="AEROSPACE & TECH" value={form.sector} onChange={e => update('sector', e.target.value)} />
                </div>
             </div>
             <div className="space-y-2">
                 <label className={labelClass}>Strategic Focus Areas</label>
                 <textarea
                    rows={4}
                    className={cn(inputClass, "h-auto py-8 resize-none")}
                    placeholder="MULTI-PLANETARY COLONIZATION, REUSABLE ROCKETS..."
                    value={form.products}
                    onChange={e => update('products', e.target.value)}
                 />
             </div>
          </div>
        )}

        {/* Step 3: Protocol */}
        {step === 3 && (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                    { key: 'audio', label: 'Audio Capture', icon: Mic },
                    { key: 'video', label: 'Optical Feed', icon: Video },
                    { key: 'transcript', label: 'AI Synthesis', icon: Sparkles },
                ].map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => update(opt.key, !(form as any)[opt.key])}
                        className={cn(
                            "p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6",
                            (form as any)[opt.key] ? "bg-white/[0.05] border-blue-600 text-white shadow-2xl shadow-blue-900/10" : "bg-white/[0.02] border-white/5 text-slate-700 hover:text-slate-500 hover:border-white/10"
                        )}
                    >
                        <opt.icon className={cn("w-10 h-10", (form as any)[opt.key] ? "text-blue-500" : "text-slate-800")} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{opt.label}</span>
                        {(form as any)[opt.key] && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />}
                    </button>
                ))}
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div className="space-y-2">
                    <label className={labelClass}>Meeting Node</label>
                    <input className={inputClass} placeholder="STARBASE 1" value={form.location} onChange={e => update('location', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className={labelClass}>Date</label>
                        <input type="date" className={cn(inputClass, "uppercase")} value={form.scheduleDate} onChange={e => update('scheduleDate', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>Time</label>
                        <input type="time" className={inputClass} value={form.scheduleTime} onChange={e => update('scheduleTime', e.target.value)} />
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* 🎮 NAVIGATION DOCK */}
        <div className="flex items-center gap-8 pt-20">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border border-white/10 flex items-center justify-center text-slate-600 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 h-24 lg:h-32 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-3xl shadow-white/5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 border-8 border-black group"
            >
              Next Phase <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 h-24 lg:h-32 bg-blue-600 text-white rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-3xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 border-8 border-black group"
            >
              Initiate Connection <Activity className="w-6 h-6 animate-pulse" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
