'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  const isLogin = pathname === '/login'

  if (isLogin) {
    // No sidebar on login
    return <>{children}</>
  }

  if (isAdmin) {
    // Admin gets its own dark sidebar + mobile top bar
    return (
      <div className="flex flex-col lg:flex-row h-screen h-[100dvh] overflow-hidden bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    )
  }

  // Normal user layout
  return (
    <div className="flex flex-col lg:flex-row h-screen h-[100dvh] overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 lg:p-10 transition-all">
          {children}
        </div>
      </main>
    </div>
  )
}
