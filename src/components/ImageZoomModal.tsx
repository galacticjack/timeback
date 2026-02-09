'use client';

import { useEffect, useCallback, useState } from 'react';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

interface ImageZoomModalProps {
  snapshot: Snapshot | null;
  onClose: () => void;
}

export function ImageZoomModal({ snapshot, onClose }: ImageZoomModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);
  
  // Keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.25, 3));
    if (e.key === '-') setScale(s => Math.max(s - 0.25, 0.5));
    if (e.key === '0') setScale(1);
  }, [onClose]);

  useEffect(() => {
    if (snapshot) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [snapshot, handleKeyDown]);

  // Reset state when snapshot changes
  useEffect(() => {
    if (snapshot) {
      setLoading(true);
      setError(false);
      setScale(1);
    }
  }, [snapshot?.timestamp]);

  if (!snapshot) return null;

  const getWaybackUrl = () => {
    return `https://web.archive.org/web/${snapshot.timestamp}/${snapshot.url}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-full transition-colors z-10"
        title="Close (Esc)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header info */}
      <div className="absolute top-4 left-4 bg-gray-800/80 rounded-lg px-4 py-2 flex items-center gap-4">
        <span className="text-white font-medium">{formatDate(snapshot.date)}</span>
        <span className="text-gray-400 text-sm hidden md:inline">{snapshot.url}</span>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/80 rounded-lg px-4 py-2 flex items-center gap-3">
        <button
          onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Zoom out (-)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-sm text-gray-300 min-w-[4rem] text-center">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale(s => Math.min(s + 0.25, 3))}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="Zoom in (+)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <div className="w-px h-5 bg-gray-600"></div>
        <button
          onClick={() => setScale(1)}
          className="p-1 hover:bg-gray-700 rounded transition-colors text-sm text-gray-300"
          title="Reset zoom (0)"
        >
          Reset
        </button>
        <div className="w-px h-5 bg-gray-600"></div>
        <a
          href={getWaybackUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-tb-accent hover:text-tb-accent-light text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="hidden md:inline">Open in Wayback</span>
        </a>
      </div>

      {/* Content container with scroll */}
      <div className="w-full h-full flex items-center justify-center overflow-auto p-16">
        <div 
          className="relative max-w-full max-h-full transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Loading skeleton */}
          {loading && !error && (
            <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center min-w-[600px] min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-10 h-10 animate-spin text-tb-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span className="text-gray-400 text-sm">Loading full snapshot...</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-gray-800 rounded-lg p-12 text-center min-w-[400px]">
              <div className="text-5xl mb-4">🖼️</div>
              <p className="text-gray-400 mb-4">Preview not available</p>
              <a
                href={getWaybackUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-tb-accent hover:bg-tb-accent-light rounded-lg font-medium transition-colors"
              >
                View on Wayback Machine
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {/* Iframe with full snapshot */}
          {!error && (
            <div 
              className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
              style={{ width: '1200px', height: '800px' }}
            >
              <iframe
                src={getWaybackUrl()}
                className="w-full h-full"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
