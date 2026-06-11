'use client'

import { Calendar as CalendarIcon, Clock, ArrowRight, MapPin, ChevronLeft, ChevronRight, Plus, BarChart3 } from 'lucide-react'
import * as React from 'react'
import { useMosiStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function SchedulePage() {
  const [view, setView] = React.useState<'upcoming' | 'completed'>('upcoming')
  const { sessions, fetchSessions } = useMosiStore()
  
  React.useEffect(() => { fetchSessions() }, [fetchSessions])

  // Dynamic calendar state
  const [calMonth, setCalMonth] = React.useState(new Date().getMonth())
  const [calYear, setCalYear] = React.useState(new Date().getFullYear())

  const today = new Date()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay()

  // Map session dates to day numbers for the current calendar month
  const sessionDays = React.useMemo(() => {
    const days = new Set<number>()
    sessions.forEach(s => {
      if (!s.date) return
      // Parse date like "Jun 11, 2026"
      const d = new Date(s.date)
      if (!isNaN(d.getTime()) && d.getMonth() === calMonth && d.getFullYear() === calYear) {
        days.add(d.getDate())
      }
    })
    return days
  }, [sessions, calMonth, calYear])

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const scheduled = sessions.filter(s => s.status === 'Scheduled')
  const completed = sessions.filter(s => s.status === 'Published' || s.status === 'Review')
  const list = view === 'upcoming' ? scheduled : completed

  return (
    <div className="space-y-6 sm:space-y-10 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 sm:pt-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-800">Chronology</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Your interview schedule and history.</p>
        </div>
        <Link href="/setup">
          <button className="h-10 px-5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 shadow-md">
            <Plus className="w-3.5 h-3.5" /> Schedule New
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">{MONTHS[calMonth]} {calYear}</h3>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400 transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[9px] font-bold text-slate-400 uppercase py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
                const hasSession = sessionDays.has(day)
                return (
                  <div
                    key={day}
                    className={cn(
                      "aspect-square flex items-center justify-center text-xs font-bold rounded-lg relative transition-all",
                      isToday ? "bg-slate-800 text-white" : hasSession ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {day}
                    {hasSession && !isToday && (
                      <div className="absolute bottom-0.5 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-slate-800 text-white rounded-2xl p-4 sm:p-5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Summary</p>
            <p className="text-sm font-medium text-slate-300">
              {scheduled.length > 0 
                ? `${scheduled.length} upcoming session${scheduled.length > 1 ? 's' : ''}`
                : 'No sessions scheduled'}
            </p>
            <p className="text-xs text-slate-500 mt-1">{completed.length} completed this period</p>
          </div>
        </div>

        {/* Session feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setView('upcoming')} 
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", view === 'upcoming' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}
            >
              Upcoming ({scheduled.length})
            </button>
            <button 
              onClick={() => setView('completed')} 
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", view === 'completed' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}
            >
              Completed ({completed.length})
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {list.length > 0 ? list.slice(0, 20).map(session => (
              <Link key={session.id} href={session.status === 'Scheduled' ? `/setup` : `/review?id=${session.id}`}>
                <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-slate-200 hover:shadow-sm transition-all active:scale-[0.99] group">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{session.stakeholder?.name || 'Untitled'}</p>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                      <span>{session.date}</span>
                      {session.stakeholder?.company && <span>· {session.stakeholder.company}</span>}
                      {session.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{session.location}</span>}
                    </p>
                  </div>
                  <div className={cn(
                    "text-[9px] font-bold uppercase px-2 py-0.5 rounded border",
                    session.status === 'Scheduled' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                    session.status === 'Published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    "bg-amber-50 text-amber-600 border-amber-100"
                  )}>
                    {session.status}
                  </div>
                </div>
              </Link>
            )) : (
              <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-3">
                <BarChart3 className="w-8 h-8 text-slate-200 mx-auto" />
                <p className="text-sm font-bold text-slate-500">No {view} sessions</p>
                <p className="text-xs text-slate-400">{view === 'upcoming' ? 'Schedule one from the setup page.' : 'Complete some interviews first.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
