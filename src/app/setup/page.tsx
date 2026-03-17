'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useMosiStore } from '@/lib/store'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SetupPage() {
  const router = useRouter()
  const { setCurrentSession } = useMosiStore()

  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({
    name: '', role: '', company: '', sector: '', 
    audio: true, video: false, transcript: true
  })

  const update = (key: string, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleStart = () => {
    setCurrentSession({
      stakeholder: {
        name: form.name || 'Anonymous', 
        role: form.role, 
        phone: '', email: '', linkedin: '',
        company: form.company, 
        sector: form.sector, 
        products: '', employees: '', revenue: '',
        yearsInBusiness: '', geography: ''
      },
      settings: {
        audio: form.audio, video: true
      },
      opportunities: [],
      location: '',
      status: 'Recording'
    })
    router.push('/interview/live')
  }

  const inputClass = "w-full h-14 bg-transparent border-b border-white/10 focus:border-[#20D08A] outline-none transition-all text-xl font-medium placeholder:text-[#E0E2E0]/20 text-[#E0E2E0]"

  return (
    <div className="flex flex-col h-full p-6 lg:p-12 space-y-12 animate-in fade-in duration-700">
      
      <header className="pt-8">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.push('/')} className="text-[#E0E2E0]/50 hover:text-[#E0E2E0] transition-colors">
            <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center space-y-8 max-w-lg mx-auto w-full pb-20">
        
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
             <h2 className="text-3xl font-medium text-[#E0E2E0]">Who are you talking to?</h2>
             <div className="space-y-6">
                <input className={inputClass} placeholder="Stakeholder Name" value={form.name} onChange={e => update('name', e.target.value)} autoFocus />
                <input className={inputClass} placeholder="Role / Title" value={form.role} onChange={e => update('role', e.target.value)} />
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
             <h2 className="text-3xl font-medium text-[#E0E2E0]">What is their enterprise?</h2>
             <div className="space-y-6">
                <input className={inputClass} placeholder="Company Name" value={form.company} onChange={e => update('company', e.target.value)} autoFocus />
                <input className={inputClass} placeholder="Sector / Industry" value={form.sector} onChange={e => update('sector', e.target.value)} />
             </div>
          </div>
        )}

      </div>

      <div className="pb-12 max-w-lg mx-auto w-full">
         <div className="flex justify-between items-center gap-4">
             <div className="flex gap-2">
                 {[1, 2].map(s => (
                     <div key={s} className={cn("w-2 h-2 rounded-full", step === s ? "bg-[#20D08A]" : "bg-white/10")} />
                 ))}
             </div>
             {step < 2 ? (
                 <button onClick={() => setStep(step + 1)} className="w-14 h-14 bg-[#E0E2E0]/10 text-white rounded-full flex items-center justify-center hover:bg-[#E0E2E0]/20 transition-all">
                    <ArrowRight className="w-5 h-5" />
                 </button>
             ) : (
                 <button onClick={handleStart} className="px-6 h-14 bg-[#20D08A] text-[#161816] font-medium rounded-full flex items-center gap-3 hover:scale-105 transition-all">
                    Start Session <ArrowRight className="w-5 h-5" />
                 </button>
             )}
         </div>
      </div>
    </div>
  )
}
