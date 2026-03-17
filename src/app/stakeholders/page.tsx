'use client'

import { useMosiStore } from '@/lib/store'
import { Plus, Search, Mail, Phone, ExternalLink, Building2, Users, Globe, Briefcase, ChevronRight, BarChart2 } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

export default function StakeholdersPage() {
  const { sessions } = useMosiStore()
  
  // Extract unique stakeholders
  const stakeholdersMap = new Map()
  sessions.forEach(s => {
    if (!stakeholdersMap.has(s.stakeholder.name)) {
      stakeholdersMap.set(s.stakeholder.name, {
        ...s.stakeholder,
        interviewCount: 1,
        lastInterview: s.date
      })
    } else {
      const existing = stakeholdersMap.get(s.stakeholder.name)
      existing.interviewCount += 1
    }
  })

  const stakeholders = Array.from(stakeholdersMap.values())
  const [search, setSearch] = React.useState('')

  const filteredStakeholders = stakeholders.filter(sh => 
    sh.name.toLowerCase().includes(search.toLowerCase()) || 
    sh.company.toLowerCase().includes(search.toLowerCase()) ||
    sh.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
            <Users className="w-3.5 h-3.5" /> Human Infrastructure
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9]">
            Stakeholder <br/><span className="text-emerald-600">Directory</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Managing the collective intelligence of engaged experts.</p>
        </div>
        <button id="add-stakeholder-btn" className="px-8 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Provision New Expert
        </button>
      </div>

      {/* 🔍 SEARCH WORKSPACE */}
      <div className="relative group mx-2">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
        <input
          type="text"
          placeholder="Search by identity, organization, or industrial sector..."
          className="w-full h-16 pl-16 pr-6 rounded-[2rem] border-2 border-slate-100 bg-white focus:border-slate-900 shadow-xl shadow-slate-200/50 outline-none transition-all text-sm font-black uppercase tracking-tight placeholder:text-slate-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStakeholders.length > 0 ? (
          filteredStakeholders.map((sh, i) => (
            <div key={i} className="premium-card p-8 lg:p-10 flex flex-col bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/40 hover:border-slate-900 transition-all group rounded-[2.5rem]">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl transition-all group-hover:scale-110 group-hover:bg-emerald-600">
                    {sh.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{sh.name}</h4>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{sh.role}</p>
                  </div>
                </div>
                {sh.linkedin && (
                  <a href={sh.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 rounded-xl transition-all text-slate-400 hover:text-blue-600">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="space-y-4 mb-10 flex-1">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <Building2 className="w-4 h-4 text-slate-300" />
                     {sh.company} · {sh.sector}
                   </div>
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <Mail className="w-4 h-4 text-slate-300" />
                     {sh.email || 'NO_EMAIL_ARTIFACT'}
                   </div>
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <Phone className="w-4 h-4 text-slate-300" />
                     {sh.phone || 'NO_PHONE_LINK'}
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <div className="space-y-1">
                   <p className="text-slate-300">Archives</p>
                   <p className="text-slate-900 text-sm font-black">{sh.interviewCount}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-slate-300">Last Session</p>
                   <p className="text-slate-900 font-black">{sh.lastInterview}</p>
                </div>
              </div>
              
              <button className="mt-8 w-full h-12 bg-white border border-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
                 View Expert profile <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-2xl">
              <Users className="w-10 h-10 text-slate-200" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Directory Empty</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto leading-loose">
                 Your stakeholder infrastructure is currently unpopulated. Initiate active sessions to capture and provision expert profiles.
               </p>
            </div>
            <a href="/setup" className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs hover:underline underline-offset-8 transition-all">
               Provision First Stakeholder →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
