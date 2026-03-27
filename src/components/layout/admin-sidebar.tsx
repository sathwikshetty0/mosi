'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
  LayoutDashboard, Users, Database,
  LogOut, ShieldCheck, Video, BarChart3,
  Menu, X, Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, query: null },
  { label: 'All Sessions', href: '/admin?tab=sessions', icon: Video, query: 'sessions' },
  { label: 'Stakeholders', href: '/admin?tab=stakeholders', icon: Globe, query: 'stakeholders' },
  { label: 'Researchers', href: '/admin?tab=users', icon: Users, query: 'users' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { profile, signOut } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  if (pathname === '/login') return null
  if (!pathname.startsWith('/admin')) return null

  const initial = profile?.full_name?.[0]?.toUpperCase() || 'A'
  const currentTab = searchParams.get('tab')

  const isNavActive = (item: typeof adminNav[0]) => {
    if (item.query === null) return pathname === '/admin' && !currentTab
    return currentTab === item.query
  }

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-5 sm:px-6 py-5 sm:py-7 border-b border-white/5">
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
        <div className="flex items-center gap-3 p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-sm font-black shadow-lg shrink-0">
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
          const active = isNavActive(item)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-3.5 sm:py-3 rounded-xl text-sm font-semibold transition-all group',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0 transition-all', active ? 'text-blue-400' : 'group-hover:scale-110')} />
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.3em] px-3 pb-2">Data</p>
          <Link 
            href="/admin?tab=sessions" 
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3.5 sm:py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all group"
          >
            <Database className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            Repository
          </Link>
          <Link 
            href="/admin?tab=users" 
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3.5 sm:py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all group"
          >
            <BarChart3 className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            Analytics
          </Link>
        </div>

        {/* Back to main app link */}
        <div className="pt-4">
          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.3em] px-3 pb-2">Navigation</p>
          <Link 
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3.5 sm:py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all group"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-white/5 pt-4 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
            {initial}
          </div>
          <span className="text-xs font-semibold text-white/50 truncate">{profile?.full_name || 'Admin'}</span>
        </div>
        <button
          onClick={async () => { await signOut(); setIsMobileOpen(false) }}
          className="w-full flex items-center gap-3 px-3 py-3.5 sm:py-3 rounded-xl text-sm font-bold text-white/70 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all group"
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* 📱 MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white z-30 w-full shrink-0 safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight">MOSI</h1>
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-[0.15em]">Admin</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white active:scale-90 transition-all"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 🌫 MOBILE BACKDROP */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* 📱 MOBILE SLIDE-OUT SIDEBAR */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-[280px] bg-slate-900 text-white z-50 flex flex-col lg:hidden transition-transform duration-300 ease-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {navContent}
      </div>

      {/* 🖥 DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full bg-slate-900 text-white">
        {navContent}
      </aside>
    </>
  )
}
