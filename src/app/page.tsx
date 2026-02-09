'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { VisualRewind } from '@/components/VisualRewind';
import { AIInsights } from '@/components/AIInsights';
import { SnapshotCard } from '@/components/SnapshotCard';
import { ComparisonView } from '@/components/ComparisonView';
import { ImageZoomModal } from '@/components/ImageZoomModal';
import { PopularSites } from '@/components/PopularSites';
import { EmailCapture } from '@/components/EmailCapture';
import { CompareToNow } from '@/components/CompareToNow';
import { BiggestChanges } from '@/components/BiggestChanges';
import { SocialShare } from '@/components/SocialShare';
import { UseCases, Testimonials } from '@/components/UseCases';
import { ViewCounter } from '@/components/Analytics';
import { useShareUrl } from '@/hooks/useShareUrl';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

type ViewMode = 'rewind' | 'compare';

interface CompareSelection {
  snapshot1?: number;
  snapshot2?: number;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('rewind');
  const [compareSelection, setCompareSelection] = useState<CompareSelection>({});
  const [zoomSnapshot, setZoomSnapshot] = useState<Snapshot | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { parseUrl, updateUrl, copyShareUrl } = useShareUrl();

  // Parse URL params on mount
  useEffect(() => {
    const state = parseUrl();
    if (state.url) {
      fetchSnapshots(state.url).then(() => {
        if (state.snapshot1 !== undefined) setCurrentIndex(state.snapshot1);
        if (state.viewMode === 'compare' && state.snapshot1 !== undefined && state.snapshot2 !== undefined) {
          setCompareSelection({
            snapshot1: state.snapshot1,
            snapshot2: state.snapshot2,
          });
          setViewMode('compare');
        }
      });
    }
    setInitialized(true);
  }, []);

  // Update URL when state changes
  useEffect(() => {
    if (!initialized || !url) return;
    
    updateUrl({
      url,
      snapshot1: viewMode === 'compare' ? compareSelection.snapshot1 : currentIndex,
      snapshot2: viewMode === 'compare' ? compareSelection.snapshot2 : undefined,
      viewMode,
    });
  }, [url, currentIndex, viewMode, compareSelection, initialized, updateUrl]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape' && zoomSnapshot) {
        setZoomSnapshot(null);
        return;
      }

      if (e.key === 'Escape' && viewMode === 'compare') {
        setViewMode('rewind');
        setCompareSelection({});
        return;
      }

