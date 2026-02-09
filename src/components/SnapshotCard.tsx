'use client';

import { useState, useMemo } from 'react';

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

// Get the archive URL for opening in Wayback Machine
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
  const num = parseInt(timestamp.substring(0, 8)) % 8;
  const gradients = [
    'from-blue-100 via-indigo-100 to-purple-100',
    'from-emerald-100 via-teal-100 to-cyan-100',
    'from-orange-100 via-red-100 to-pink-100',
    'from-violet-100 via-purple-100 to-fuchsia-100',
    'from-sky-100 via-blue-100 to-indigo-100',
    'from-rose-100 via-pink-100 to-red-100',
    'from-amber-100 via-yellow-100 to-orange-100',
    'from-cyan-100 via-teal-100 to-emerald-100',
  ];
  return gradients[num];
}

// Get era label based on year
function getEraLabel(date: Date): string {
  const year = date.getFullYear();
  if (year <= 2005) return 'Web 1.0';
  if (year <= 2010) return 'Web 2.0';
  if (year <= 2015) return 'Mobile Era';
  if (year <= 2020) return 'Modern Web';
  return 'Current';
}

export function SnapshotCard({ snapshot, isSelected, onClick, onCompare, onZoom, index }: SnapshotCardProps) {
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

  const archiveUrl = useMemo(
    () => snapshot.archiveUrl || getArchiveUrl(snapshot.timestamp, snapshot.url || snapshot.originalUrl || ''),
    [snapshot]
  );

  const faviconUrl = useMemo(() => getFaviconUrl(snapshot.url || snapshot.originalUrl || ''), [snapshot]);
  const gradient = useMemo(() => getGradientFromTimestamp(snapshot.timestamp), [snapshot.timestamp]);
  const eraLabel = useMemo(() => getEraLabel(snapshot.date), [snapshot.date]);

  // Domain name for display
  const domain = useMemo(() => {
    try {
      const url = (snapshot.url || snapshot.originalUrl || '');
      const fullUrl = url.startsWith('http') ? url : `http://${url}`;
      return new URL(fullUrl).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }, [snapshot]);

  // Favicon icon
  const faviconIcon = useMemo(() => {
    if (faviconError || !faviconUrl) {
      return (
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <button
      onClick={onClick}
      className={`group relative bg-white border rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-tb-accent focus:ring-offset-2 focus:ring-offset-white w-full text-left ${
        isSelected 
          ? 'border-tb-accent ring-2 ring-tb-accent/30 shadow-lg shadow-tb-accent/10' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50'
      }`}
    >
      {/* Card Thumbnail Area */}
      <div className={`aspect-[4/3] overflow-hidden relative bg-gradient-to-br ${gradient}`}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}></div>
        
        {/* Simulated browser window */}
        <div className="absolute inset-3 rounded-lg overflow-hidden shadow-lg">
          {/* Browser chrome */}
          <div className="bg-gray-100 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2 border-b border-gray-200">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-white rounded px-2 py-0.5 text-[8px] text-gray-500 truncate border border-gray-200">
              {domain}
            </div>
          </div>
          
          {/* Page content area */}
          <div className="bg-white/80 backdrop-blur-sm flex-1 p-3 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100% - 24px)' }}>
            {/* Favicon */}
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {faviconIcon}
            </div>
            
            {/* Date */}
            <span className="text-gray-700 text-[10px] font-medium">{formatFullDate(snapshot.date)}</span>
            
            {/* Era tag */}
            <span className="mt-1 text-[8px] text-gray-400 uppercase tracking-wider">{eraLabel}</span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
          <div className="flex gap-2">
            {/* Open in Wayback */}
            <a
              href={archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-white/80 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-colors shadow-sm"
              title="Open in Wayback Machine"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="bg-tb-accent/90 hover:bg-tb-accent backdrop-blur-sm text-white text-[10px] font-medium px-3 py-2 rounded-full transition-colors flex items-center gap-1 shadow-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
                Compare
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Date Label */}
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">{formatDate(snapshot.date)}</span>
        <span className="text-[10px] text-gray-400">{eraLabel}</span>
      </div>
      
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-tb-accent rounded-full shadow-lg shadow-tb-accent/50 animate-pulse z-20"></div>
      )}
    </button>
  );
}
