'use client'

import { InterviewCard } from '@/components/ui/interview-card'
import { useMosiStore } from '@/lib/store'
import { Plus, Search, Filter, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { cn } from '@/lib/utils'

export default function InterviewsPage() {
  const { sessions } = useMosiStore()
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('All')

  const filteredSessions = sessions.filter(s => {
    const stakeholderName = s.stakeholder?.name || 'Untitled Participant'
    const stakeholderCompany = s.stakeholder?.company || 'N/A'
    const matchesSearch = stakeholderName.toLowerCase().includes(search.toLowerCase()) || 
                         stakeholderCompany.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* 🚀 PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
             <Link href="/" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Dashboard
             </Link>
             <span>/</span>
             <span className="text-slate-900">Repository</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Interview Log</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Managing {sessions.length} discovered stakeholder archives</p>
        </div>
        <Link href="/setup">
          <button id="new-interview-btn" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Interview Archive
          </button>
        </Link>
      </div>

      {/* 🔍 SEARCH & FILTER WORKSPACE */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by stakeholder or corporation..."
            className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-transparent bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all text-sm font-bold uppercase tracking-tight"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
             <SlidersHorizontal className="w-4 h-4 shrink-0" />
             <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Filters</span>
          </div>
          {['All', 'Scheduled', 'Review', 'Published'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                 "whitespace-nowrap h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                 statusFilter === status 
                   ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                   : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 GRID RESULTS */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSessions.map((session) => (
            <InterviewCard
              key={session.id}
              id={session.id}
              stakeholder={session.stakeholder?.name || 'Untitled Participant'}
              company={session.stakeholder?.company || 'N/A'}
              sector={session.stakeholder?.sector || 'N/A'}
              date={session.date}
              status={session.status}
              opportunityCount={session.opportunities.length}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 py-32 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100">
            <Search className="w-10 h-10 text-slate-200" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Zero Archives Discovered</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px] leading-loose mx-auto">
              Try adjusting your synthetic search or filters to locate session records.
            </p>
          </div>
          <button 
           onClick={() => { setSearch(''); setStatusFilter('All') }}
           className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 underline underline-offset-4"
          >
             Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
