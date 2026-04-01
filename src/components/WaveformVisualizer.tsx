'use client'

import React, { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  stream: MediaStream | null
  isActive: boolean
  color?: string
  width?: number
  height?: number
}

export function WaveformVisualizer({ 
  stream, 
  isActive, 
  color = '#3b82f6', // blue-500
  width = 200, 
  height = 40 
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | undefined>(undefined)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!isActive || !stream) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    // Setup Web Audio API
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioContextClass()
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    
    analyser.fftSize = 256
    source.connect(analyser)
    
    analyserRef.current = analyser
    audioContextRef.current = audioContext

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    const draw = () => {
      if (!ctx || !canvas) return
      
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      // Clear with slight transparency for a trailing effect if desired
      ctx.clearRect(0, 0, width, height)
      
      ctx.lineWidth = 2
      ctx.strokeStyle = color
      ctx.lineCap = 'round'
      ctx.beginPath()

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.stroke()
    }

    draw()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioContext.state !== 'closed') {
        audioContext.close()
      }
    }
  }, [isActive, stream, color, width, height])

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className="opacity-80 mix-blend-multiply transition-opacity duration-500"
    />
  )
}
