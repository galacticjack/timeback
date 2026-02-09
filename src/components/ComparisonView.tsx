'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ComparisonAnalysis } from './ComparisonAnalysis';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

interface ComparisonViewProps {
  snapshots: Snapshot[];
  onBack: () => void;
  initialSnapshot1?: number;
  initialSnapshot2?: number;
}

type ViewMode = 'side-by-side' | 'slider' | 'overlay' | 'diff';

export function ComparisonView({ snapshots, onBack, initialSnapshot1, initialSnapshot2 }: ComparisonViewProps) {
  const [snapshot1Index, setSnapshot1Index] = useState(initialSnapshot1 ?? 0);
  const [snapshot2Index, setSnapshot2Index] = useState(initialSnapshot2 ?? Math.min(snapshots.length - 1, 5));
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [leftLoaded, setLeftLoaded] = useState(false);
  const [rightLoaded, setRightLoaded] = useState(false);
  const [diffIntensity, setDiffIntensity] = useState(0.5);
  const [activePanel, setActivePanel] = useState<'left' | 'right'>('left');
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

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBack();
      return;
    }
    
    if (e.key === 'ArrowLeft') {
      if (activePanel === 'left' && snapshot1Index < snapshots.length - 1) {
        setSnapshot1Index(prev => prev + 1);
        setLeftLoaded(false);
      } else if (activePanel === 'right' && snapshot2Index < snapshots.length - 1) {
        setSnapshot2Index(prev => prev + 1);
        setRightLoaded(false);
      }
    }
    
    if (e.key === 'ArrowRight') {
      if (activePanel === 'left' && snapshot1Index > 0) {
        setSnapshot1Index(prev => prev - 1);
        setLeftLoaded(false);
      } else if (activePanel === 'right' && snapshot2Index > 0) {
        setSnapshot2Index(prev => prev - 1);
        setRightLoaded(false);
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      setActivePanel(prev => prev === 'left' ? 'right' : 'left');
    }
    
    // View mode shortcuts
    if (e.key === '1') setViewMode('side-by-side');
    if (e.key === '2') setViewMode('slider');
    if (e.key === '3') setViewMode('overlay');
    if (e.key === '4') setViewMode('diff');
  }, [activePanel, snapshot1Index, snapshot2Index, snapshots.length, onBack]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Swap snapshots
  const swapSnapshots = () => {
    const temp = snapshot1Index;
    setSnapshot1Index(snapshot2Index);
    setSnapshot2Index(temp);
    setLeftLoaded(false);
    setRightLoaded(false);
  };
  
  return (
    <div className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 border border-gray-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            title="Back to Rewind (Esc)"
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
            title="Side by Side (1)"
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition ${
              viewMode === 'slider' 
                ? 'bg-tb-accent text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Slider (2)"
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
            title="Overlay (3)"
          >
            Overlay
          </button>
          <button
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition ${
              viewMode === 'diff' 
                ? 'bg-tb-accent text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Visual Diff (4)"
          >
            <span className="flex items-center gap-1">
              Diff
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 rounded">NEW</span>
            </span>
          </button>
        </div>
      </div>
      
      {/* Snapshot Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div 
          className={`transition-all rounded-lg ${activePanel === 'left' ? 'ring-2 ring-tb-accent ring-offset-2 ring-offset-gray-900' : ''}`}
          onClick={() => setActivePanel('left')}
        >
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Earlier Snapshot
              {activePanel === 'left' && <span className="text-xs text-tb-accent">(← → to navigate)</span>}
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
        
        {/* Swap Button */}
        <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:block" style={{ marginTop: '1.75rem' }}>
          <button
            onClick={swapSnapshots}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors border border-gray-600"
            title="Swap snapshots"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>
        
        <div 
          className={`transition-all rounded-lg ${activePanel === 'right' ? 'ring-2 ring-tb-accent ring-offset-2 ring-offset-gray-900' : ''}`}
          onClick={() => setActivePanel('right')}
        >
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Later Snapshot
              {activePanel === 'right' && <span className="text-xs text-tb-accent">(← → to navigate)</span>}
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
        <span className="text-gray-600">•</span>
        <span className="text-xs text-gray-500">
          Tab to switch panels • 1-4 for views • Esc to exit
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {viewMode === 'diff' && (
          <div className="relative h-[500px]">
            {/* Side by side with diff overlay */}
            <div className="grid grid-cols-2 h-full divide-x divide-gray-700">
              {/* Earlier with diff highlight */}
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 bg-red-500/10 px-3 py-2 text-center border-b border-gray-700 z-10">
                  <span className="text-red-400 text-sm font-medium">{formatDate(earlier.date)}</span>
                </div>
                <iframe
                  src={getWaybackUrl(earlier)}
                  className="w-full h-full pt-10"
                  sandbox="allow-same-origin"
                  loading="lazy"
                />
                {/* Diff overlay effect - areas that changed are highlighted */}
                <div 
                  className="absolute inset-0 pointer-events-none mt-10"
                  style={{
                    background: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      rgba(239, 68, 68, ${diffIntensity * 0.1}) 10px,
                      rgba(239, 68, 68, ${diffIntensity * 0.1}) 20px
                    )`,
                    mixBlendMode: 'multiply'
                  }}
                />
              </div>
              
              {/* Later with diff highlight */}
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 bg-green-500/10 px-3 py-2 text-center border-b border-gray-700 z-10">
                  <span className="text-green-400 text-sm font-medium">{formatDate(later.date)}</span>
                </div>
                <iframe
                  src={getWaybackUrl(later)}
                  className="w-full h-full pt-10"
                  sandbox="allow-same-origin"
                  loading="lazy"
                />
                {/* Diff overlay effect */}
                <div 
                  className="absolute inset-0 pointer-events-none mt-10"
                  style={{
                    background: `repeating-linear-gradient(
                      -45deg,
                      transparent,
                      transparent 10px,
                      rgba(34, 197, 94, ${diffIntensity * 0.1}) 10px,
                      rgba(34, 197, 94, ${diffIntensity * 0.1}) 20px
                    )`,
                    mixBlendMode: 'multiply'
                  }}
                />
              </div>
            </div>
            
            {/* Diff intensity control */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 rounded-lg p-4 flex items-center gap-4 border border-gray-700">
              <span className="text-xs text-gray-400">Diff intensity:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={diffIntensity}
                onChange={(e) => setDiffIntensity(parseFloat(e.target.value))}
                className="w-32 accent-tb-accent"
              />
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-500/50 rounded"></span>
                  <span className="text-red-400">Removed</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-500/50 rounded"></span>
                  <span className="text-green-400">Added</span>
                </span>
              </div>
            </div>

            {/* Sync scroll indicator */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
              💡 Tip: Scroll both panels to compare sections
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Navigation */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button
          onClick={() => {
            // Compare oldest vs newest
            setSnapshot1Index(snapshots.length - 1);
            setSnapshot2Index(0);
            setLeftLoaded(false);
            setRightLoaded(false);
          }}
          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Oldest vs Newest
        </button>
        <button
          onClick={() => {
            // Compare year-over-year (find snapshots ~1 year apart)
            const oneYearAgo = new Date(snapshots[0].date);
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            const closestIndex = snapshots.findIndex(s => s.date <= oneYearAgo);
            if (closestIndex > 0) {
              setSnapshot1Index(closestIndex);
              setSnapshot2Index(0);
              setLeftLoaded(false);
              setRightLoaded(false);
            }
          }}
          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Year Over Year
        </button>
        <button
          onClick={() => {
            // Compare adjacent snapshots (biggest change detection)
            const mid = Math.floor(snapshots.length / 2);
            setSnapshot1Index(mid);
            setSnapshot2Index(mid - 1);
            setLeftLoaded(false);
            setRightLoaded(false);
          }}
          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Middle Snapshots
        </button>
        <button
          onClick={swapSnapshots}
          className="px-4 py-2 bg-tb-accent/20 hover:bg-tb-accent/30 text-tb-accent rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Swap
        </button>
      </div>

      {/* AI Comparison Analysis */}
      <ComparisonAnalysis
        url={earlier.url}
        earlierDate={formatDate(earlier.date)}
        laterDate={formatDate(later.date)}
        archiveUrl1={getWaybackUrl(earlier)}
        archiveUrl2={getWaybackUrl(later)}
      />
    </div>
  );
}

function getTimeDifference(date1: Date, date2: Date): string {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
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
