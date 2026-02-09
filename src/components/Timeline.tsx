'use client'

import { useState, useMemo } from 'react'
import { Snapshot } from '@/lib/types'

interface TimelineProps {
  snapshots: Snapshot[]
  onSelect: (snapshot: Snapshot) => void
  selectedIds: string[]
}

// Get era label
function getEraLabel(year: number): string {
  if (year <= 2000) return 'Early Web';
  if (year <= 2005) return 'Web 1.0';
  if (year <= 2010) return 'Web 2.0';
  if (year <= 2015) return 'Mobile Era';
  if (year <= 2020) return 'Modern Web';
  return 'Current';
}

// Get era color
function getEraColor(year: number): string {
  if (year <= 2000) return 'bg-amber-500';
  if (year <= 2005) return 'bg-orange-500';
  if (year <= 2010) return 'bg-blue-500';
  if (year <= 2015) return 'bg-purple-500';
  if (year <= 2020) return 'bg-emerald-500';
  return 'bg-cyan-500';
}

// Gradient for card
function getGradient(year: number): string {
  if (year <= 2000) return 'from-amber-50 to-orange-50';
  if (year <= 2005) return 'from-orange-50 to-red-50';
  if (year <= 2010) return 'from-blue-50 to-indigo-50';
  if (year <= 2015) return 'from-purple-50 to-pink-50';
  if (year <= 2020) return 'from-emerald-50 to-teal-50';
  return 'from-cyan-50 to-blue-50';
}

export default function Timeline({ snapshots, onSelect, selectedIds }: TimelineProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  
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
  
  const displaySnapshots = useMemo(() => {
    if (selectedYear) {
      return snapshotsByYear.get(selectedYear) || []
    }
    return snapshots
  }, [snapshots, selectedYear, snapshotsByYear])

  // Extract domain for display
  const domain = useMemo(() => {
    if (snapshots.length === 0) return '';
    try {
      const url = snapshots[0].originalUrl || '';
      const full = url.startsWith('http') ? url : `http://${url}`;
      return new URL(full).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }, [snapshots]);

  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';
  
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
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              viewMode === 'timeline' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            Timeline
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Filter by year:</span>
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-gray-700"
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
      
      {/* Year timeline bar */}
      {viewMode === 'timeline' && (
        <div className="relative py-2">
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
          <div className="flex justify-between relative">
            {years.slice(0, 10).reverse().map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                className={`relative flex flex-col items-center transition-colors ${
                  selectedYear === year ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full border-2 transition ${
                  selectedYear === year 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}></div>
                <span className="mt-2 text-sm font-medium">{year}</span>
                <span className="text-xs text-gray-400">{snapshotsByYear.get(year)?.length}</span>
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
            className={`group relative bg-white border rounded-xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg ${
              selectedIds.includes(snapshot.timestamp)
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Card visual */}
            <div className={`aspect-[4/3] relative overflow-hidden bg-gradient-to-br ${getGradient(snapshot.year)}`}>
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}></div>
              
              {/* Mini browser window */}
              <div className="absolute inset-3 rounded-lg overflow-hidden shadow-md border border-white/50">
                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5 border-b border-gray-200/50">
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded px-1.5 py-0.5 text-[7px] text-gray-400 truncate">
                    {domain}
                  </div>
                </div>
                <div className="bg-white/60 p-3 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100% - 20px)' }}>
                  {faviconUrl && (
                    <img src={faviconUrl} alt="" className="w-8 h-8 mb-1.5 opacity-70" />
                  )}
                  <span className="text-gray-600 text-[9px] font-medium">{snapshot.date}</span>
                </div>
              </div>

              {/* Era badge */}
              <div className={`absolute top-1.5 right-1.5 ${getEraColor(snapshot.year)} text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider`}>
                {getEraLabel(snapshot.year)}
              </div>
              
              {/* Selection indicator */}
              {selectedIds.includes(snapshot.timestamp) && (
                <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Hover: Open in Wayback */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium px-2.5 py-1.5 rounded-full shadow-sm">
                  Select to compare
                </span>
              </div>
            </div>
            
            {/* Info */}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{snapshot.date}</span>
              <a
                href={snapshot.archiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-blue-500 hover:underline"
              >
                View →
              </a>
            </div>
          </button>
        ))}
      </div>
      
      {displaySnapshots.length > 0 && (
        <div className="text-center text-sm text-gray-400">
          Showing {displaySnapshots.length} of {snapshots.length} snapshots
        </div>
      )}
    </div>
  )
}
