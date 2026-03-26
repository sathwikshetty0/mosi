'use client'

import { 
  Building2, 
  Calendar, 
  ArrowRight,
  Clock,
  Briefcase,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Play,
  Zap,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface InterviewCardProps {
  id: string
  stakeholder: string
  company: string
  sector: string
  date: string
  status: 'Scheduled' | 'Recording' | 'Review' | 'Published'
  opportunityCount?: number
}

const statusConfig = {
  Scheduled: { 
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    icon: Calendar,
    label: 'Scheduled'
  },
  Recording: { 
    color: 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm animate-pulse-soft',
    icon: Activity,
    label: 'Live Now'
  },
  Review: { 
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: Edit3IconFix,
    label: 'In Review'
  },
  Published: { 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: ExternalLink,
    label: 'Published'
  }
}

function Edit3IconFix(props: any) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

export function InterviewCard({ 
  id, 
  stakeholder, 
  company, 
  sector, 
  date, 
  status,
  opportunityCount = 0 
}: InterviewCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Link href={status === 'Review' ? `/review?id=${id}` : status === 'Published' ? `/preview?id=${id}` : `/interview/${id}`}>
      <div className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 overflow-hidden h-full flex flex-col">
        
        <div className="relative z-10 flex flex-col h-full space-y-8">
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest",
              config.color
            )}>
              <StatusIcon className="w-3.5 h-3.5" />
              {config.label}
            </div>
            {opportunityCount > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                 <Zap className="w-3 h-3 text-blue-500 fill-current" />
                 <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">{opportunityCount} Insights</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stakeholder</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                  {stakeholder}
                </h3>
             </div>
             
             <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Company</p>
                   <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 truncate">
                      <Building2 className="w-4 h-4 text-slate-200" />
                      {company}
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Sector</p>
                   <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 truncate">
                      <Briefcase className="w-4 h-4 text-slate-200" />
                      {sector}
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
               <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Calendar className="w-4.5 h-4.5" />
               </div>
               <span className="text-xs font-bold text-slate-400">{date}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 shadow-sm">
               <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
