'use client'

import { useState, useRef } from 'react'
import { Snapshot } from '@/lib/types'
import ArchiveFrame from './ArchiveFrame'

interface CompareViewProps {
  snapshot1: Snapshot
  snapshot2: Snapshot
  onClose: () => void
}

export default function CompareView({ snapshot1, snapshot2, onClose }: CompareViewProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider' | 'overlay'>('side-by-side')
  const [sliderPosition, setSliderPosition] = useState(50)
  const [overlayOpacity, setOverlayOpacity] = useState(0.5)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Sort snapshots by date (earlier first)
  const [earlier, later] = snapshot1.timestamp < snapshot2.timestamp 
    ? [snapshot1, snapshot2] 
    : [snapshot2, snapshot1]
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Compare Snapshots</h3>
        <div className="flex items-center gap-4">
          {/* View mode toggles */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded text-sm transition ${
                viewMode === 'side-by-side' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`px-3 py-1.5 rounded text-sm transition ${
                viewMode === 'slider' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Slider
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-3 py-1.5 rounded text-sm transition ${
                viewMode === 'overlay' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Overlay
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Date labels */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">
            <span className="text-gray-400">Earlier:</span>{' '}
            <span className="font-medium text-gray-900">{earlier.date}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">
            <span className="text-gray-400">Later:</span>{' '}
            <span className="font-medium text-gray-900">{later.date}</span>
          </span>
        </div>
      </div>
      
      {/* Comparison view */}
      <div 
        ref={containerRef}
        className="relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
        style={{ minHeight: '500px' }}
      >
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="space-y-2">
              <div className="aspect-video bg-white rounded-lg overflow-hidden relative border border-gray-200">
                <ArchiveFrame
                  src={earlier.screenshotUrl}
                  alt={`${earlier.originalUrl} - ${earlier.date}`}
                  className="w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <a 
                    href={earlier.archiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-300 hover:text-blue-200 hover:underline"
                  >
                    View in Wayback Machine →
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="aspect-video bg-white rounded-lg overflow-hidden relative border border-gray-200">
                <ArchiveFrame
                  src={later.screenshotUrl}
                  alt={`${later.originalUrl} - ${later.date}`}
                  className="w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <a 
                    href={later.archiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-300 hover:text-blue-200 hover:underline"
                  >
                    View in Wayback Machine →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'slider' && (
          <div className="relative" style={{ height: '500px' }}>
            {/* Later snapshot (background) */}
            <div className="absolute inset-0">
              <ArchiveFrame
                src={later.screenshotUrl}
                alt={`${later.originalUrl} - ${later.date}`}
                className="w-full h-full"
              />
            </div>
            
            {/* Earlier snapshot (clipped) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div style={{ width: containerRef.current?.offsetWidth || '100%' }}>
                <ArchiveFrame
                  src={earlier.screenshotUrl}
                  alt={`${earlier.originalUrl} - ${earlier.date}`}
                  className="w-full h-full"
                  style={{ minHeight: '500px' }}
                />
              </div>
            </div>
            
            {/* Slider handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={(e) => {
                const startX = e.clientX
                const startPos = sliderPosition
                
                const handleMouseMove = (e: MouseEvent) => {
                  if (!containerRef.current) return
                  const rect = containerRef.current.getBoundingClientRect()
                  const delta = ((e.clientX - startX) / rect.width) * 100
                  setSliderPosition(Math.max(0, Math.min(100, startPos + delta)))
                }
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }
                
                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>
            
            {/* Labels */}
            <div className="absolute bottom-4 left-4 bg-red-500/90 text-white text-xs px-2 py-1 rounded shadow-sm z-10">
              {earlier.date}
            </div>
            <div className="absolute bottom-4 right-4 bg-green-500/90 text-white text-xs px-2 py-1 rounded shadow-sm z-10">
              {later.date}
            </div>
          </div>
        )}
        
        {viewMode === 'overlay' && (
          <div className="relative" style={{ height: '500px' }}>
            {/* Earlier snapshot */}
            <div className="absolute inset-0">
              <ArchiveFrame
                src={earlier.screenshotUrl}
                alt={`${earlier.originalUrl} - ${earlier.date}`}
                className="w-full h-full"
              />
            </div>
            
            {/* Later snapshot (overlay) */}
            <div 
              className="absolute inset-0"
              style={{ opacity: overlayOpacity }}
            >
              <ArchiveFrame
                src={later.screenshotUrl}
                alt={`${later.originalUrl} - ${later.date}`}
                className="w-full h-full"
              />
            </div>
            
            {/* Opacity slider */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 flex items-center gap-4 shadow-lg z-20">
              <span className="text-xs text-red-500 font-medium">{earlier.date}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-32 accent-blue-500"
              />
              <span className="text-xs text-green-500 font-medium">{later.date}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Links to full archives */}
      <div className="flex justify-center gap-6 mt-4">
        <a 
          href={earlier.archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open {earlier.date} in Wayback Machine
        </a>
        <a 
          href={later.archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open {later.date} in Wayback Machine
        </a>
      </div>
    </div>
  )
}
