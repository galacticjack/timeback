'use client';

import { useState, useEffect, useRef } from 'react';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

interface VisualRewindProps {
  snapshots: Snapshot[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

// Helper to get year markers for the timeline
function getYearMarkers(snapshots: Snapshot[]): string[] {
  const years = new Set<number>();
  snapshots.forEach(s => years.add(s.date.getFullYear()));
  const sortedYears = Array.from(years).sort((a, b) => a - b);
  
  // Return up to 5 evenly spaced years
  if (sortedYears.length <= 5) return sortedYears.map(String);
  
  const step = Math.ceil(sortedYears.length / 5);
  return sortedYears.filter((_, i) => i % step === 0).map(String);
}

export function VisualRewind({ snapshots, currentIndex, onIndexChange }: VisualRewindProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentSnapshot = snapshots[currentIndex];
  
  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onIndexChange((currentIndex + 1) % snapshots.length);
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, snapshots.length, onIndexChange]);
  
  // Reset image state when snapshot changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentIndex]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onIndexChange(Math.max(0, currentIndex - 1));
      } else if (e.key === 'ArrowRight') {
        onIndexChange(Math.min(snapshots.length - 1, currentIndex + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, snapshots.length, onIndexChange]);
  
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Visual Rewind</h2>
          <p className="text-sm text-gray-500">
            {formatDate(currentSnapshot.date)} · Snapshot {currentIndex + 1} of {snapshots.length}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          {/* Open in Wayback */}
          <a
            href={getWaybackUrl(currentSnapshot)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-tb-accent/10 hover:bg-tb-accent/20 text-tb-accent rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Full Page
          </a>
        </div>
      </div>
      
      {/* Preview Window */}
      <div className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4 md:mb-6">
        {/* Browser Chrome */}
        <div className="bg-gray-100 px-3 md:px-4 py-2 flex items-center gap-2 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-red-400"></div>
            <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 ml-2 md:ml-4 min-w-0">
            <div className="bg-white rounded px-2 md:px-3 py-1 text-[10px] md:text-xs text-gray-500 truncate border border-gray-200">
              {currentSnapshot.url}
            </div>
          </div>
        </div>
        
        {/* Screenshot/Iframe */}
        <div className="relative aspect-[4/3] md:aspect-[16/10] bg-gray-50">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-8 h-8 animate-spin text-tb-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span className="text-sm text-gray-500">Loading snapshot...</span>
              </div>
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-4xl mb-4">🖼️</div>
                <p className="text-gray-500 mb-4">Preview not available</p>
                <a
                  href={getWaybackUrl(currentSnapshot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-tb-accent hover:bg-tb-accent-light text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View on Wayback Machine
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={getWaybackUrl(currentSnapshot)}
              className={`w-full h-full ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sandbox="allow-same-origin"
              loading="lazy"
            />
          )}
        </div>
      </div>
      
      {/* Timeline Slider */}
      <div className="space-y-2 md:space-y-3">
        {/* Year markers - hidden on very small screens */}
        <div className="hidden sm:flex justify-between px-2">
          {getYearMarkers(snapshots).map((year, i) => (
            <span key={i} className="text-xs font-medium text-gray-500">{year}</span>
          ))}
        </div>
        
        <div className="flex justify-between text-[10px] md:text-xs text-gray-400 px-1">
          <span>{formatDate(snapshots[snapshots.length - 1].date)}</span>
          <span className="text-gray-400 text-center flex-1 hidden sm:block">
            Drag to navigate through time
          </span>
          <span>{formatDate(snapshots[0].date)}</span>
        </div>
        
        <div className="relative py-2">
          <input
            type="range"
            min={0}
            max={snapshots.length - 1}
            value={currentIndex}
            onChange={(e) => onIndexChange(parseInt(e.target.value))}
            className="w-full h-2 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb touch-none"
          />
          
          {/* Timeline Markers - reduced on mobile */}
          <div className="absolute top-2 left-0 right-0 h-2 flex items-center pointer-events-none">
            {snapshots.filter((_, i) => i % Math.ceil(snapshots.length / 30) === 0 || i === currentIndex).map((_, index) => {
              const actualIndex = index * Math.ceil(snapshots.length / 30);
              return (
                <div
                  key={actualIndex}
                  className={`absolute w-1 h-1 rounded-full ${
                    actualIndex === currentIndex ? 'bg-tb-accent w-2 h-2' : 'bg-gray-400'
                  }`}
                  style={{ left: `${(actualIndex / (snapshots.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}
                />
              );
            })}
          </div>
        </div>
        
        {/* Quick Jump Buttons - responsive layout */}
        <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-2 md:mt-4">
          <button
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-2 md:p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors active:scale-95"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => onIndexChange(snapshots.length - 1)}
            className="px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm transition-colors active:scale-95"
          >
            Oldest
          </button>
          
          <button
            onClick={() => onIndexChange(0)}
            className="px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm transition-colors active:scale-95"
          >
            Newest
          </button>
          
          <button
            onClick={() => onIndexChange(Math.min(snapshots.length - 1, currentIndex + 1))}
            disabled={currentIndex === snapshots.length - 1}
            className="p-2 md:p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors active:scale-95"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Mobile swipe hint */}
        <p className="text-center text-xs text-gray-400 mt-2 md:hidden">
          Swipe slider or tap arrows to navigate
        </p>
      </div>
    </div>
  );
}
