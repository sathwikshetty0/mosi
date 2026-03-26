'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useMosiStore } from '@/lib/store'
import { 
  User, Building2, Globe, Mic, Video, Type,
  Calendar, MapPin, ChevronRight, CheckCircle,
  Sparkles, Activity, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SetupPage() {
  const router = useRouter()
  const { setCurrentSession, scheduleSession } = useMosiStore()

  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({
    name: '', role: '', phone: '', email: '', linkedin: '', domain: '',
    company: '', sector: '', products: '', employees: '', revenue: '',
    yearsInBusiness: '', geography: '', address: '', pincode: '',
    audio: true, video: true, transcript: true, translate: false,
    scheduleDate: '', scheduleTime: '', location: ''
  })

  const update = (key: string, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleStart = () => {
    setCurrentSession({
      stakeholder: {
        name: form.name, role: form.role, phone: form.phone,
        email: form.email, linkedin: form.linkedin, domain: form.domain,
        company: form.company, sector: form.sector, products: form.products,
        employees: form.employees, revenue: form.revenue, address: form.address,
        yearsInBusiness: form.yearsInBusiness, geography: form.geography, pincode: form.pincode
      },
      settings: { audio: form.audio, video: form.video },
      opportunities: [],
      location: form.location,
      status: 'Recording'
    })
    router.push('/interview/live')
  }

  const inputClass = "w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-800 outline-none transition-all text-sm font-bold placeholder:text-slate-300"
  const labelClass = "block text-[9px] font-black text-slate-300 mb-2 uppercase tracking-widest"

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700 px-6 pt-10">
      
      {/* HEADER */}
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          New Interview Setup
        </h1>
        <p className="text-sm text-slate-400 font-medium">Please provide the stakeholder and company context before starting.</p>
      </div>

      {/* STEP TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
        {[
          { n: 1, label: 'Stakeholder' },
          { n: 2, label: 'Company' },
          { n: 3, label: 'Settings' }
        ].map(s => (
          <button
            key={s.n}
            onClick={() => setStep(s.n)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
              step === s.n ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelClass}>Stakeholder Name</label><input className={inputClass} placeholder="Jane Doe" value={form.name} onChange={e => update('name', e.target.value)} /></div>
            <div><label className={labelClass}>Job Title / Role</label><input className={inputClass} placeholder="Product Lead" value={form.role} onChange={e => update('role', e.target.value)} /></div>
            <div><label className={labelClass}>Contact Number</label><input className={inputClass} placeholder="+1 555-0000" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div><label className={labelClass}>Email Address</label><input className={inputClass} type="email" placeholder="jane@enterprise.com" value={form.email} onChange={e => update('email', e.target.value)} /></div>
            <div><label className={labelClass}>Vertical / Domain</label><input className={inputClass} placeholder="Logistics / AI" value={form.domain} onChange={e => update('domain', e.target.value)} /></div>
            <div className="md:col-span-1"><label className={labelClass}>LinkedIn Profile</label><input className={inputClass} placeholder="in/janedoe" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} /></div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelClass}>Company Identity</label><input className={inputClass} placeholder="Acme International" value={form.company} onChange={e => update('company', e.target.value)} /></div>
            <div><label className={labelClass}>Sector / Market</label><input className={inputClass} placeholder="Fintech & SaaS" value={form.sector} onChange={e => update('sector', e.target.value)} /></div>
            <div><label className={labelClass}>Employee Count</label><input className={inputClass} placeholder="50 - 200" value={form.employees} onChange={e => update('employees', e.target.value)} /></div>
            <div><label className={labelClass}>Annual Revenue</label><input className={inputClass} placeholder="$5M - $20M ARR" value={form.revenue} onChange={e => update('revenue', e.target.value)} /></div>
            <div><label className={labelClass}>Years Active</label><input className={inputClass} placeholder="8 Years" value={form.yearsInBusiness} onChange={e => update('yearsInBusiness', e.target.value)} /></div>
            <div><label className={labelClass}>Geographic Region</label><input className={inputClass} placeholder="EMEA / NA" value={form.geography} onChange={e => update('geography', e.target.value)} /></div>
            <div className="md:col-span-2">
              <label className={labelClass}>Service / Product Details</label>
              <textarea rows={3} className={cn(inputClass, "h-auto py-3 resize-none font-medium")} placeholder="Briefly describe what they do..." value={form.products} onChange={e => update('products', e.target.value)} />
            </div>
            <div><label className={labelClass}>HQ Headquarters</label><input className={inputClass} placeholder="123 Silicon Blvd" value={form.address} onChange={e => update('address', e.target.value)} /></div>
            <div><label className={labelClass}>Zip / Pincode</label><input className={inputClass} placeholder="10001" value={form.pincode} onChange={e => update('pincode', e.target.value)} /></div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 px-1 uppercase tracking-widest">Capture Settings</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'audio', label: 'Audio', icon: Mic },
                { key: 'video', label: 'Video', icon: Video },
                { key: 'transcript', label: 'Record', icon: Activity },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => update(opt.key, !(form as any)[opt.key])}
                  className={cn(
                    "p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 group relative overflow-hidden",
                    (form as any)[opt.key] ? "bg-slate-50 text-slate-800 border-slate-200 shadow-sm" : "bg-white text-slate-300 border-slate-100 hover:border-slate-200"
                  )}
                >
                  <opt.icon className={cn("w-5 h-5", (form as any)[opt.key] ? "text-blue-500" : "text-slate-200 group-hover:text-slate-400")} />
                  <span className="text-xs font-bold">{opt.label}</span>
                  {(form as any)[opt.key] && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
             <h3 className="text-xs font-bold text-slate-400 px-1 uppercase tracking-widest">Logistics (Optional)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>Meeting Date</label><input type="date" className={inputClass} value={form.scheduleDate} onChange={e => update('scheduleDate', e.target.value)} /></div>
                <div><label className={labelClass}>Meeting Time</label><input type="time" className={inputClass} value={form.scheduleTime} onChange={e => update('scheduleTime', e.target.value)} /></div>
                <div className="md:col-span-2"><label className={labelClass}>Digital Hub / Location</label><input className={inputClass} placeholder="Meeting Link or Physical Office" value={form.location} onChange={e => update('location', e.target.value)} /></div>
             </div>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="h-12 px-8 rounded-2xl border border-slate-100 text-xs font-bold text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all">
            Back
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="flex-1 h-12 bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex-1 flex gap-3">
            <button
              onClick={() => { scheduleSession(); router.push('/') }}
              className="px-6 h-12 border border-slate-100 text-slate-400 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all"
            >
              Archive
            </button>
            <button
              onClick={handleStart}
              className="flex-1 h-12 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl text-xs font-bold hover:bg-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4 fill-current" /> Start Discovery
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
