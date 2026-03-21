'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useMosiStore } from '@/lib/store'
import { 
  User, Building2, Globe, Mic, Video, Type,
  Calendar, MapPin, ChevronRight, CheckCircle,
  Sparkles, Activity
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

  const inputClass = "w-full h-12 px-4 rounded-xl bg-white border border-slate-200 focus:border-slate-900 outline-none transition-all text-sm font-medium placeholder:text-slate-300"
  const labelClass = "block text-xs font-medium text-slate-500 mb-2"

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
          New Discovery Session
        </h1>
        <p className="text-sm text-slate-500">Set up your stakeholder profile before starting the interview.</p>
      </div>

      {/* STEP TABS */}
      <div className="flex items-center bg-white p-1 rounded-xl border border-slate-100">
        {[
          { n: 1, label: 'Stakeholder' },
          { n: 2, label: 'Company' },
          { n: 3, label: 'Settings' }
        ].map(s => (
          <button
            key={s.n}
            onClick={() => setStep(s.n)}
            className={cn(
              "flex-1 py-3 rounded-lg text-sm font-medium transition-all",
              step === s.n ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Stakeholder Info</h3>
              <p className="text-xs text-slate-400">Who are you interviewing?</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={labelClass}>Full Name</label><input className={inputClass} placeholder="e.g. Jane Doe" value={form.name} onChange={e => update('name', e.target.value)} /></div>
            <div><label className={labelClass}>Role</label><input className={inputClass} placeholder="e.g. Product Manager" value={form.role} onChange={e => update('role', e.target.value)} /></div>
            <div><label className={labelClass}>Phone</label><input className={inputClass} placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div><label className={labelClass}>Email</label><input className={inputClass} type="email" placeholder="jane@company.com" value={form.email} onChange={e => update('email', e.target.value)} /></div>
            <div><label className={labelClass}>Domain</label><input className={inputClass} placeholder="e.g. Sales, Tech" value={form.domain} onChange={e => update('domain', e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelClass}>LinkedIn</label><input className={inputClass} placeholder="linkedin.com/in/janedoe" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} /></div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Company Details</h3>
              <p className="text-xs text-slate-400">Context about their organization.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={labelClass}>Company Name</label><input className={inputClass} placeholder="Acme Corp" value={form.company} onChange={e => update('company', e.target.value)} /></div>
            <div><label className={labelClass}>Sector</label><input className={inputClass} placeholder="Tech & SaaS" value={form.sector} onChange={e => update('sector', e.target.value)} /></div>
            <div><label className={labelClass}>Team Size</label><input className={inputClass} placeholder="50-200" value={form.employees} onChange={e => update('employees', e.target.value)} /></div>
            <div><label className={labelClass}>Revenue</label><input className={inputClass} placeholder="$5M ARR" value={form.revenue} onChange={e => update('revenue', e.target.value)} /></div>
            <div><label className={labelClass}>Years in Business</label><input className={inputClass} placeholder="5" value={form.yearsInBusiness} onChange={e => update('yearsInBusiness', e.target.value)} /></div>
            <div><label className={labelClass}>Geography</label><input className={inputClass} placeholder="North America" value={form.geography} onChange={e => update('geography', e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Address</label><input className={inputClass} placeholder="123 Main St" value={form.address} onChange={e => update('address', e.target.value)} /></div>
            <div><label className={labelClass}>Pincode</label><input className={inputClass} placeholder="10001" value={form.pincode} onChange={e => update('pincode', e.target.value)} /></div>
            <div className="md:col-span-2">
              <label className={labelClass}>Products / Services</label>
              <textarea rows={3} className={cn(inputClass, "h-auto py-3 resize-none")} placeholder="Brief description of what they offer..." value={form.products} onChange={e => update('products', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Recording Settings</h3>
                <p className="text-xs text-slate-400">Configure capture preferences.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'audio', label: 'Audio', icon: Mic },
                { key: 'video', label: 'Video', icon: Video },
                { key: 'transcript', label: 'Transcript', icon: Sparkles },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => update(opt.key, !(form as any)[opt.key])}
                  className={cn(
                    "p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                    (form as any)[opt.key] ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                  )}
                >
                  <opt.icon className="w-6 h-6" />
                  <span className="text-xs font-semibold">{opt.label}</span>
                  {(form as any)[opt.key] && <CheckCircle className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Meeting Details</h3>
                <p className="text-xs text-slate-400">Optional scheduling info.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={labelClass}>Date</label><input type="date" className={inputClass} value={form.scheduleDate} onChange={e => update('scheduleDate', e.target.value)} /></div>
              <div><label className={labelClass}>Time</label><input type="time" className={inputClass} value={form.scheduleTime} onChange={e => update('scheduleTime', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Location / Link</label><input className={inputClass} placeholder="Zoom link or office address" value={form.location} onChange={e => update('location', e.target.value)} /></div>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="flex items-center gap-4 pt-4">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="h-12 px-6 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all">
            Back
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="flex-1 h-12 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex-1 flex gap-3">
            <button
              onClick={() => { scheduleSession(); router.push('/') }}
              className="flex-1 h-12 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:border-slate-300 transition-all"
            >
              Schedule for Later
            </button>
            <button
              onClick={handleStart}
              className="flex-1 h-12 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" /> Start Interview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
