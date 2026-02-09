'use client';

import { useState } from 'react';
import ArchiveFrame from './ArchiveFrame';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  archiveUrl?: string;
  originalUrl?: string;
  date: Date;
}

interface CompareToNowProps {
  snapshots: Snapshot[];
  url: string;
  onCompare: (oldestIndex: number) => void;
}

export function CompareToNow({ snapshots, url, onCompare }: CompareToNowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (snapshots.length < 2) return null;
  
  const oldest = snapshots[snapshots.length - 1];
  const newest = snapshots[0];
  
  const yearSpan = newest.date.getFullYear() - oldest.date.getFullYear();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-cyan-50 border border-purple-200 rounded-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl shrink-0">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              See {yearSpan}+ Years of Evolution
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Compare <span className="text-purple-600 font-medium">{formatDate(oldest.date)}</span> → <span className="text-cyan-600 font-medium">{formatDate(newest.date)}</span>
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onCompare(snapshots.length - 1)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 justify-center"
        >
          <span>Compare Now</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="relative rounded-lg overflow-hidden border border-purple-200">
            <div className="absolute top-0 left-0 right-0 bg-purple-100 text-purple-700 text-xs py-1 px-2 text-center z-10">
              {formatDate(oldest.date)}
            </div>
            <ArchiveFrame
              src={oldest.screenshotUrl}
              alt={`${url} in ${oldest.date.getFullYear()}`}
              className="w-full aspect-video"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden border border-cyan-200">
            <div className="absolute top-0 left-0 right-0 bg-cyan-100 text-cyan-700 text-xs py-1 px-2 text-center z-10">
              {formatDate(newest.date)}
            </div>
            <ArchiveFrame
              src={newest.screenshotUrl}
              alt={`${url} in ${newest.date.getFullYear()}`}
              className="w-full aspect-video"
            />
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-4 text-center text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1"
      >
        {isExpanded ? 'Hide Preview' : 'Preview Changes'}
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
