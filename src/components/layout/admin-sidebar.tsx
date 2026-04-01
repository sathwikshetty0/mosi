'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { 
  LayoutDashboard, Users, Database,
  LogOut, ShieldCheck, Video, BarChart3,
  Menu, X, Globe, Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, query: null },
  { label: 'All Sessions', href: '/admin?tab=sessions', icon: Video, query: 'sessions' },
  { label: 'All Stakeholders', href: '/admin?tab=stakeholders', icon: Globe, query: 'stakeholders' },
  { label: 'Accounts', href: '/admin?tab=companies', icon: Briefcase, query: 'companies' },
  { label: 'Users', href: '/admin?tab=users', icon: Users, query: 'users' },
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
      <div className="px-5 sm:px-6 py-5 sm:py-7 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-800">MOSI</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-sm font-black shadow-sm text-white shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-slate-800">{profile?.full_name || 'Admin'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Platform Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-3 pb-2">Platform</p>
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
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0 transition-all', active ? 'text-blue-600' : 'text-slate-400 group-hover:scale-110')} />
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
            </Link>
          )
        })}

        {/* Navigation removed for minimal UI */}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-slate-100 pt-4 space-y-3">
        <button
          onClick={async () => { await signOut(); setIsMobileOpen(false) }}
          className="w-full flex items-center gap-3 px-3 py-3.5 sm:py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-all group"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-500 group-hover:scale-110 transition-all" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* 📱 MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 z-30 w-full shrink-0 safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-800">MOSI</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.15em]">Admin</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 active:scale-90 transition-all"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 🌫 MOBILE BACKDROP */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* 📱 MOBILE SLIDE-OUT SIDEBAR */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-[280px] bg-white border-r border-slate-100 z-50 flex flex-col lg:hidden transition-transform duration-300 ease-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {navContent}
      </div>

      {/* 🖥 DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full bg-white border-r border-slate-100">
        {navContent}
      </aside>
    </>
  )
}
