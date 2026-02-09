'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { VisualRewind } from '@/components/VisualRewind';
import { AIInsights } from '@/components/AIInsights';
import { SnapshotCard } from '@/components/SnapshotCard';
import { ComparisonView } from '@/components/ComparisonView';
import { ImageZoomModal } from '@/components/ImageZoomModal';

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

  const fetchSnapshots = async (searchUrl: string) => {
    setLoading(true);
    setError('');
    setSnapshots([]);
    setInsights(null);
    
    try {
      // Clean URL
      let cleanUrl = searchUrl.trim();
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = cleanUrl.replace(/^(https?:\/\/)?/, '');
      }
      
      // Fetch from our API route (which proxies Wayback Machine CDX API)
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
      
      // Map API response to our Snapshot format
      const parsedSnapshots: Snapshot[] = data.snapshots.map((snap: {
        timestamp: string;
        originalUrl: string;
        screenshotUrl: string;
        archiveUrl: string;
        year: number;
        month: number;
        day: number;
      }) => ({
        timestamp: snap.timestamp,
        url: snap.originalUrl,
        screenshotUrl: snap.screenshotUrl,
        archiveUrl: snap.archiveUrl,
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-tb-dark via-tb-darker to-black">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-tb-accent/10 border border-tb-accent/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-tb-accent rounded-full animate-pulse"></span>
            <span className="text-tb-accent text-sm font-medium">Visual Time Machine</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Rewind Any Website
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Watch websites evolve through time with a visual timeline. 
            <span className="text-tb-accent"> AI-powered insights</span> reveal what changed and why it matters.
          </p>
          
          <SearchBar onSearch={fetchSnapshots} loading={loading} />
          
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </div>
      </div>
      
      {/* Results Section */}
      {snapshots.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-20">
          {/* Stats Bar with Mode Toggle */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4 md:gap-8 text-sm">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">{snapshots.length}</div>
                <div className="text-gray-500 text-xs md:text-sm">Snapshots</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {snapshots[snapshots.length - 1].date.getFullYear()}
                </div>
                <div className="text-gray-500 text-xs md:text-sm">Oldest</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {snapshots[0].date.getFullYear()}
                </div>
                <div className="text-gray-500 text-xs md:text-sm">Newest</div>
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-1.5">
              <button
                onClick={() => setViewMode('rewind')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'rewind'
                    ? 'bg-tb-accent text-white shadow-lg shadow-tb-accent/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Rewind</span>
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'compare'
                    ? 'bg-tb-accent text-white shadow-lg shadow-tb-accent/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span className="hidden sm:inline">Compare</span>
              </button>
            </div>
          </div>
          
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
          
          {/* AI Insights */}
          <div className="mt-12">
            <AIInsights 
              insights={insights}
              loading={insightsLoading}
              onGenerate={generateInsights}
              disabled={snapshots.length < 2}
              url={url}
            />
          </div>
          
          {/* Snapshot Grid */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-300">All Snapshots</h2>
              <span className="text-sm text-gray-500">
                Showing {Math.min(20, snapshots.length)} of {snapshots.length}
              </span>
            </div>
            
            {/* Responsive grid - fewer columns on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {snapshots.slice(0, 20).map((snapshot, index) => (
                <SnapshotCard
                  key={snapshot.timestamp}
                  snapshot={snapshot}
                  isSelected={index === currentIndex}
                  onClick={() => setCurrentIndex(index)}
                  index={index}
                  onZoom={() => setZoomSnapshot(snapshot)}
                  onCompare={() => {
                    // Compare current viewed snapshot with this one
                    setCompareSelection({
                      snapshot1: currentIndex,
                      snapshot2: index
                    });
                    setViewMode('compare');
                  }}
                />
              ))}
            </div>

            {/* Load more button if there are more snapshots */}
            {snapshots.length > 20 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm mb-2">
                  {snapshots.length - 20} more snapshots available
                </p>
                <p className="text-gray-600 text-xs">
                  Use the timeline slider above to navigate all snapshots
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Features Section (shown when no results) */}
      {snapshots.length === 0 && !loading && (
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
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
          
          {/* Example URLs */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">Try these popular sites:</p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {['apple.com', 'google.com', 'amazon.com', 'twitter.com', 'facebook.com'].map(site => (
                <button
                  key={site}
                  onClick={() => fetchSnapshots(site)}
                  className="px-3 md:px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {site}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm px-4">
        <p>Built with the Wayback Machine API. Powered by AI insights.</p>
        <p className="mt-2 text-xs text-gray-600">
          Tip: Click any snapshot to zoom in. Use +/- to adjust zoom level.
        </p>
      </footer>

      {/* Image Zoom Modal */}
      <ImageZoomModal 
        snapshot={zoomSnapshot} 
        onClose={() => setZoomSnapshot(null)} 
      />
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-tb-accent/30 transition-colors">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