      // Arrow key navigation in rewind mode
      if (viewMode === 'rewind' && snapshots.length > 0) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentIndex(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCurrentIndex(prev => Math.min(snapshots.length - 1, prev + 1));
        } else if (e.key === 'Home') {
          e.preventDefault();
          setCurrentIndex(snapshots.length - 1); // Oldest
        } else if (e.key === 'End') {
          e.preventDefault();
          setCurrentIndex(0); // Newest
        }
      }

      // Quick mode toggle
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && snapshots.length > 0) {
        setViewMode(prev => prev === 'rewind' ? 'compare' : 'rewind');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snapshots.length, viewMode, zoomSnapshot]);

  const fetchSnapshots = async (searchUrl: string) => {
    setLoading(true);
    setError('');
    setSnapshots([]);
    setInsights(null);
    
    try {
      let cleanUrl = searchUrl.trim();
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = cleanUrl.replace(/^(https?:\/\/)?/, '');
      }
      
      const response = await fetch(`/api/snapshots?url=${encodeURIComponent(cleanUrl)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch snapshots');
      }
      
      const data = await response.json();
      
      if (!data.snapshots || data.snapshots.length === 0) {
        setError('No snapshots found for this URL. Try a popular website.');
        setLoading(false);
        return;
      }
      
      const parsedSnapshots: Snapshot[] = data.snapshots.map((snap: {
        timestamp: string;
        originalUrl: string;
        screenshotUrl: string;
        year: number;
        month: number;
        day: number;
      }) => ({
        timestamp: snap.timestamp,
        url: snap.originalUrl,
        screenshotUrl: snap.screenshotUrl,
        date: new Date(`${snap.year}-${String(snap.month).padStart(2, '0')}-${String(snap.day).padStart(2, '0')}`),
      }));
      
      setSnapshots(parsedSnapshots);
      setCurrentIndex(0);
      setUrl(cleanUrl);
      
    } catch (err) {
      setError('Failed to fetch snapshots. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (snapshots.length < 2) return;
    
    setInsightsLoading(true);
    
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          snapshotCount: snapshots.length,
          dateRange: {
            oldest: snapshots[snapshots.length - 1].date.toISOString(),
            newest: snapshots[0].date.toISOString(),
          },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleShare = useCallback(async () => {
    const success = await copyShareUrl({
      url,
      snapshot1: viewMode === 'compare' ? compareSelection.snapshot1 : currentIndex,
      snapshot2: viewMode === 'compare' ? compareSelection.snapshot2 : undefined,
      viewMode,
    });
    
    if (success) {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  }, [url, currentIndex, viewMode, compareSelection, copyShareUrl]);

  const handleCompareToNow = (oldestIndex: number) => {
    setCompareSelection({
      snapshot1: oldestIndex,
      snapshot2: 0
    });
    setViewMode('compare');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 md:pt-16 pb-6 md:pb-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-tb-accent/10 border border-tb-accent/20 rounded-full px-3 md:px-4 py-1.5 mb-4 md:mb-6">
            <span className="w-2 h-2 bg-tb-accent rounded-full animate-pulse"></span>
            <span className="text-tb-accent text-xs md:text-sm font-medium">Visual Time Machine</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
            Rewind Any Website
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Watch websites evolve through time with a visual timeline. 
            <span className="text-tb-accent"> AI-powered insights</span> reveal what changed and why it matters.
          </p>
          
          <SearchBar onSearch={fetchSnapshots} loading={loading} />
          
          {error && (
            <p className="mt-4 text-red-500 text-sm">{error}</p>
          )}
          
          {/* Keyboard shortcuts hint - desktop only */}
          <div className="hidden md:flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono">→</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono">Space</kbd>
              Play/Pause
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono">C</kbd>
              Compare Mode
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono">Esc</kbd>
              Exit
            </span>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      {snapshots.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
          {/* Stats Bar with Mode Toggle and Social Share */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4 lg:gap-8 text-sm w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-center">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{snapshots.length}</div>
                <div className="text-gray-400 text-xs md:text-sm">Snapshots</div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                  {snapshots[snapshots.length - 1].date.getFullYear()}
                </div>
                <div className="text-gray-400 text-xs md:text-sm">Oldest</div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                  {snapshots[0].date.getFullYear()}
                </div>
                <div className="text-gray-400 text-xs md:text-sm">Newest</div>
              </div>
              
              {/* Social Share Buttons */}
              <div className="hidden sm:flex ml-auto">
                <SocialShare 
                  url={url} 
                  snapshots={snapshots} 
                  currentIndex={currentIndex} 
                />
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1.5 w-full sm:w-auto justify-center sm:justify-start">
              <button
                onClick={() => setViewMode('rewind')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none justify-center ${
                  viewMode === 'rewind'
                    ? 'bg-tb-accent text-white shadow-lg shadow-tb-accent/25'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Rewind</span>
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none justify-center ${
                  viewMode === 'compare'
                    ? 'bg-tb-accent text-white shadow-lg shadow-tb-accent/25'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>Compare</span>
              </button>
            </div>
          </div>

          {/* Compare to Now CTA */}
          {viewMode === 'rewind' && snapshots.length > 5 && (
            <div className="mb-6">
              <CompareToNow 
                snapshots={snapshots} 
                url={url} 
                onCompare={handleCompareToNow} 
              />
            </div>
          )}
          
          {/* Conditional View Rendering */}
          {viewMode === 'rewind' ? (
            <VisualRewind 
              snapshots={snapshots} 
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
            />
          ) : (
            <ComparisonView 
              snapshots={snapshots}
              onBack={() => {
                setViewMode('rewind');
                setCompareSelection({});
              }}
              initialSnapshot1={compareSelection.snapshot1}
              initialSnapshot2={compareSelection.snapshot2}
            />
          )}

          {/* Biggest Changes - AI-detected evolution moments */}
          {viewMode === 'rewind' && snapshots.length > 5 && (
            <div className="mt-8">
              <BiggestChanges 
                snapshots={snapshots}
                url={url}
                onSelect={setCurrentIndex}
              />
            </div>
          )}
          
          {/* AI Insights */}
          <div className="mt-8 md:mt-12">
            <AIInsights 
              insights={insights}
              loading={insightsLoading}
              onGenerate={generateInsights}
              disabled={snapshots.length < 2}
              url={url}
            />
          </div>

          {/* Email Capture - Track this site */}
          <div className="mt-8">
            <EmailCapture url={url} context="inline" />
          </div>
          
          {/* Snapshot Grid */}
          <div className="mt-8 md:mt-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">All Snapshots</h2>
              <span className="text-xs md:text-sm text-gray-400">
                Showing {Math.min(20, snapshots.length)} of {snapshots.length}
              </span>
            </div>
            
            {/* Mobile: horizontal scroll. Desktop: grid */}
            <div className="relative">
              {/* Fade hints on mobile */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden" />
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden" />
              
              {/* Scrollable on mobile, grid on desktop */}
              <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0">
                {snapshots.slice(0, 20).map((snapshot, index) => (
                  <div key={snapshot.timestamp} className="flex-shrink-0 w-[140px] md:w-auto snap-center">
                    <SnapshotCard
                      snapshot={snapshot}
                      isSelected={index === currentIndex}
                      onClick={() => setCurrentIndex(index)}
                      index={index}
                      onZoom={() => setZoomSnapshot(snapshot)}
                      onCompare={() => {
                        setCompareSelection({
                          snapshot1: currentIndex,
                          snapshot2: index
                        });
                        setViewMode('compare');
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Load more indicator */}
            {snapshots.length > 20 && (
              <div className="mt-6 md:mt-8 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  {snapshots.length - 20} more snapshots available
                </p>
                <p className="text-gray-300 text-xs">
                  Use the timeline slider above to navigate all snapshots
                </p>
              </div>
            )}
          </div>

          {/* Mobile Social Share */}
          <div className="sm:hidden mt-8 flex justify-center">
            <SocialShare 
              url={url} 
              snapshots={snapshots} 
              currentIndex={currentIndex} 
            />
          </div>
        </div>
      )}
      
      {/* Empty State with Popular Sites */}
      {snapshots.length === 0 && !loading && (
        <div className="max-w-5xl mx-auto px-4 pb-16 md:pb-20">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
            <FeatureCard 
              icon="⏪"
              title="Visual Rewind"
              description="Scrub through time with an intuitive slider. Watch websites transform before your eyes."
            />
            <FeatureCard 
              icon="🔀"
              title="Side-by-Side Compare"
              description="Put two snapshots next to each other. Slide, overlay, or view side-by-side to spot every change."
            />
            <FeatureCard 
              icon="🧠"
              title="AI Insights"
              description="GPT-4 analyzes changes and explains what happened: redesigns, rebrands, pivots."
            />
          </div>
          
          {/* Popular Sites */}
          <PopularSites onSelect={fetchSnapshots} loading={loading} />

          {/* Use Cases */}
          <UseCases onExampleClick={fetchSnapshots} />

          {/* Testimonials */}
          <Testimonials />

          {/* Email Capture - General */}
          <div className="mt-12 max-w-md mx-auto">
            <EmailCapture context="inline" />
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 md:py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <p className="text-gray-400 text-sm">Built with the Wayback Machine API. Powered by AI insights.</p>
              <p className="mt-1 text-xs text-gray-300 hidden md:block">
                Tip: Use keyboard shortcuts for faster navigation. Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono text-[10px]">?</kbd> for help.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ViewCounter />
              <a 
                href="https://github.com/galacticjack/timeback" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Image Zoom Modal */}
      <ImageZoomModal 
        snapshot={zoomSnapshot} 
        onClose={() => setZoomSnapshot(null)} 
      />

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Link copied to clipboard!
        </div>
      )}
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 hover:border-tb-accent/30 hover:shadow-lg transition-all">
      <div className="text-2xl md:text-3xl mb-3 md:mb-4">{icon}</div>
      <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
