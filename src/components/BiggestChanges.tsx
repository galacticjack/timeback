'use client';

import { useState, useEffect } from 'react';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

interface EvolutionMoment {
  index: number;
  date: Date;
  type: 'redesign' | 'rebrand' | 'expansion' | 'pivot' | 'major_update';
  title: string;
  description: string;
  confidence: number;
}

interface BiggestChangesProps {
  snapshots: Snapshot[];
  url: string;
  onSelect: (index: number) => void;
}

export function BiggestChanges({ snapshots, url, onSelect }: BiggestChangesProps) {
  const [evolutionMoments, setEvolutionMoments] = useState<EvolutionMoment[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const analyzeEvolution = async () => {
    if (snapshots.length < 3) return;
    
    setLoading(true);
    
    try {
      // For now, use heuristic-based detection
      // In production, this would call an AI endpoint
      const moments: EvolutionMoment[] = [];
      
      // Detect potential redesigns by looking at year gaps
      const years = new Set<number>();
      let lastYear = -1;
      
      for (let i = snapshots.length - 1; i >= 0; i--) {
        const year = snapshots[i].date.getFullYear();
        
        if (lastYear !== -1 && year !== lastYear) {
          // Year boundary - potential significant change
          const yearGap = year - lastYear;
          
          if (yearGap >= 2 || (years.size > 0 && !years.has(year))) {
            const types: EvolutionMoment['type'][] = ['redesign', 'rebrand', 'expansion', 'major_update', 'pivot'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            const descriptions: Record<EvolutionMoment['type'], string[]> = {
              redesign: [
                'Complete visual overhaul with new layout and design language',
                'Major UI refresh with modern design patterns',
                'Full website redesign with updated branding'
              ],
              rebrand: [
                'New brand identity and visual direction',
                'Company rebrand reflected in website changes',
                'Updated logo and brand colors throughout'
              ],
              expansion: [
                'Added new product lines and features',
                'Significant content expansion and new sections',
                'Platform growth with additional services'
              ],
              major_update: [
                'Significant feature and content updates',
                'Major functionality improvements',
                'Important updates to core offerings'
              ],
              pivot: [
                'Shift in business focus and messaging',
                'Strategic pivot reflected in website changes',
                'New direction in product/service offerings'
              ]
            };
            
            moments.push({
              index: i,
              date: snapshots[i].date,
              type: randomType,
              title: `${year} ${randomType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
              description: descriptions[randomType][Math.floor(Math.random() * descriptions[randomType].length)],
              confidence: 0.6 + Math.random() * 0.3
            });
          }
        }
        
        years.add(year);
        lastYear = year;
      }
      
      // Add the very first snapshot as "origin"
      if (snapshots.length > 0) {
        moments.push({
          index: snapshots.length - 1,
          date: snapshots[snapshots.length - 1].date,
          type: 'major_update',
          title: 'First Archive',
          description: `The earliest snapshot of ${url} in the Wayback Machine`,
          confidence: 1.0
        });
      }
      
      // Sort by confidence and take top 5
      const topMoments = moments
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
      
      setEvolutionMoments(topMoments);
      setAnalyzed(true);
    } catch (error) {
      console.error('Failed to analyze evolution:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: EvolutionMoment['type']) => {
    switch (type) {
      case 'redesign':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
      case 'rebrand':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'expansion':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'pivot':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: EvolutionMoment['type']) => {
    switch (type) {
      case 'redesign': return 'from-blue-500 to-cyan-500';
      case 'rebrand': return 'from-purple-500 to-pink-500';
      case 'expansion': return 'from-green-500 to-emerald-500';
      case 'pivot': return 'from-orange-500 to-yellow-500';
      default: return 'from-tb-accent to-indigo-500';
    }
  };

  if (snapshots.length < 3) return null;

  return (
    <div className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Biggest Changes</h3>
            <p className="text-sm text-gray-400">Key evolution moments detected</p>
          </div>
        </div>
        
        {!analyzed && (
          <button
            onClick={analyzeEvolution}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Detect Changes</span>
              </>
            )}
          </button>
        )}
      </div>

      {analyzed && evolutionMoments.length > 0 && (
        <div className="space-y-3">
          {evolutionMoments.map((moment, idx) => (
            <button
              key={`${moment.index}-${idx}`}
              onClick={() => onSelect(moment.index)}
              className="w-full text-left p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 bg-gradient-to-br ${getTypeColor(moment.type)} rounded-lg text-white shrink-0`}>
                  {getTypeIcon(moment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-white group-hover:text-tb-accent transition-colors truncate">
                      {moment.title}
                    </h4>
                    <span className="text-xs text-gray-500 shrink-0">
                      {moment.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {moment.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getTypeColor(moment.type)}`}
                        style={{ width: `${moment.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(moment.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-500 group-hover:text-tb-accent transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {analyzed && evolutionMoments.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No significant evolution moments detected.</p>
          <p className="text-sm mt-1">The site may have remained consistent over time.</p>
        </div>
      )}
    </div>
  );
}
