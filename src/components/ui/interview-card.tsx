'use client'

// Card component components are not used here, removing broken import

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    label: 'Temporal Hold'
  },
  Recording: { 
    color: 'bg-rose-500 text-white border-rose-500 animate-pulse-soft shadow-lg shadow-rose-200',
    icon: Activity,
    label: 'Discovery Live'
  },
  Review: { 
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: Edit3IconFix,
    label: 'Synthesis Pending'
  },
  Published: { 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: ExternalLink,
    label: 'Executive Ready'
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
    <Link href={status === 'Review' ? '/review' : status === 'Published' ? '/preview' : `/interview/${id}`}>
      <div className="group relative bg-white rounded-[2.5rem] border-2 border-slate-50 p-8 transition-all duration-500 hover:shadow-3xl hover:shadow-slate-200/50 hover:border-slate-900 overflow-hidden h-full flex flex-col">
        {/* Decorative Element */}
        <div className={cn(
          "absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 rounded-full opacity-[0.03] transition-all duration-700 group-hover:opacity-[0.1] group-hover:scale-110",
          status === 'Published' ? "bg-emerald-500 text-emerald-600" : status === 'Review' ? "bg-amber-500" : "bg-blue-500"
        )} />

        <div className="relative z-10 flex flex-col h-full space-y-8">
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-2xl border-2 text-[10px] font-black uppercase tracking-[0.2em]",
              config.color
            )}>
              <StatusIcon className="w-3.5 h-3.5" />
              {config.label}
            </div>
            {opportunityCount > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100/50">
                 <Zap className="w-3 h-3 text-blue-600 fill-current" />
                 <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{opportunityCount} Insights</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Stakeholder</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors uppercase">
                  {stakeholder}
                </h3>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Enterprise</p>
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-200" />
                      {company}
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Sector</p>
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">
                      <Briefcase className="w-3.5 h-3.5 text-slate-200" />
                      {sector}
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-8 border-t border-slate-50 mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <Calendar className="w-4 h-4" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-50 text-slate-300 flex items-center justify-center transition-all group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 group-hover:rotate-[-45deg] shadow-xl shadow-slate-100">
               <ChevronRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
