'use client'

import { Settings, Shield, Bell, Cloud, Cpu, Globe, Smartphone, Sparkles, ChevronRight, Lock, Check, Volume2 } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

type Tab = 'general' | 'ai' | 'notifications' | 'recording'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('general')

  // Load saved preferences from localStorage
  const [language, setLanguage] = React.useState('English')
  const [summaryModel, setSummaryModel] = React.useState('nvidia')
  const [autoTranscribe, setAutoTranscribe] = React.useState(true)
  const [notifyOnPublish, setNotifyOnPublish] = React.useState(true)
  const [notifyOnAssign, setNotifyOnAssign] = React.useState(true)
  const [recordingQuality, setRecordingQuality] = React.useState('high')
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    const prefs = localStorage.getItem('mosi-settings')
    if (prefs) {
      const p = JSON.parse(prefs)
      if (p.language) setLanguage(p.language)
      if (p.summaryModel) setSummaryModel(p.summaryModel)
      if (p.autoTranscribe !== undefined) setAutoTranscribe(p.autoTranscribe)
      if (p.notifyOnPublish !== undefined) setNotifyOnPublish(p.notifyOnPublish)
      if (p.notifyOnAssign !== undefined) setNotifyOnAssign(p.notifyOnAssign)
      if (p.recordingQuality) setRecordingQuality(p.recordingQuality)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('mosi-settings', JSON.stringify({
      language, summaryModel, autoTranscribe, notifyOnPublish, notifyOnAssign, recordingQuality
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'ai', label: 'AI Models', icon: Cpu },
    { id: 'recording', label: 'Recording', icon: Volume2 },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ]

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button 
      onClick={() => onChange(!checked)}
      className={cn("w-10 h-6 rounded-full transition-all relative", checked ? "bg-blue-600" : "bg-slate-200")}
    >
      <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm", checked ? "left-5" : "left-1")} />
    </button>
  )

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="space-y-1 pt-2 sm:pt-4">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-800">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">Configure your workspace preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0",
              activeTab === t.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-8 space-y-8 shadow-sm">

        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">Interface Language</h3>
              <p className="text-xs text-slate-400 mb-4">Controls the UI language. Transcription language is auto-detected.</p>
              <div className="flex flex-wrap gap-2">
                {['English', 'Hindi', 'Kannada', 'Tamil', 'Spanish', 'French'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "h-9 px-4 rounded-lg text-xs font-bold border transition-all",
                      language === lang ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">Summary Generation Model</h3>
              <p className="text-xs text-slate-400 mb-4">Choose the AI model for generating interview summaries.</p>
              <div className="space-y-2">
                {[
                  { id: 'nvidia', name: 'NVIDIA Nemotron Super 49B', desc: 'Fast, multilingual, good for structured summaries', active: true },
                  { id: 'gpt4o', name: 'OpenAI GPT-4o', desc: 'Best quality reasoning and synthesis', active: false },
                  { id: 'local', name: 'None (transcript only)', desc: 'Skip summary generation, just transcribe', active: true },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => m.active && setSummaryModel(m.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                      summaryModel === m.id ? "border-blue-200 bg-blue-50/50" : "border-slate-100 hover:border-slate-200",
                      !m.active && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-700">{m.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                    </div>
                    {summaryModel === m.id && <Check className="w-4 h-4 text-blue-600" />}
                    {!m.active && <Lock className="w-4 h-4 text-slate-300" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-700">Auto-transcribe after recording</p>
                <p className="text-[10px] text-slate-400">Automatically generate transcript when session ends</p>
              </div>
              <Toggle checked={autoTranscribe} onChange={setAutoTranscribe} />
            </div>
          </div>
        )}

        {activeTab === 'recording' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">Recording Quality</h3>
              <p className="text-xs text-slate-400 mb-4">Higher quality uses more storage but improves transcription accuracy.</p>
              <div className="flex gap-2">
                {[
                  { id: 'low', label: 'Low', desc: '64kbps' },
                  { id: 'medium', label: 'Medium', desc: '128kbps' },
                  { id: 'high', label: 'High', desc: '256kbps' },
                ].map(q => (
                  <button
                    key={q.id}
                    onClick={() => setRecordingQuality(q.id)}
                    className={cn(
                      "flex-1 p-3 rounded-xl border text-center transition-all",
                      recordingQuality === q.id ? "border-blue-200 bg-blue-50/50" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <p className="text-xs font-bold text-slate-700">{q.label}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold text-slate-700">Notify on session publish</p>
                <p className="text-[10px] text-slate-400">Get notified when a session is published</p>
              </div>
              <Toggle checked={notifyOnPublish} onChange={setNotifyOnPublish} />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-700">Notify on assignment</p>
                <p className="text-[10px] text-slate-400">Get notified when a session is assigned to you</p>
              </div>
              <Toggle checked={notifyOnAssign} onChange={setNotifyOnAssign} />
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className={cn(
            "h-11 px-8 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md",
            saved ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-black"
          )}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
