'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Calendar, Settings,
  FileText, CheckSquare, Mic,
  Eye, BarChart2, ChevronLeft, ChevronRight, Menu, X, PlusCircle, Sparkles,
  ShieldCheck, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMosiStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Repository', href: '/interviews', icon: FileText },
  { name: 'Chronology', href: '/schedule', icon: Calendar },
]

const interviewFlow = [
  { name: 'New Stakeholder', href: '/setup', icon: CheckSquare },
  { name: 'Live Discovery', href: '/interview/live', icon: Mic },
  { name: 'Synthesis', href: '/review', icon: BarChart2 },
  { name: 'Executive', href: '/preview', icon: Eye },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sessions, isSidebarCollapsed, toggleSidebar } = useMosiStore()
  const { profile, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // 🛡️ AUTH: Hide sidebar on login page and all admin routes
  if (pathname === '/login' || pathname.startsWith('/admin')) return null
  
  const pendingReviews = sessions.filter(s => s.status === 'Review').length
  const isAdmin = profile?.role === 'admin'

  const renderNavItems = (items: typeof navigation, label: string) => (
    <div className="space-y-4">
      {!isSidebarCollapsed && (
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 mb-2">{label}</p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'nav-item group relative',
                isActive ? 'nav-item-active' : 'nav-item-inactive',
                isSidebarCollapsed && 'justify-center px-0'
              )}
              title={isSidebarCollapsed ? item.name : ''}
            >
              <item.icon className={cn('h-4 w-4 shrink-0 transition-transform duration-300', !isActive && 'group-hover:scale-110 group-hover:text-slate-700')} />
              {!isSidebarCollapsed && <span className="uppercase tracking-tighter">{item.name}</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* 📱 MOBILE TOP NAV */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b-2 border-slate-50 z-30 w-full shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-xl shadow-slate-200">M</div>
           <h1 className="text-xl font-black text-slate-700 tracking-tighter uppercase">MOSI</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-700 active:scale-90 transition-all"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 🌫 BACKDROP */}
      <div className={cn(
        "fixed inset-0 bg-slate-700/60 backdrop-blur-md z-40 lg:hidden transition-all duration-500 ease-in-out",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileMenuOpen(false)} />

      {/* 🏰 SIDEBAR ARCHITECTURE */}
      <div className={cn(
        "fixed lg:sticky top-0 left-0 bottom-0 z-50 h-full lg:h-screen transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-r-2 border-slate-50 bg-white flex flex-col",
        isSidebarCollapsed ? "w-24" : "w-72",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* LOGO AREA */}
        <div className={cn("p-8 flex items-center justify-between", isSidebarCollapsed && "justify-center px-4")}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-2xl shadow-slate-300">M</div>
              <div className="leading-none space-y-1">
                <h1 className="text-2xl font-black text-slate-700 tracking-tighter uppercase">MOSI</h1>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] flex items-center gap-1.5"><Sparkles className="w-2.5 h-2.5" /> Intelligence</p>
              </div>
            </div>
          )}
          {isSidebarCollapsed && (
             <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-2xl shadow-slate-300">M</div>
          )}
        </div>

        {/* 🎚 COLLAPSE TOGGLE */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-4 top-24 w-8 h-8 bg-white border-2 border-slate-50 rounded-full items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-700 hover:shadow-xl transition-all z-50 group active:scale-90"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* 🗺 NAVIGATION WORKSPACE */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-12 no-scrollbar">
          {renderNavItems(navigation, "Core Matrix")}
          
          {isAdmin && (
            <div className="space-y-4">
               {!isSidebarCollapsed && (
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 mb-2">Admin Panel</p>
              )}
              <div className="space-y-1">
                 <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'nav-item group relative',
                      pathname === '/admin' ? 'nav-item-active' : 'nav-item-inactive',
                      isSidebarCollapsed && 'justify-center px-0'
                    )}
                  >
                    <ShieldCheck className={cn('h-4 w-4 shrink-0 transition-transform duration-300', pathname !== '/admin' && 'group-hover:scale-110')} />
                    {!isSidebarCollapsed && <span className="uppercase tracking-tighter">Command Center</span>}
                    {pathname === '/admin' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50" />
                    )}
                 </Link>
              </div>
            </div>
          )}

          {/* Hide Discovery Hub for admins on the admin page */}
          {!isAdmin && (
            <div className="space-y-4">
              {!isSidebarCollapsed && (
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 mb-2">Discovery Hub</p>
              )}
              <div className="space-y-1">
                {interviewFlow.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  const hasBadge = item.href === '/review' && pendingReviews > 0
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'nav-item group relative',
                        isActive ? 'nav-item-active' : 'nav-item-inactive',
                        isSidebarCollapsed && 'justify-center px-0'
                      )}
                      title={isSidebarCollapsed ? item.name : ''}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className={cn('h-4 w-4 shrink-0 transition-transform duration-300', !isActive && 'group-hover:scale-110')} />
                        {!isSidebarCollapsed && <span className="uppercase tracking-tighter">{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && hasBadge && (
                        <span className="bg-rose-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-200 animate-pulse">
                          {pendingReviews}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Admin gets discovery hub too if not on /admin */}
          {isAdmin && pathname !== '/admin' && (
            <div className="space-y-4">
              {!isSidebarCollapsed && (
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 mb-2">Discovery Hub</p>
              )}
              <div className="space-y-1">
                {interviewFlow.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  const hasBadge = item.href === '/review' && pendingReviews > 0
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'nav-item group relative',
                        isActive ? 'nav-item-active' : 'nav-item-inactive',
                        isSidebarCollapsed && 'justify-center px-0'
                      )}
                      title={isSidebarCollapsed ? item.name : ''}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className={cn('h-4 w-4 shrink-0 transition-transform duration-300', !isActive && 'group-hover:scale-110')} />
                        {!isSidebarCollapsed && <span className="uppercase tracking-tighter">{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && hasBadge && (
                        <span className="bg-rose-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-200 animate-pulse">
                          {pendingReviews}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ⚡ FOOTER ACTIONS */}
        <div className="p-6 border-t-2 border-slate-50 space-y-4">
           {/* Only show New Stakeholder for non-admin OR admin not on /admin */}
           {(!isAdmin || pathname !== '/admin') && !isSidebarCollapsed && (
              <Link
                href="/setup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="group w-full h-14 bg-slate-700 hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-2 overflow-hidden relative active:scale-95"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <PlusCircle className="w-4 h-4 relative z-10" />
                <span className="relative z-10">New Stakeholder</span>
              </Link>
           )}
           {(!isAdmin || pathname !== '/admin') && isSidebarCollapsed && (
              <Link href="/setup" className="w-12 h-12 bg-slate-700 hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-slate-300 transition-all active:scale-90">
                <PlusCircle className="w-6 h-6" />
              </Link>
           )}
           
          <div className="flex flex-col gap-1">
            <Link
              href="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "nav-item",
                pathname === '/settings' ? 'nav-item-active' : 'nav-item-inactive',
                isSidebarCollapsed && "justify-center"
              )}
            >
              <Settings className={cn("w-4 h-4", pathname === '/settings' ? "text-white" : "text-slate-400")} />
              {!isSidebarCollapsed && <span className="uppercase tracking-tighter">Settings</span>}
            </Link>
            
            <button
              onClick={async () => {
                await signOut()
                setIsMobileMenuOpen(false)
              }}
              className={cn(
                "nav-item nav-item-inactive group hover:bg-rose-50 hover:text-rose-600 transition-all w-full",
                isSidebarCollapsed && "justify-center"
              )}
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
              {!isSidebarCollapsed && <span className="uppercase tracking-tighter font-medium text-slate-400 group-hover:text-rose-600">Disconnect</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
