'use client'

import { useMosiStore, StakeholderProfile } from '@/lib/store'
import { 
  Plus, Search, Mail, Phone, ExternalLink, Building2, 
  Users, Globe, Briefcase, ChevronRight, BarChart2,
  X, Save, Pencil, AlertCircle
} from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface EditModalProps {
  stakeholder: StakeholderProfile & { interviewCount: number; lastInterview: string }
  onClose: () => void
  onSave: (oldName: string, updates: Partial<StakeholderProfile>) => void
}

function EditStakeholderModal({ stakeholder, onClose, onSave }: EditModalProps) {
  const [form, setForm] = React.useState<StakeholderProfile>({
    name: stakeholder.name || '',
    role: stakeholder.role || '',
    phone: stakeholder.phone || '',
    email: stakeholder.email || '',
    linkedin: stakeholder.linkedin || '',
    company: stakeholder.company || '',
    sector: stakeholder.sector || '',
    products: stakeholder.products || '',
    employees: stakeholder.employees || '',
    revenue: stakeholder.revenue || '',
    yearsInBusiness: stakeholder.yearsInBusiness || '',
    geography: stakeholder.geography || '',
    domain: stakeholder.domain || '',
    address: stakeholder.address || '',
    pincode: stakeholder.pincode || '',
  })
  const [showErrors, setShowErrors] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const update = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
  }

  const isFieldEmpty = (key: string) => !(form as any)[key]?.toString().trim()
  const requiredFields = ['name', 'role', 'phone', 'email', 'company', 'sector'] as const
  const isValid = requiredFields.every(k => !isFieldEmpty(k))

  const handleSave = () => {
    setShowErrors(true)
    if (!isValid) return
    setSaving(true)
    onSave(stakeholder.name, form)
    setTimeout(() => {
      setSaving(false)
      onClose()
    }, 400)
  }

  const inputClass = (key: string, required = false) => cn(
    "w-full h-11 px-4 rounded-xl border-2 outline-none transition-all duration-200 text-sm font-semibold text-slate-800",
    "placeholder:text-slate-300 placeholder:font-normal",
    "bg-white",
    "hover:border-slate-300",
    "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
    (showErrors && required && isFieldEmpty(key))
      ? "border-red-300 bg-red-50/50"
      : "border-slate-200",
  )

  const labelClass = "block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider"

  const RequiredDot = () => <span className="text-red-400 ml-0.5">*</span>

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-400 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                {form.name.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-blue-500" /> Edit Stakeholder
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Update profile information</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name <RequiredDot /></label>
                  <input className={inputClass('name', true)} value={form.name} onChange={e => update('name', e.target.value)} placeholder="Full name" />
                  {showErrors && isFieldEmpty('name') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Role <RequiredDot /></label>
                  <input className={inputClass('role', true)} value={form.role} onChange={e => update('role', e.target.value)} placeholder="Job title" />
                  {showErrors && isFieldEmpty('role') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Phone <RequiredDot /></label>
                  <input className={inputClass('phone', true)} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 555-0000" type="tel" />
                  {showErrors && isFieldEmpty('phone') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Email <RequiredDot /></label>
                  <input className={inputClass('email', true)} value={form.email} onChange={e => update('email', e.target.value)} placeholder="jane@company.com" type="email" />
                  {showErrors && isFieldEmpty('email') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Domain</label>
                  <input className={inputClass('domain')} value={form.domain || ''} onChange={e => update('domain', e.target.value)} placeholder="e.g. AI / Logistics" />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input className={inputClass('linkedin')} value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="linkedin.com/in/..." />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" /> Company Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Company <RequiredDot /></label>
                  <input className={inputClass('company', true)} value={form.company} onChange={e => update('company', e.target.value)} placeholder="Company name" />
                  {showErrors && isFieldEmpty('company') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Sector <RequiredDot /></label>
                  <input className={inputClass('sector', true)} value={form.sector} onChange={e => update('sector', e.target.value)} placeholder="e.g. Fintech & SaaS" />
                  {showErrors && isFieldEmpty('sector') && <p className="mt-1 text-[10px] font-semibold text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
                <div>
                  <label className={labelClass}>Employees</label>
                  <input className={inputClass('employees')} value={form.employees} onChange={e => update('employees', e.target.value)} placeholder="e.g. 50-200" />
                </div>
                <div>
                  <label className={labelClass}>Revenue</label>
                  <input className={inputClass('revenue')} value={form.revenue} onChange={e => update('revenue', e.target.value)} placeholder="e.g. $5M - $20M" />
                </div>
                <div>
                  <label className={labelClass}>Years Active</label>
                  <input className={inputClass('yearsInBusiness')} value={form.yearsInBusiness} onChange={e => update('yearsInBusiness', e.target.value)} placeholder="e.g. 8 Years" />
                </div>
                <div>
                  <label className={labelClass}>Geography</label>
                  <input className={inputClass('geography')} value={form.geography} onChange={e => update('geography', e.target.value)} placeholder="e.g. EMEA / NA" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Products / Services</label>
                  <textarea 
                    rows={2} 
                    className={cn(inputClass('products'), "h-auto py-2.5 resize-none")} 
                    value={form.products} 
                    onChange={e => update('products', e.target.value)} 
                    placeholder="What they do..." 
                  />
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input className={inputClass('address')} value={form.address || ''} onChange={e => update('address', e.target.value)} placeholder="HQ Address" />
                </div>
                <div>
                  <label className={labelClass}>Pincode</label>
                  <input className={inputClass('pincode')} value={form.pincode || ''} onChange={e => update('pincode', e.target.value)} placeholder="Zip code" />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 font-medium">
              Fields with <span className="text-red-400">*</span> are required
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="h-11 px-6 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  "h-11 px-8 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center gap-2",
                  saving 
                    ? "bg-emerald-500 text-white" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                )}
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
    </>
  )
}

export default function StakeholdersPage() {
  const { sessions, updateStakeholder } = useMosiStore()
  const [editingStakeholder, setEditingStakeholder] = React.useState<any>(null)
  
  // Extract unique stakeholders
  const stakeholdersMap = new Map()
  sessions.forEach(s => {
    if (!stakeholdersMap.has(s.stakeholder.name)) {
      stakeholdersMap.set(s.stakeholder.name, {
        ...s.stakeholder,
        interviewCount: 1,
        lastInterview: s.date
      })
    } else {
      const existing = stakeholdersMap.get(s.stakeholder.name)
      existing.interviewCount += 1
    }
  })

  const stakeholders = Array.from(stakeholdersMap.values())
  const [search, setSearch] = React.useState('')

  const filteredStakeholders = stakeholders.filter(sh => 
    sh.name.toLowerCase().includes(search.toLowerCase()) || 
    sh.company.toLowerCase().includes(search.toLowerCase()) ||
    sh.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleSaveEdit = (id: string, updates: Partial<StakeholderProfile>) => {
    updateStakeholder(id, updates)
  }

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
            <Users className="w-3.5 h-3.5" /> Human Infrastructure
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-700 uppercase leading-[0.9]">
            Stakeholder <br/><span className="text-emerald-600">Directory</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Managing the collective intelligence of engaged experts.</p>
        </div>
        <button id="add-stakeholder-btn" className="px-8 py-5 bg-slate-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Provision New Expert
        </button>
      </div>

      {/* 🔍 SEARCH WORKSPACE */}
      <div className="relative group mx-2">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
        <input
          type="text"
          placeholder="Search by identity, organization, or industrial sector..."
          className="w-full h-16 pl-16 pr-6 rounded-[2rem] border-2 border-slate-100 bg-white focus:border-slate-700 shadow-xl shadow-slate-200/50 outline-none transition-all text-sm font-black uppercase tracking-tight placeholder:text-slate-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStakeholders.length > 0 ? (
          filteredStakeholders.map((sh, i) => (
            <div key={i} className="premium-card p-8 lg:p-10 flex flex-col bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/40 hover:border-slate-700 transition-all group rounded-[2.5rem]">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-slate-700 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl transition-all group-hover:scale-110 group-hover:bg-emerald-600">
                    {sh.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-slate-700 uppercase tracking-tighter">{sh.name}</h4>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{sh.role}</p>
                  </div>
                </div>
                {sh.linkedin && (
                  <a href={sh.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 rounded-xl transition-all text-slate-400 hover:text-blue-600">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="space-y-4 mb-10 flex-1">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <Building2 className="w-4 h-4 text-slate-300" />
                     {sh.company} · {sh.sector}
                   </div>
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <Mail className="w-4 h-4 text-slate-300" />
                     {sh.email || 'NO_EMAIL_ARTIFACT'}
                   </div>
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <Phone className="w-4 h-4 text-slate-300" />
                     {sh.phone || 'NO_PHONE_LINK'}
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <div className="space-y-1">
                   <p className="text-slate-300">Archives</p>
                   <p className="text-slate-700 text-sm font-black">{sh.interviewCount}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-slate-300">Last Session</p>
                   <p className="text-slate-700 font-black">{sh.lastInterview}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setEditingStakeholder(sh)}
                className="mt-8 w-full h-12 bg-white border-2 border-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
              >
                 <Pencil className="w-3.5 h-3.5" />
                 Edit Stakeholder Profile <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-2xl">
              <Users className="w-10 h-10 text-slate-200" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-slate-700 uppercase tracking-tighter">Directory Empty</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto leading-loose">
                 Your stakeholder infrastructure is currently unpopulated. Initiate active sessions to capture and provision expert profiles.
               </p>
            </div>
            <a href="/setup" className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs hover:underline underline-offset-8 transition-all">
               Provision First Stakeholder →
            </a>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingStakeholder && (
        <EditStakeholderModal
          stakeholder={editingStakeholder}
          onClose={() => setEditingStakeholder(null)}
          onSave={(sh_id, updates) => handleSaveEdit(editingStakeholder.id, updates)}
        />
      )}
    </div>
  )
}
