'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useMosiStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { 
  User, Building2, Globe, Mic, Video, Type, Languages,
  Calendar, Clock, MapPin, ArrowRight, ChevronRight,
  ShieldCheck, Briefcase, LinkIcon, Sparkles, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SetupPage() {
  const router = useRouter()
  const { setCurrentSession, scheduleSession } = useMosiStore()

  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({
    // Stakeholder
    name: '', role: '', phone: '', email: '', linkedin: '',
    // Enterprise
    company: '', sector: '', products: '', employees: '', revenue: '',
    yearsInBusiness: '', geography: '',
    // Settings
    audio: true, video: true, transcript: true, translate: false,
    // Schedule
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

  const inputClass = "w-full h-14 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm font-bold uppercase tracking-tight placeholder:text-slate-300"
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1"

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Discovery Preparation
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9]">
            Configure <br/>Your <span className="text-blue-600">Session</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Architect the stakeholder profile for precision discovery.</p>
        </div>
        
        {/* Step indicator */}
        <div className="flex items-center bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => setStep(s)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                  step === s ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <span>{String(s).padStart(2, '0')}</span>
                <span className={cn(step !== s && "hidden lg:inline")}>
                   {s === 1 ? 'Stakeholder' : s === 2 ? 'Enterprise' : 'Protocol'}
                </span>
              </button>
              {s < 3 && <div className="w-4 h-px bg-slate-100 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {/* Step 1: Stakeholder */}
        {step === 1 && (
          <div className="premium-card p-8 lg:p-12 space-y-10 bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
               <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
                  <User className="w-8 h-8" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Identity Profile</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Primary point of contact information</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { key: 'name', label: 'Full Legal Name', placeholder: 'e.g. MARCUS AURELIUS', icon: User },
                { key: 'role', label: 'Designation / Role', placeholder: 'e.g. OPERATIONS DIRECTOR', icon: Briefcase },
                { key: 'phone', label: 'Verified Phone', placeholder: '+1 (555) 000-0000', icon: ShieldCheck },
                { key: 'email', label: 'Corporate Email', placeholder: 'marcus@enterprise.com', icon: Globe },
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <label className={labelClass}>{f.label}</label>
                  <div className="relative group">
                     {/* <f.icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" /> */}
                     <input
                        id={`setup-${f.key}`}
                        type={f.key === 'email' ? 'email' : 'text'}
                        className={inputClass}
                        placeholder={f.placeholder}
                        value={(form as any)[f.key]}
                        onChange={e => update(f.key, e.target.value)}
                     />
                  </div>
                </div>
              ))}
              <div className="md:col-span-2 space-y-1">
                <label className={labelClass}>Social Identity (LN)</label>
                <div className="relative">
                   <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   <input
                     id="setup-linkedin"
                     type="text"
                     className={cn(inputClass, "pl-14")}
                     placeholder="LINKEDIN.COM/IN/USERNAME"
                     value={form.linkedin}
                     onChange={e => update('linkedin', e.target.value)}
                   />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enterprise */}
        {step === 2 && (
          <div className="premium-card p-8 lg:p-12 space-y-10 bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
               <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <Building2 className="w-8 h-8" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Enterprise Matrix</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Organizational scale and market context</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { key: 'company', label: 'Entity Name', placeholder: 'CORP. LOGISTICS SYSTMS' },
                { key: 'sector', label: 'Industrial Sector', placeholder: 'INFRASTRUCTURE & TECH' },
                { key: 'employees', label: 'Human Scale (HC)', placeholder: '5,000+' },
                { key: 'revenue', label: 'GTV / Annual Revenue', placeholder: '$1B+' },
                { key: 'yearsInBusiness', label: 'Tenure (Years)', placeholder: '25' },
                { key: 'geography', label: 'Global Footprint', placeholder: 'EMEA / APAC' },
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <label className={labelClass}>{f.label}</label>
                  <input
                    id={`setup-${f.key}`}
                    type="text"
                    className={inputClass}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => update(f.key, e.target.value)}
                  />
                </div>
              ))}
              <div className="md:col-span-2 space-y-1">
                <label className={labelClass}>Core Value Propositions</label>
                <textarea
                  id="setup-products"
                  rows={3}
                  className="w-full p-6 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm font-bold uppercase tracking-tight placeholder:text-slate-300 resize-none"
                  placeholder="SYNTHESIZE THE MAIN OFFERINGS..."
                  value={form.products}
                  onChange={e => update('products', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Meeting Config */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="premium-card p-10 bg-slate-900 text-white space-y-10 shadow-2xl shadow-slate-200">
               <div className="flex items-center gap-4 border-b border-white/10 pb-8">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                     <Mic className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-black uppercase tracking-tighter">Capture Protocol</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Recording and transcription settings</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  {[
                    { id: 'audio', label: 'ENABLE HIGH-FIDELITY AUDIO', icon: Mic, key: 'audio' as const },
                    { id: 'video', label: 'CAPTURE OPTICAL FEED', icon: Video, key: 'video' as const },
                    { id: 'transcript', label: 'REAL-TIME AI TRANSCRIPTION', icon: Type, key: 'transcript' as const },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => update(opt.key, !(form as any)[opt.key])}
                      className={cn(
                         "w-full flex items-center justify-between p-5 rounded-2xl transition-all border-2",
                         (form as any)[opt.key] ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-900/40" : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <opt.icon className={cn("w-5 h-5", (form as any)[opt.key] ? "text-white" : "text-slate-600")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                      </div>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", (form as any)[opt.key] ? "bg-white border-white" : "border-white/20")}>
                         {(form as any)[opt.key] && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    </button>
                  ))}
               </div>
            </div>

            <div className="premium-card p-10 bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                     <Calendar className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Temporal Context</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scheduling and meeting location</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className={labelClass}>Discovery Date</label>
                       <input type="date" className={inputClass} value={form.scheduleDate} onChange={e => update('scheduleDate', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label className={labelClass}>Start Time (UTC)</label>
                       <input type="time" className={inputClass} value={form.scheduleTime} onChange={e => update('scheduleTime', e.target.value)} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className={labelClass}>Meeting Node / Location</label>
                    <div className="relative">
                       <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                       <input className={cn(inputClass, "pl-14")} placeholder="ZOOM URL OR HQ BOARDROOM" value={form.location} onChange={e => update('location', e.target.value)} />
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* 🎮 NAVIGATION DOCK */}
        <div className="flex items-center gap-6 pt-10 border-t border-slate-100 px-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-10 py-5 text-[10px] font-black uppercase tracking-widest rounded-3xl border-2 border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all active:scale-95"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              id="setup-next-btn"
              onClick={() => setStep(step + 1)}
              className="flex-1 h-20 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-300 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row gap-4">
              <button
                id="setup-schedule-btn"
                onClick={() => {
                  scheduleSession()
                  router.push('/')
                }}
                className="lg:w-72 h-20 bg-white border-2 border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2"
              >
                Schedule Archive
              </button>
              <button
                id="setup-start-btn"
                onClick={handleStart}
                className="flex-1 h-20 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-400 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-3">
                   <Mic className="w-5 h-5" />
                </div>
                Initiate Discovery Live
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
