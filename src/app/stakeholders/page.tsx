'use client'

import { useMosiStore, StakeholderProfile } from '@/lib/store'
import { 
  Plus, Search, Mail, Phone, ExternalLink, Building2, 
  Users, Globe, Briefcase, ChevronRight, BarChart2,
  X, Save, Pencil, AlertCircle, Trash2, Edit3, MapPin, Activity, Heart, Zap, Linkedin, Share2
} from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

function EditModal({ sh, onOpenChange, onSave }: { sh: any, onOpenChange: (open: boolean) => void, onSave: (id: string, updates: Partial<StakeholderProfile>) => void }) {
  const [form, setForm] = React.useState<StakeholderProfile>(sh)
  const [saving, setSaving] = React.useState(false)
  const [showErrors, setShowErrors] = React.useState(false)

  const update = (field: keyof StakeholderProfile, val: string) => setForm(prev => ({ ...prev, [field]: val }))
  
  const isFieldEmpty = (field: keyof StakeholderProfile) => !form[field] || String(form[field]).trim() === ''
  
  const validate = () => {
    const required: (keyof StakeholderProfile)[] = ['name', 'role', 'phone', 'email', 'company', 'sector']
    return !required.some(f => isFieldEmpty(f))
  }

  const { 
    sessions, fetchSessions, updateStakeholder, deleteStakeholder, 
    deleteSession, stakeholdersList, globalCompanies, fetchGlobalCompanies 
  } = useMosiStore()
  const shSessions = React.useMemo(() => sessions.filter(s => s.stakeholder?.id === sh.id), [sessions, sh.id])

  const uniqueCompanies = React.useMemo(() => {
    const map = new Map<string, any>()
    stakeholdersList.forEach(s => {
      if (!s.company || s.company === 'N/A') return
      if (!map.has(s.company.toLowerCase().trim())) {
        map.set(s.company.toLowerCase().trim(), s)
      }
    })

    // Add Global Companies
    globalCompanies.forEach(co => {
      const key = (co.name || co.company || '').toLowerCase().trim()
      if (!key) return
      if (!map.has(key)) {
        map.set(key, { ...co, company: co.name || co.company })
      }
    })

    return Array.from(map.values())
  }, [stakeholdersList, globalCompanies])

  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const suggestions = React.useMemo(() => {
    if (!showSuggestions) return []
    if (!form.company) return uniqueCompanies
    return uniqueCompanies.filter(c => 
      c.company.toLowerCase().includes(form.company.toLowerCase())
    )
  }, [form.company, uniqueCompanies, showSuggestions])

  const selectCompany = (co: any) => {
    setForm(prev => ({
      ...prev,
      company: co.company,
      sector: co.sector || prev.sector,
      employees: co.employees || prev.employees,
      revenue: co.revenue || prev.revenue,
      geography: co.geography || prev.geography,
      yearsInBusiness: co.yearsInBusiness || prev.yearsInBusiness
    }))
    setShowSuggestions(false)
  }

  const handleSave = async () => {
    if (!validate()) {
      setShowErrors(true)
      return
    }
    setSaving(true)
    await onSave(sh.id, form)
    setSaving(false)
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (confirm(`Delete ${sh.name}? This will remove all their interviews too.`)) {
      if (sh.id) deleteStakeholder(sh.id)
      onOpenChange(false)
    }
  }

  const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block"
  const inputClass = (field: keyof StakeholderProfile, required?: boolean) => cn(
    "w-full h-11 px-4 bg-slate-50 border rounded-xl text-sm text-slate-700 placeholder:text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10",
    showErrors && required && isFieldEmpty(field) ? "border-red-200 bg-red-50/30 focus:border-red-300" : "border-slate-100 focus:border-blue-200"
  )
  const RequiredDot = () => <span className="text-red-400 ml-0.5">*</span>

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-500" /> Edit Stakeholder
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">Update profile information</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg sm:rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] pb-2 border-b border-slate-50">Personal Details</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Name <RequiredDot /></label>
                  <input className={inputClass('name', true)} value={form.name} onChange={e => update('name', e.target.value)} placeholder="Full name" />
                  {showErrors && isFieldEmpty('name') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Role <RequiredDot /></label>
                  <input className={inputClass('role', true)} value={form.role} onChange={e => update('role', e.target.value)} placeholder="Decision Maker, User, etc" />
                  {showErrors && isFieldEmpty('role') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Phone <RequiredDot /></label>
                  <input className={inputClass('phone', true)} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 123 456 7890" />
                  {showErrors && isFieldEmpty('phone') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Email <RequiredDot /></label>
                  <input className={inputClass('email', true)} value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@company.com" />
                  {showErrors && isFieldEmpty('email') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Domain</label>
                  <input className={inputClass('domain')} value={form.domain} onChange={e => update('domain', e.target.value)} placeholder="e.g. Finance, Tech" />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input className={inputClass('linkedin')} value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="linkedin.com/in/..." />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] pb-2 border-b border-slate-50">Company Profile</h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className={labelClass}>Company <RequiredDot /></label>
                  <input 
                    className={inputClass('company', true)} 
                    value={form.company} 
                    onChange={e => {
                      update('company', e.target.value)
                      setShowSuggestions(true)
                    }} 
                    onFocus={() => {
                      setShowSuggestions(true)
                      fetchGlobalCompanies()
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Company name" 
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                      {suggestions.slice(0, 5).map(co => (
                        <button
                          key={co.id}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectCompany(co)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-700">{co.company}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{co.sector || 'N/A'}</p>
                          </div>
                          <ChevronRight className="w-3 h-3 text-slate-200 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  )}
                  {showErrors && isFieldEmpty('company') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Sector <RequiredDot /></label>
                  <input className={inputClass('sector', true)} value={form.sector} onChange={e => update('sector', e.target.value)} placeholder="e.g. Manufacturing" />
                  {showErrors && isFieldEmpty('sector') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Employees</label>
                  <input className={inputClass('employees')} value={form.employees} onChange={e => update('employees', e.target.value)} placeholder="e.g. 50-200" />
                </div>
                <div>
                  <label className={labelClass}>Revenue</label>
                  <input className={inputClass('revenue')} value={form.revenue} onChange={e => update('revenue', e.target.value)} placeholder="Annual revenue" />
                </div>
                <div>
                  <label className={labelClass}>Geography</label>
                  <input className={inputClass('geography')} value={form.geography} onChange={e => update('geography', e.target.value)} placeholder="Region, Country" />
                </div>
                <div>
                  <label className={labelClass}>Years in Business</label>
                  <input className={inputClass('yearsInBusiness')} value={form.yearsInBusiness} onChange={e => update('yearsInBusiness', e.target.value)} placeholder="e.g. 10 years" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button 
              onClick={handleDelete}
              className="px-6 h-11 sm:h-12 text-xs sm:text-sm font-bold text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 order-3 sm:order-1"
            >
              <Trash2 className="w-4 h-4" /> Delete Profile
            </button>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 order-1 sm:order-2">
              <button 
                onClick={() => onOpenChange(false)}
                className="px-6 h-11 sm:h-12 text-xs sm:text-sm font-bold text-slate-400 hover:text-slate-800 transition-all text-center"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 h-11 sm:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><span className="animate-spin">⟳</span> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StakeholdersPage() {
  const { sessions, fetchSessions, updateStakeholder, deleteStakeholder } = useMosiStore()
  const [editingStakeholder, setEditingStakeholder] = React.useState<any>(null)
  
  // Extract unique stakeholders
  const stakeholders = React.useMemo(() => {
    const list: any[] = []
    const processedNames = new Set()

    sessions.forEach(session => {
      const sh = session.stakeholder
      if (sh && sh.name && !processedNames.has(sh.name)) {
        processedNames.add(sh.name)
        list.push({
          ...sh,
          id: sh.id || `sh_${session.id}`, // Fallback if no specific ID
          lastInterview: session.date,
          sessionCount: sessions.filter(s => s.stakeholder?.name === sh.name).length
        })
      }
    })
    return list
  }, [sessions])

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 animate-in fade-in duration-700 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            Stakeholder Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your profiles and interview history.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input 
              placeholder="Search registry..."
              className="h-11 pl-11 pr-4 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-200 transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
          <button className="h-11 px-6 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stakeholders.map((sh) => (
          <div key={sh.id} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 hover:shadow-xl hover:shadow-slate-100/50 hover:border-slate-200 transition-all group active:scale-[0.99]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-500 transition-all">
                  {sh.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{sh.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{sh.role}</p>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                {sh.sessionCount} {sh.sessionCount === 1 ? 'Interview' : 'Interviews'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company</p>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold truncate">{sh.company}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold truncate">{sh.geography || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Last Interview</span>
                <span className="text-slate-600 font-black">{sh.lastInterview}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Industry</span>
                <span className="text-slate-600 font-black">{sh.sector}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingStakeholder(sh)
                }}
                className="flex-1 h-12 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // In a real implementation this would trigger the share flow
                  alert('Share feature activated! Allows sending this stakeholder\'s profile to colleagues.')
                }}
                className="w-12 h-12 bg-white border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all shrink-0 tooltip-trigger"
                title="Share Stakeholder"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingStakeholder && (
        <EditModal 
          sh={editingStakeholder} 
          onOpenChange={(open) => !open && setEditingStakeholder(null)} 
          onSave={updateStakeholder}
        />
      )}
    </div>
  )
}
