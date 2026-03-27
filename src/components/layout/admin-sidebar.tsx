'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Database,
  LogOut, ShieldCheck, Video, BarChart3,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'All Sessions', href: '/admin?tab=sessions', icon: Video, query: 'sessions' },
  { label: 'Researchers', href: '/admin?tab=users', icon: Users, query: 'users' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const [userExpanded, setUserExpanded] = useState(true)

  if (pathname === '/login') return null
  if (!pathname.startsWith('/admin')) return null

  const initial = profile?.full_name?.[0]?.toUpperCase() || 'A'

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight">MOSI</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-sm font-black shadow-lg">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{profile?.full_name || 'Admin'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Platform Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.3em] px-3 pb-2">Platform</p>
        {adminNav.map(item => {
          const isActive = pathname === item.href || (pathname === '/admin' && !item.query)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all group',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0 transition-all', isActive ? 'text-blue-400' : 'group-hover:scale-110')} />
              {item.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.3em] px-3 pb-2">Data</p>
          <Link href="/admin?tab=sessions" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all group">
            <Database className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            Repository
          </Link>
          <Link href="/admin?tab=users" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all group">
            <BarChart3 className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            Analytics
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-white/5 pt-4 space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-black">
            {initial}
          </div>
          <span className="text-xs font-semibold text-white/50 truncate">{profile?.full_name || 'Admin'}</span>
        </div>
        <button
          onClick={async () => { await signOut() }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-white/70 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all group"
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
