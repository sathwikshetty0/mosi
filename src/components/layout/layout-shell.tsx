'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { useAuth } from '@/lib/auth-context'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const isAdmin = pathname?.startsWith('/admin')
  const isLogin = pathname === '/login'
  const isPreview = pathname === '/preview'
  // Only show guest preview layout if auth has fully resolved AND there's no user
  // During page transitions, `user` might be briefly null — don't strip sidebar in that case
  const isGuestPreview = isPreview && !loading && !user

  if (isLogin) {
    return (
      <main className="min-h-screen bg-slate-50 overflow-y-auto">
        {children}
      </main>
    )
  }

  if (isGuestPreview) {
    // No sidebar for actual guests on preview
    return (
      <main className="min-h-screen bg-[#F1F2FB] overflow-y-auto">
        {children}
      </main>
    )
  }

  if (isAdmin) {
    // Admin gets its own dark sidebar + mobile top bar
    return (
      <div className="flex flex-col lg:flex-row h-screen h-[100dvh] overflow-hidden bg-slate-50">
        <Suspense fallback={<div className="w-64 bg-slate-900" />}>
          <AdminSidebar />
        </Suspense>
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
      <main className="flex-1 min-h-0 overflow-y-auto bg-[#F1F2FB]">
        <div className="max-w-7xl mx-auto p-4 lg:p-10 transition-all">
          {children}
        </div>
      </main>
    </div>
  )
}
