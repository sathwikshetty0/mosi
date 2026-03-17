'use client'

import { Settings, Shield, Bell, Cloud, Database, Cpu, Globe, CheckCircle, Smartphone, Zap, Sparkles, ChevronRight, Lock } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('General')

  const sections = [
    { title: 'General', icon: Settings },
    { title: 'AI configuration', icon: Cpu },
    { title: 'Storage & cloud', icon: Cloud },
    { title: 'Security', icon: Shield },
    { title: 'Notifications', icon: Bell },
  ]

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* 🚀 ELITE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full w-fit">
            <Settings className="w-3.5 h-3.5" /> System Architecture
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9]">
            Platform <br/><span className="text-blue-600">Preferences</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global configuration and synthetic intelligence tuning.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* 🧭 NAVIGATION DOCK */}
        <div className="w-full lg:w-72 flex-none bg-white p-3 rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/50 h-fit space-y-2">
          {sections.map((s) => (
            <button
              key={s.title}
              onClick={() => setActiveTab(s.title)}
              className={cn(
                 "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                 activeTab === s.title 
                   ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' 
                   : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
               <div className="flex items-center gap-4">
                  <s.icon className="w-4 h-4" />
                  {s.title}
               </div>
               {activeTab === s.title && <ChevronRight className="w-4 h-4 text-white/40" />}
            </button>
          ))}
        </div>

        {/* 📋 WORKSPACE AREA */}
        <div className="flex-1 space-y-8 animate-in zoom-in-95 duration-300">
          <div className="premium-card p-10 lg:p-12 bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] space-y-12">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
               <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                  <Zap className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{activeTab} Parameters</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Modify technical constraints and baseline logic</p>
               </div>
            </div>
            
            <div className="space-y-12">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Globe className="w-4 h-4 text-blue-500" /> Interaction Locale
                </h4>
                <div className="flex flex-wrap gap-3">
                  {['English', 'Spanish', 'French', 'German', 'Japanese'].map(lang => (
                    <button 
                      key={lang} 
                      className={cn(
                         "h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                         lang === 'English' ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 space-y-8">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Cpu className="w-4 h-4 text-blue-500" /> Synthetic Engines
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <label className="flex flex-col gap-6 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 cursor-pointer hover:border-blue-500 hover:bg-white transition-all group">
                     <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                           <Cpu className="w-6 h-6" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-blue-100 transition-all">
                           <div className="w-4 h-4 bg-white rounded-full shadow-lg group-hover:translate-x-3 transition-transform" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Whisper v3.5 Prime</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Neural speech-to-artifact mapping with latency optimization.</p>
                     </div>
                   </label>

                   <label className="flex flex-col gap-6 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 cursor-pointer hover:border-blue-500 hover:bg-white transition-all group opacity-50">
                     <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl">
                           <Sparkles className="w-6 h-6" />
                        </div>
                        <Lock className="w-5 h-5 text-slate-300" />
                     </div>
                     <div className="space-y-2">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">GPT-4o Reasoning</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Elite synthesis and strategy extraction (ENTERPRISE ONLY).</p>
                     </div>
                   </label>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   System Diagnostics
                </h4>
                <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Local Matrix Operational</span>
                  </div>
                  <span className="text-[9px] font-black text-emerald-600 uppercase bg-white px-3 py-1 rounded-full border border-emerald-200">v0.1.2-PRIME</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 px-10">
             <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors">Factory Reset</button>
             <button className="h-16 px-12 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95">
                Commit Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}
