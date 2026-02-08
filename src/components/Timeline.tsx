'use client'

import { useState, useMemo } from 'react'
import { Snapshot } from '@/lib/types'

interface TimelineProps {
  snapshots: Snapshot[]
  onSelect: (snapshot: Snapshot) => void
  selectedIds: string[]
}

export default function Timeline({ snapshots, onSelect, selectedIds }: TimelineProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  
  // Group snapshots by year
  const snapshotsByYear = useMemo(() => {
    const groups = new Map<number, Snapshot[]>()
    for (const snapshot of snapshots) {
      if (!groups.has(snapshot.year)) {
        groups.set(snapshot.year, [])
      }
      groups.get(snapshot.year)!.push(snapshot)
    }
    return groups
  }, [snapshots])
  
  const years = Array.from(snapshotsByYear.keys()).sort((a, b) => b - a)
  
  // Filter snapshots based on selected year
  const displaySnapshots = useMemo(() => {
    if (selectedYear) {
      return snapshotsByYear.get(selectedYear) || []
    }
    return snapshots
  }, [snapshots, selectedYear, snapshotsByYear])
  
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">View:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              viewMode === 'grid' 
                ? 'bg-tb-accent text-white' 
                : 'bg-tb-card text-gray-400 hover:text-white'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              viewMode === 'timeline' 
                ? 'bg-tb-accent text-white' 
                : 'bg-tb-card text-gray-400 hover:text-white'
            }`}
          >
            Timeline
          </button>
        </div>
        
        {/* Year filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Filter by year:</span>
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-tb-card border border-tb-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tb-accent"
          >
            <option value="">All years</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year} ({snapshotsByYear.get(year)?.length} snapshots)
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Year markers (timeline view) */}
      {viewMode === 'timeline' && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-tb-border"></div>
          
          {/* Year markers */}
          <div className="flex justify-between relative">
            {years.slice(0, 10).reverse().map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                className={`relative flex flex-col items-center ${
                  selectedYear === year ? 'text-tb-accent' : 'text-gray-400'
                }`}
              >
                <div className={`w-3 h-3 rounded-full border-2 ${
                  selectedYear === year 
                    ? 'bg-tb-accent border-tb-accent' 
                    : 'bg-tb-dark border-tb-border hover:border-tb-accent'
                } transition`}></div>
                <span className="mt-2 text-sm font-medium">{year}</span>
                <span className="text-xs text-gray-500">{snapshotsByYear.get(year)?.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Snapshots grid */}
      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
          : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
      }`}>
        {displaySnapshots.map((snapshot) => (
          <button
            key={snapshot.timestamp}
            onClick={() => onSelect(snapshot)}
            className={`snapshot-card bg-tb-card border rounded-lg overflow-hidden text-left transition ${
              selectedIds.includes(snapshot.timestamp)
                ? 'border-tb-accent ring-2 ring-tb-accent/20'
                : 'border-tb-border hover:border-tb-accent/50'
            }`}
          >
            {/* Screenshot preview */}
            <div className="aspect-video bg-tb-dark relative overflow-hidden">
              <img
                src={snapshot.screenshotUrl}
                alt={`${snapshot.originalUrl} - ${snapshot.date}`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                onError={(e) => {
                  // Fallback if screenshot fails to load
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              {/* Fallback */}
              <div className="absolute inset-0 flex items-center justify-center bg-tb-card/80 backdrop-blur-sm">
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-500">Preview</span>
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedIds.includes(snapshot.timestamp) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-tb-accent rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="p-3">
              <p className="font-medium text-sm">{snapshot.date}</p>
              <p className="text-xs text-gray-500 mt-1">{snapshot.year}</p>
            </div>
          </button>
        ))}
      </div>
      
      {/* Load more indicator */}
      {displaySnapshots.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {displaySnapshots.length} of {snapshots.length} snapshots
        </div>
      )}
    </div>
  )
}
