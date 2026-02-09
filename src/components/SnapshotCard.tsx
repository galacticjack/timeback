'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
  archiveUrl?: string;
  originalUrl?: string;
}

interface SnapshotCardProps {
  snapshot: Snapshot;
  isSelected: boolean;
  onClick: () => void;
  onCompare?: () => void;
  onZoom?: () => void;
  index?: number;
}

// Get the archive URL for iframe preview
function getArchiveUrl(timestamp: string, url: string): string {
  return `https://web.archive.org/web/${timestamp}/${url}`;
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

export function SnapshotCard({ snapshot, isSelected, onClick, onCompare, onZoom, index }: SnapshotCardProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  const archiveUrl = useMemo(
    () => snapshot.archiveUrl || getArchiveUrl(snapshot.timestamp, snapshot.url || snapshot.originalUrl || ''),
    [snapshot]
  );

  const faviconUrl = useMemo(() => getFaviconUrl(snapshot.url || snapshot.originalUrl || ''), [snapshot]);
  const gradient = useMemo(() => getGradientFromTimestamp(snapshot.timestamp), [snapshot.timestamp]);

  // Intersection Observer for lazy loading iframes
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Timeout: if iframe doesn't load in 8s, show fallback
  useEffect(() => {
    if (!isInView || iframeLoaded || iframeError) return;
    const timer = setTimeout(() => {
      if (!iframeLoaded) setIframeError(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isInView, iframeLoaded, iframeError]);

  // Handle zoom click
  const handleZoomClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onZoom?.();
  }, [onZoom]);

  // Favicon icon for fallback
  const faviconIcon = useMemo(() => {
    if (faviconError || !faviconUrl) {
      return (
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    }
    return (
      <img 
        src={faviconUrl} 
        alt="" 
        className="w-8 h-8"
        onError={() => setFaviconError(true)}
      />
    );
  }, [faviconUrl, faviconError]);

  return (
    <div ref={containerRef}>
      <button
        onClick={onClick}
        className={`group relative bg-gray-800/50 border rounded-xl overflow-hidden transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-tb-accent focus:ring-offset-2 focus:ring-offset-gray-900 w-full ${
          isSelected 
            ? 'border-tb-accent ring-2 ring-tb-accent/30' 
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        {/* Thumbnail Preview */}
        <div className={`aspect-[4/3] overflow-hidden relative ${!iframeLoaded || iframeError ? `bg-gradient-to-br ${gradient}` : 'bg-gray-900'}`}>
          
          {/* Iframe preview - scaled down to create thumbnail effect */}
          {isInView && !iframeError && (
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                src={archiveUrl}
                title={`Snapshot from ${formatDate(snapshot.date)}`}
                className="absolute top-0 left-0 border-0 pointer-events-none"
                style={{
                  width: '1280px',
                  height: '960px',
                  transform: 'scale(0.19)',
                  transformOrigin: 'top left',
                }}
                sandbox="allow-same-origin"
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeError(true)}
              />
              {/* Loading overlay */}
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}

          {/* Fallback content (when iframe fails or hasn't loaded) */}
          {(iframeError || !isInView) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
              
              {/* Favicon */}
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform z-10">
                {faviconIcon}
              </div>

              {/* Date badge */}
              <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 z-10">
                <span className="text-white/90 text-xs font-medium">{formatFullDate(snapshot.date)}</span>
              </div>
            </div>
          )}

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 z-20">
            {/* Preview link */}
            <a
              href={archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
              title="Open in Wayback Machine"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            {/* Compare button */}
            {onCompare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare();
                }}
                className="bg-tb-accent/90 hover:bg-tb-accent text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
                Compare
              </button>
            )}
          </div>

          {/* Mobile touch indicator */}
          <div className="absolute bottom-2 right-2 md:hidden z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-1">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Date Label */}
        <div className="p-2 text-center">
          <span className="text-xs font-medium text-gray-300">{formatDate(snapshot.date)}</span>
        </div>
        
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-tb-accent rounded-full shadow-lg shadow-tb-accent/50 animate-pulse z-30"></div>
        )}
      </button>
    </div>
  );
}
