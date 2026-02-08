'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { VisualRewind } from '@/components/VisualRewind';
import { AIInsights } from '@/components/AIInsights';
import { SnapshotCard } from '@/components/SnapshotCard';
import { ComparisonView } from '@/components/ComparisonView';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

type ViewMode = 'rewind' | 'compare';

export default function Home() {
  const [url, setUrl] = useState('');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('rewind');

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
      
      // Fetch from Wayback Machine CDX API
      const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(cleanUrl)}&output=json&limit=50&filter=statuscode:200&collapse=timestamp:6`;
      
      const response = await fetch(cdxUrl);
      if (!response.ok) throw new Error('Failed to fetch from Wayback Machine');
      
      const data = await response.json();
      
      if (data.length <= 1) {
        setError('No snapshots found for this URL. Try a popular website.');
        setLoading(false);
        return;
      }
      
      // Skip header row, parse snapshots
      const parsedSnapshots: Snapshot[] = data.slice(1).map((row: string[]) => {
        const [urlkey, timestamp, original, mimetype, statuscode, digest, length] = row;
        const year = timestamp.substring(0, 4);
        const month = timestamp.substring(4, 6);
        const day = timestamp.substring(6, 8);
        
        return {
          timestamp,
          url: original,
          screenshotUrl: `https://web.archive.org/web/${timestamp}im_/${original}`,
          date: new Date(`${year}-${month}-${day}`),
        };
      });
      
      // Sort by date descending (newest first)
      parsedSnapshots.sort((a, b) => b.date.getTime() - a.date.getTime());
      
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{snapshots.length}</div>
                <div className="text-gray-500">Snapshots</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {snapshots[snapshots.length - 1].date.getFullYear()}
                </div>
                <div className="text-gray-500">Oldest</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {snapshots[0].date.getFullYear()}
                </div>
                <div className="text-gray-500">Newest</div>
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-1.5">
              <button
                onClick={() => setViewMode('rewind')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'rewind'
                    ? 'bg-tb-accent text-white shadow-lg shadow-tb-accent/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Rewind
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'compare'
                    ? 'bg-tb-accent text-white shadow-lg shadow-tb-accent/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Compare
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
              onBack={() => setViewMode('rewind')}
            />
          )}
          
          {/* AI Insights */}
          <div className="mt-12">
            <AIInsights 
              insights={insights}
              loading={insightsLoading}
              onGenerate={generateInsights}
              disabled={snapshots.length < 2}
            />
          </div>
          
          {/* Snapshot Grid */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6 text-gray-300">All Snapshots</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {snapshots.slice(0, 20).map((snapshot, index) => (
                <SnapshotCard
                  key={snapshot.timestamp}
                  snapshot={snapshot}
                  isSelected={index === currentIndex}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
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
              icon="🧠"
              title="AI Insights"
              description="GPT-4 analyzes changes and explains what happened: redesigns, rebrands, pivots."
            />
            <FeatureCard 
              icon="📊"
              title="Design Trends"
              description="See how web design evolved. Track industry trends through real examples."
            />
          </div>
          
          {/* Example URLs */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">Try these popular sites:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['apple.com', 'google.com', 'amazon.com', 'twitter.com', 'facebook.com'].map(site => (
                <button
                  key={site}
                  onClick={() => fetchSnapshots(site)}
                  className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {site}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>Built with the Wayback Machine API. Powered by AI insights.</p>
      </footer>
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
