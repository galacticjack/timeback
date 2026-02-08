'use client';

import { useState, useRef } from 'react';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

interface ComparisonViewProps {
  snapshots: Snapshot[];
  onBack: () => void;
}

export function ComparisonView({ snapshots, onBack }: ComparisonViewProps) {
  const [snapshot1Index, setSnapshot1Index] = useState(0);
  const [snapshot2Index, setSnapshot2Index] = useState(Math.min(snapshots.length - 1, 5));
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider' | 'overlay'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [leftLoaded, setLeftLoaded] = useState(false);
  const [rightLoaded, setRightLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const snapshot1 = snapshots[snapshot1Index];
  const snapshot2 = snapshots[snapshot2Index];
  
  // Determine which is earlier/later
  const [earlier, later] = snapshot1.date < snapshot2.date 
    ? [snapshot1, snapshot2] 
    : [snapshot2, snapshot1];
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getWaybackUrl = (snapshot: Snapshot) => {
    return `https://web.archive.org/web/${snapshot.timestamp}/${snapshot.url}`;
  };
  
  return (
    <div className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            title="Back to Rewind"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">Compare Snapshots</h2>
            <p className="text-sm text-gray-400">
              Select two snapshots to see the differences
            </p>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition ${
              viewMode === 'side-by-side' 
                ? 'bg-tb-accent text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition ${
              viewMode === 'slider' 
                ? 'bg-tb-accent text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Slider
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition ${
              viewMode === 'overlay' 
                ? 'bg-tb-accent text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overlay
          </button>
        </div>
      </div>
      
      {/* Snapshot Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Earlier Snapshot
            </span>
          </label>
          <select
            value={snapshot1Index}
            onChange={(e) => {
              setSnapshot1Index(parseInt(e.target.value));
              setLeftLoaded(false);
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-tb-accent focus:outline-none"
          >
            {snapshots.map((snapshot, index) => (
              <option key={snapshot.timestamp} value={index} disabled={index === snapshot2Index}>
                {formatDate(snapshot.date)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Later Snapshot
            </span>
          </label>
          <select
            value={snapshot2Index}
            onChange={(e) => {
              setSnapshot2Index(parseInt(e.target.value));
              setRightLoaded(false);
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-tb-accent focus:outline-none"
          >
            {snapshots.map((snapshot, index) => (
              <option key={snapshot.timestamp} value={index} disabled={index === snapshot1Index}>
                {formatDate(snapshot.date)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Time Gap Indicator */}
      <div className="flex items-center justify-center gap-4 mb-6 p-3 bg-gray-800/30 rounded-lg">
        <span className="text-sm text-gray-400">Time difference:</span>
        <span className="font-semibold text-white">
          {getTimeDifference(earlier.date, later.date)}
        </span>
      </div>
      
      {/* Comparison View */}
      <div 
        ref={containerRef}
        className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-700"
        style={{ minHeight: '500px' }}
      >
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-2 divide-x divide-gray-700">
            {/* Earlier */}
            <div className="relative">
              <div className="bg-red-500/10 px-3 py-2 text-center border-b border-gray-700">
                <span className="text-red-400 text-sm font-medium">{formatDate(earlier.date)}</span>
              </div>
              <div className="aspect-[4/3] relative bg-gray-900">
                {!leftLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 animate-spin text-tb-accent" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  </div>
                )}
                <iframe
                  src={getWaybackUrl(earlier)}
                  className={`w-full h-full ${leftLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setLeftLoaded(true)}
                  sandbox="allow-same-origin"
                  loading="lazy"
                />
              </div>
              <div className="p-2 text-center border-t border-gray-700">
                <a
                  href={getWaybackUrl(earlier)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-tb-accent hover:underline"
                >
                  Open in Wayback Machine →
                </a>
              </div>
            </div>
            
            {/* Later */}
            <div className="relative">
              <div className="bg-green-500/10 px-3 py-2 text-center border-b border-gray-700">
                <span className="text-green-400 text-sm font-medium">{formatDate(later.date)}</span>
              </div>
              <div className="aspect-[4/3] relative bg-gray-900">
                {!rightLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 animate-spin text-tb-accent" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  </div>
                )}
                <iframe
                  src={getWaybackUrl(later)}
                  className={`w-full h-full ${rightLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setRightLoaded(true)}
                  sandbox="allow-same-origin"
                  loading="lazy"
                />
              </div>
              <div className="p-2 text-center border-t border-gray-700">
                <a
                  href={getWaybackUrl(later)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-tb-accent hover:underline"
                >
                  Open in Wayback Machine →
                </a>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'slider' && (
          <div className="relative h-[500px]">
            {/* Later (background) */}
            <div className="absolute inset-0">
              <iframe
                src={getWaybackUrl(later)}
                className="w-full h-full"
                sandbox="allow-same-origin"
                loading="lazy"
              />
              <div className="absolute bottom-4 right-4 bg-green-500/80 text-white text-xs px-2 py-1 rounded">
                {formatDate(later.date)}
              </div>
            </div>
            
            {/* Earlier (clipped) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="relative w-full h-full" style={{ width: `${100 / (sliderPosition / 100)}%` }}>
                <iframe
                  src={getWaybackUrl(earlier)}
                  className="w-full h-full"
                  sandbox="allow-same-origin"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                {formatDate(earlier.date)}
              </div>
            </div>
            
            {/* Slider handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startPos = sliderPosition;
                
                const handleMouseMove = (e: MouseEvent) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const delta = ((e.clientX - startX) / rect.width) * 100;
                  setSliderPosition(Math.max(5, Math.min(95, startPos + delta)));
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {viewMode === 'overlay' && (
          <div className="relative h-[500px]">
            {/* Earlier (base) */}
            <div className="absolute inset-0">
              <iframe
                src={getWaybackUrl(earlier)}
                className="w-full h-full"
                sandbox="allow-same-origin"
                loading="lazy"
              />
            </div>
            
            {/* Later (overlay) */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{ opacity: overlayOpacity }}
            >
              <iframe
                src={getWaybackUrl(later)}
                className="w-full h-full"
                sandbox="allow-same-origin"
                loading="lazy"
              />
            </div>
            
            {/* Opacity control */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 rounded-lg p-4 flex items-center gap-4">
              <span className="text-xs text-red-400 whitespace-nowrap">{formatDate(earlier.date)}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-40 accent-tb-accent"
              />
              <span className="text-xs text-green-400 whitespace-nowrap">{formatDate(later.date)}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Navigation */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => {
            // Compare oldest vs newest
            setSnapshot1Index(snapshots.length - 1);
            setSnapshot2Index(0);
            setLeftLoaded(false);
            setRightLoaded(false);
          }}
          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-colors"
        >
          Compare Oldest vs Newest
        </button>
        <button
          onClick={() => {
            // Compare adjacent snapshots
            const mid = Math.floor(snapshots.length / 2);
            setSnapshot1Index(mid);
            setSnapshot2Index(mid - 1);
            setLeftLoaded(false);
            setRightLoaded(false);
          }}
          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-colors"
        >
          Compare Middle Snapshots
        </button>
      </div>
    </div>
  );
}

function getTimeDifference(date1: Date, date2: Date): string {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    if (remainingMonths > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    return `${years} year${years > 1 ? 's' : ''}`;
  }
}
