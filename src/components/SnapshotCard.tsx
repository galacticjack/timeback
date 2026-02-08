'use client';

import { useState, useCallback, useMemo } from 'react';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

interface SnapshotCardProps {
  snapshot: Snapshot;
  isSelected: boolean;
  onClick: () => void;
  onCompare?: () => void;
  index?: number;
}

// Get thumbnail URL - uses Wayback's thumbnail service when available
function getThumbnailUrl(timestamp: string, url: string): string {
  // Wayback Machine stores thumbnails at this endpoint for pages saved with screenshot option
  // This may not exist for all pages, so we need a fallback
  return `https://web.archive.org/web/${timestamp}id_/${url}`;
}

// Fallback: Google's favicon service
function getFaviconUrl(url: string): string {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `http://${url}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return '';
  }
}

// Generate a gradient based on the timestamp for visual variety
function getGradientFromTimestamp(timestamp: string): string {
  const num = parseInt(timestamp.substring(0, 8)) % 6;
  const gradients = [
    'from-blue-900 via-indigo-800 to-purple-900',
    'from-emerald-900 via-teal-800 to-cyan-900',
    'from-orange-900 via-red-800 to-pink-900',
    'from-violet-900 via-purple-800 to-fuchsia-900',
    'from-sky-900 via-blue-800 to-indigo-900',
    'from-rose-900 via-pink-800 to-red-900',
  ];
  return gradients[num];
}

type ThumbnailState = 'loading' | 'loaded' | 'fallback';

export function SnapshotCard({ snapshot, isSelected, onClick, onCompare, index }: SnapshotCardProps) {
  const [thumbnailState, setThumbnailState] = useState<ThumbnailState>('loading');
  const [faviconError, setFaviconError] = useState(false);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Try to load the actual thumbnail
  const thumbnailUrl = useMemo(
    () => getThumbnailUrl(snapshot.timestamp, snapshot.url),
    [snapshot.timestamp, snapshot.url]
  );

  const faviconUrl = useMemo(() => getFaviconUrl(snapshot.url), [snapshot.url]);
  const gradient = useMemo(() => getGradientFromTimestamp(snapshot.timestamp), [snapshot.timestamp]);

  // Extract domain name for display
  const domain = useMemo(() => {
    try {
      const url = snapshot.url.startsWith('http') ? snapshot.url : `http://${snapshot.url}`;
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return snapshot.url;
    }
  }, [snapshot.url]);

  const handleThumbnailLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Check if the loaded image is valid (not a placeholder or error page)
    if (img.naturalWidth > 10 && img.naturalHeight > 10) {
      setThumbnailState('loaded');
    } else {
      setThumbnailState('fallback');
    }
  }, []);

  const handleThumbnailError = useCallback(() => {
    setThumbnailState('fallback');
  }, []);

  const handleFaviconError = useCallback(() => {
    setFaviconError(true);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`group relative bg-gray-800/50 border rounded-xl overflow-hidden transition-all hover:scale-105 ${
        isSelected 
          ? 'border-tb-accent ring-2 ring-tb-accent/30' 
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* Thumbnail Preview */}
      <div className={`aspect-[4/3] overflow-hidden relative ${thumbnailState === 'fallback' ? `bg-gradient-to-br ${gradient}` : 'bg-gray-900'}`}>
        
        {/* Loading state */}
        {thumbnailState === 'loading' && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-5 h-5 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        )}

        {/* Try to load actual thumbnail - hidden until loaded */}
        <img
          src={thumbnailUrl}
          alt={`Snapshot from ${formatDate(snapshot.date)}`}
          className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
            thumbnailState === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
          loading="lazy"
          onLoad={handleThumbnailLoad}
          onError={handleThumbnailError}
        />

        {/* Fallback: Stylized placeholder with favicon */}
        {thumbnailState === 'fallback' && (
          <>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
              {/* Favicon */}
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                {!faviconError && faviconUrl ? (
                  <img 
                    src={faviconUrl} 
                    alt="" 
                    className="w-8 h-8"
                    onError={handleFaviconError}
                  />
                ) : (
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                )}
              </div>

              {/* Date badge */}
              <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-white/90 text-xs font-medium">{formatFullDate(snapshot.date)}</span>
              </div>
            </div>
          </>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          {onCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare();
              }}
              className="bg-tb-accent/90 hover:bg-tb-accent text-white text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              Compare
            </button>
          )}
        </div>
      </div>
      
      {/* Date Label */}
      <div className="p-2 text-center">
        <span className="text-xs font-medium text-gray-300">{formatDate(snapshot.date)}</span>
      </div>
      
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-tb-accent rounded-full shadow-lg shadow-tb-accent/50"></div>
      )}
    </button>
  );
}
