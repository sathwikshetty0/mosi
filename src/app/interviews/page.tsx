'use client'

import { InterviewCard } from '@/components/ui/interview-card'
import { useMosiStore } from '@/lib/store'
import { Plus, Search, Filter, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { cn } from '@/lib/utils'

export default function InterviewsPage() {
  const { sessions, fetchSessions } = useMosiStore()

  React.useEffect(() => {
    fetchSessions()
  }, [fetchSessions])
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
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto px-6 pt-10">
      
      {/* 🚀 PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest leading-none mb-1">
             <Link href="/" className="hover:text-slate-700 transition-colors flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
             </Link>
             <span className="opacity-30">/</span>
             <span className="text-slate-800">Archive</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-800">Interview History</h2>
          <p className="text-sm text-slate-500 font-medium">Browse and manage your captured discovery sessions.</p>
        </div>
        <Link href="/setup">
          <button id="new-interview-btn" className="h-12 px-8 bg-slate-100 text-slate-800 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 shadow-sm">
            <Plus className="w-5 h-5" />
            Start New Session
          </button>
        </Link>
      </div>

      {/* 🔍 SEARCH & FILTER WORKSPACE */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search for a name or company..."
            className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-slate-300 focus:shadow-md outline-none transition-all text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
             <SlidersHorizontal className="w-4 h-4 shrink-0" />
             <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">Filters</span>
          </div>
          {['All', 'Review', 'Published'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                 "whitespace-nowrap h-12 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border shadow-sm",
                 statusFilter === status 
                   ? 'bg-slate-50 text-slate-800 border-slate-200' 
                   : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-600'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 GRID RESULTS */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
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
        <div className="bg-white rounded-[3rem] border border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100">
            <Search className="w-8 h-8 text-slate-200" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-700">No sessions found</h3>
            <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Try adjusting your filters or search keywords.</p>
          </div>
          <button 
           onClick={() => { setSearch(''); setStatusFilter('All') }}
           className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-500 hover:underline transition-all"
          >
             Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
