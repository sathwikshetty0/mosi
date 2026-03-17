'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
  }
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <div className="premium-card p-8 bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/50 hover:border-slate-900 group transition-all duration-500 rounded-[2.5rem]">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <div className="space-y-1">
             <h3 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">{value}</h3>
             {description && (
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{description}</p>
             )}
          </div>
        </div>
        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 border-2 border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-500 shadow-xl shadow-slate-100">
          <Icon className="w-8 h-8" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4">
          <div className={cn(
            "text-[10px] font-black px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-lg shadow-slate-100",
            trend.value >= 0 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
              : "bg-rose-50 text-rose-600 border-rose-100"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", trend.value >= 0 ? "bg-emerald-500" : "bg-rose-500")} />
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </div>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
