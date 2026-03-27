'use client'

import { useEffect, useState } from 'react'
import { useMosiStore } from '@/lib/store'
import { StatsCard } from '@/components/ui/stats-card'
import { InterviewCard } from '@/components/ui/interview-card'
import { 
  Users, 
  Video, 
  BarChart3, 
  Search, 
  Filter,
  ShieldCheck,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'

export default function AdminDashboard() {
  const { sessions, fetchSessions } = useMosiStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const filteredSessions = sessions.filter(s => 
    s.stakeholder?.name.toLowerCase().includes(search.toLowerCase()) ||
    s.stakeholder?.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
              Admin Control
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Interview Intelligence Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-1">Platform-wide overview of all interviews and insights.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sessions..." 
                className="bg-white/5 border-white/10 h-10 pl-10 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all rounded-xl text-white"
              />
           </div>
           <button className="h-10 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors group">
              <Filter className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-white/60">Filter</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Interviews"
          value={sessions.length}
          icon={Video}
          trend={{ value: 12, label: 'vs last month' }}
        />
        <StatsCard 
          title="Stakeholders"
          value={new Set(sessions.map(s => s.stakeholder?.email)).size}
          icon={Users}
          trend={{ value: 5, label: 'vs last month' }}
        />
        <StatsCard 
          title="Avg. Duration"
          value="24m"
          icon={Clock}
          trend={{ value: -2, label: 'vs last month' }}
        />
        <StatsCard 
          title="Platform Score"
          value="8.4"
          icon={BarChart3}
          trend={{ value: 0.4, label: 'growth' }}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
             All Platform Interviews
             <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/60">
                {filteredSessions.length}
             </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <InterviewCard 
                id={session.id}
                stakeholder={session.stakeholder?.name || 'Anonymous'}
                company={session.stakeholder?.company || 'N/A'}
                sector={session.stakeholder?.sector || 'N/A'}
                date={session.date}
                status={session.status}
                opportunityCount={session.opportunities?.length || 0}
              />
            </motion.div>
          ))}
          
          {filteredSessions.length === 0 && (
             <div className="col-span-full py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                   <Video className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-lg font-medium text-white/60 mb-1">No Interviews Found</h3>
                <p className="text-white/30 text-sm max-w-xs">There are no interviews matching your current criteria.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
