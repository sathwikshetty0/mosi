import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-slate-200/60 rounded-lg", className)} />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-10 max-w-6xl mx-auto animate-in fade-in">
      {/* Header skeleton */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pt-1 sm:pt-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 sm:h-9 sm:w-40" />
          <Skeleton className="h-4 w-48 sm:w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="grid grid-cols-4 gap-2 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-3 sm:p-6 bg-white border border-slate-100 rounded-xl sm:rounded-2xl space-y-2">
            <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" />
            <Skeleton className="h-6 w-8 sm:h-8 sm:w-12" />
            <Skeleton className="h-3 w-14 sm:w-20" />
          </div>
        ))}
      </section>

      {/* Sessions skeleton */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 sm:p-6 bg-white border border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-5">
              <Skeleton className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-14 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-36 sm:w-48" />
                <Skeleton className="h-3 w-28 sm:w-36" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function ReviewSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-start gap-4 pt-4 pb-4 border-b border-slate-100">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Stakeholder */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Audio player */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-center gap-6">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Transcript & Summary */}
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}

export function InterviewsSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pt-6 animate-in fade-in">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-16 rounded-xl" />
          <Skeleton className="h-10 w-16 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-50">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="w-9 h-9 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
