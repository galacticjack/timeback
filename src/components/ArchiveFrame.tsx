'use client';

import { useState, useRef, useEffect } from 'react';

interface ArchiveFrameProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a Wayback Machine archived page in a sandboxed iframe.
 * Shows loading state and handles errors gracefully.
 */
export default function ArchiveFrame({ src, alt, className = '', style }: ArchiveFrameProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    // Timeout after 15s
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
      }
    }, 15000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [src]);

  return (
    <div className={`relative bg-gray-100 overflow-hidden ${className}`} style={style}>
      {/* Loading state */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading archived page...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-gray-500">Could not load archive</p>
            <a 
              href={src} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
            >
              Open directly →
            </a>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={src}
        title={alt || 'Archived webpage'}
        className="w-full h-full border-0"
        sandbox="allow-same-origin"
        loading="lazy"
        onLoad={() => {
          setLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onError={() => {
          setLoading(false);
          setError(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        style={{ 
          pointerEvents: 'none',
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          width: '200%',
          height: '200%',
        }}
      />
    </div>
  );
}
