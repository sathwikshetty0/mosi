'use client'

import { Calendar as CalendarIcon, Clock, Users, ArrowRight, Video, MapPin, ChevronLeft, ChevronRight, Plus, Sparkles, CheckCircle, BarChart3 } from 'lucide-react'
import * as React from 'react'
import { useMosiStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function SchedulePage() {
  const [view, setView] = React.useState('upcoming')
  
  const { sessions } = useMosiStore()
  
  const scheduled = sessions.filter(s => s.status === 'Scheduled')
  const past = sessions.filter(s => s.status !== 'Recording' && s.status !== 'Scheduled')
  
  const list = view === 'upcoming' ? scheduled : past

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full w-fit">
            <Clock className="w-3.5 h-3.5" /> Temporal Management
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9]">
            Session <br/><span className="text-indigo-600">Chronology</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global scheduling and meeting orchestration hub.</p>
        </div>
        <a href="/setup">
          <button id="book-meeting-btn" className="px-8 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Schedule New Archive
          </button>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 📅 CALENDAR PERSPECTIVE */}
        <div className="lg:col-span-4 space-y-8">
          <div className="premium-card p-8 bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
               <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">March 2026</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Standardized Time (UTC)</p>
               </div>
               <div className="flex gap-2">
                 <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 border border-slate-100 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                 <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 border border-slate-100 transition-all"><ChevronRight className="w-4 h-4" /></button>
               </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1
                const isToday = day === new Date().getDate()
                const hasMeeting = scheduled.length > 0 && day === 16
                return (
                  <div
                    key={day}
                    className={cn(
                       "aspect-square flex flex-col items-center justify-center text-xs font-black rounded-2xl cursor-pointer transition-all relative border-2 border-transparent",
                       isToday ? "bg-slate-900 text-white shadow-xl shadow-slate-300 border-slate-900" : "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 text-slate-500"
                    )}
                  >
                    {day}
                    {hasMeeting && !isToday && (
                      <div className="absolute bottom-2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="premium-card p-8 bg-slate-900 text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <CalendarIcon className="w-32 h-32 -mr-16 -mt-16" />
            </div>
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Daily Trajectory</h4>
               </div>
               <p className="text-sm font-bold leading-relaxed uppercase tracking-tight text-slate-300">
                {scheduled.length > 0 
                  ? `Active load: ${scheduled.length} session${scheduled.length > 1 ? 's' : ''} detected. Execute discovery logic following protocol.`
                  : "Zero sessions detected for current cycle. Use downtime for methodology refinement."}
               </p>
               <button className="flex items-center gap-3 text-[10px] font-black text-white hover:text-indigo-400 transition-all group uppercase tracking-widest border-b-2 border-white/10 pb-2">
                 Synchronize Feed
                 <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-2" />
               </button>
            </div>
          </div>
        </div>

        {/* 📋 CHRONOLOGICAL FEED */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
            <button 
              onClick={() => setView('upcoming')} 
              className={cn(
                 "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 view === 'upcoming' ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-slate-700"
              )}
            >
               Upcoming Logic
            </button>
            <button 
              onClick={() => setView('completed')} 
              className={cn(
                 "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 view === 'completed' ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-slate-700"
              )}
            >
               Execution History
            </button>
          </div>

          <div className="space-y-6">
            {list.length > 0 ? list.map((meeting, i) => (
              <div key={meeting.id} className="premium-card p-1 lg:p-1 flex flex-col md:flex-row items-stretch bg-white border-2 border-slate-100 shadow-xl hover:border-slate-900 transition-all group overflow-hidden h-fit md:h-32">
                 <div className="w-full md:w-32 bg-slate-50 flex flex-col items-center justify-center text-slate-900 border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{meeting.date.split(',')[0].split(' ')[0]}</span>
                    <span className="text-3xl font-black tracking-tighter">{meeting.date.split(',')[0].split(' ')[1]}</span>
                 </div>
                 <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-indigo-100">Synchronized</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{meeting.date.includes(',') ? meeting.date.split(',')[1] : 'TIME TBD'}</span>
                       </div>
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">Stakeholder: {meeting.stakeholder.name}</h4>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Building2IconFix className="w-3 h-3" />{meeting.stakeholder.company}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{meeting.location || 'ONLINE NODE'}</span>
                       </div>
                    </div>
                    
                    <a href="/interview/live" className="shrink-0">
                      <button className="h-full px-8 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 border border-slate-100 group-hover:border-slate-900">
                        {meeting.status === 'Scheduled' ? 'Initiate Session' : 'Access History'}
                      </button>
                    </a>
                 </div>
              </div>
            )) : (
              <div className="bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border border-slate-100 shadow-xl">
                  <BarChart3 className="w-10 h-10 text-slate-200" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Chronology Empty</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px] leading-loose">No {view} meeting threads were discovered in the local lattice.</p>
                </div>
              </div>
            )}

            <button className="w-full py-6 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center gap-4 text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] hover:border-indigo-400 hover:text-indigo-600 transition-all active:scale-98">
              <Plus className="w-5 h-5" />
              Manifest Deployment Proxy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Building2IconFix(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}
