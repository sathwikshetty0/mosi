'use client'

import { Layers, MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (type: 'ceed' | 'normal') => void
}

export function InterviewTypePicker({ open, onClose, onSelect }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#1C2A3B]">Interview type</h3>
          <button onClick={onClose} className="text-[#8E959D] hover:text-[#1C2A3B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelect('ceed')}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-[#E8EAEB] hover:border-[#786BF9] hover:bg-[#F2F0FE] transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-[#E4E1FE] rounded-lg flex items-center justify-center group-hover:bg-[#786BF9] transition-colors">
              <Layers className="w-5 h-5 text-[#786BF9] group-hover:text-white transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1C2A3B]">CEED</p>
              <p className="text-[10px] text-[#8E959D] mt-0.5">Strategic discovery</p>
            </div>
          </button>

          <button
            onClick={() => onSelect('normal')}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-[#E8EAEB] hover:border-[#2C64F9] hover:bg-[#EAF0FE] transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-[#EAF0FE] rounded-lg flex items-center justify-center group-hover:bg-[#2C64F9] transition-colors">
              <MessageSquare className="w-5 h-5 text-[#2C64F9] group-hover:text-white transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1C2A3B]">Normal</p>
              <p className="text-[10px] text-[#8E959D] mt-0.5">General interview</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
