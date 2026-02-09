'use client';

import { useState, useEffect } from 'react';
import { getRandomFact, type WebsiteFact } from '@/lib/websiteFacts';
import { downloadMarkdown, downloadHTML, openForPrint, type ExportData, type AnalysisData } from '@/lib/exportReport';

interface AnalysisResult {
  summary: string;
  keyChanges: string[];
  designChanges: string[];
  contentChanges: string[];
  businessInsights: string[];
  sentiment?: {
    earlier: string;
    later: string;
    trend: string;
  };
  actionableInsights?: string[];
}

interface ComparisonAnalysisProps {
  url: string;
  earlierDate: string;
  laterDate: string;
  archiveUrl1: string;
  archiveUrl2: string;
}

export function ComparisonAnalysis({ url, earlierDate, laterDate, archiveUrl1, archiveUrl2 }: ComparisonAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFact, setCurrentFact] = useState<WebsiteFact | null>(null);
  const [cached, setCached] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (!loading) return;
    
    setCurrentFact(getRandomFact(url));
    const interval = setInterval(() => {
      setCurrentFact(getRandomFact(url));
    }, 4000);
    
    return () => clearInterval(interval);
  }, [loading, url]);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          date1: earlierDate,
          date2: laterDate,
          archiveUrl1,
          archiveUrl2,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
      setCached(data.cached || false);
    } catch (err) {
      setError('Failed to generate analysis. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'markdown' | 'html' | 'print') => {
    if (!analysis) return;
    
    const exportData: ExportData = {
      url,
      earlierDate,
      laterDate,
      analysis: analysis as AnalysisData,
      generatedAt: new Date().toLocaleString(),
    };
    
    switch (format) {
      case 'markdown':
        downloadMarkdown(exportData);
        break;
      case 'html':
        downloadHTML(exportData);
        break;
      case 'print':
        openForPrint(exportData);
        break;
    }
    setShowExport(false);
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      professional: 'bg-blue-500',
      playful: 'bg-pink-500',
      minimal: 'bg-gray-500',
      aggressive: 'bg-red-500',
      corporate: 'bg-indigo-500',
      startup: 'bg-green-500',
    };
    return colors[sentiment] || 'bg-gray-500';
  };

  const getTrendEmoji = (trend: string) => {
    const emojis: Record<string, string> = {
      more_corporate: '🏢',
      more_casual: '😎',
      more_minimal: '✨',
      no_change: '➡️',
      complete_rebrand: '🔄',
    };
    return emojis[trend] || '📊';
  };

  const formatTrend = (trend: string) => {
    return trend.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      history: '📜',
      design: '🎨',
      tech: '⚙️',
      business: '💰',
      fun: '🎉',
    };
    return icons[category] || '💡';
  };

  if (!analysis && !loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">AI can analyze these snapshots</span>
          </div>
          <button
            onClick={analyze}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm font-medium text-white transition-all"
          >
            Analyze Changes
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-gray-600">Analyzing website evolution...</span>
        </div>
        
        {currentFact && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <span className="text-xl">{getCategoryIcon(currentFact.category)}</span>
              <div>
                <p className="text-gray-600 text-sm">{currentFact.fact}</p>
                {currentFact.year && (
                  <p className="text-gray-400 text-xs mt-1">— {currentFact.year}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-red-600">{error}</span>
          <button
            onClick={analyze}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium text-white transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mt-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Analysis</h3>
            {cached && (
              <span className="text-xs text-gray-400">Cached result</span>
            )}
          </div>
        </div>
        
        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          
          {showExport && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
              <button
                onClick={() => handleExport('markdown')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
              >
                <span>📝</span> Download Markdown
              </button>
              <button
                onClick={() => handleExport('html')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <span>🌐</span> Download HTML
              </button>
              <button
                onClick={() => handleExport('print')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
              >
                <span>🖨️</span> Print / Save PDF
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
        <p className="text-gray-700">{analysis?.summary}</p>
      </div>
      
      {/* Sentiment Trend Visualization */}
      {analysis?.sentiment && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Design Sentiment Trend</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getSentimentColor(analysis.sentiment.earlier)}`}></span>
              <span className="text-sm text-gray-700 capitalize">{analysis.sentiment.earlier}</span>
              <span className="text-gray-400 text-xs">({earlierDate})</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 rounded-full relative">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center">
                <span className="text-lg">{getTrendEmoji(analysis.sentiment.trend)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getSentimentColor(analysis.sentiment.later)}`}></span>
              <span className="text-sm text-gray-700 capitalize">{analysis.sentiment.later}</span>
              <span className="text-gray-400 text-xs">({laterDate})</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {formatTrend(analysis.sentiment.trend)}
          </p>
        </div>
      )}
      
      {/* Key Changes */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
          <span className="text-yellow-500">🔑</span> Key Changes
        </h4>
        <ul className="space-y-2">
          {analysis?.keyChanges.map((change, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-blue-500 mt-1">•</span>
              {change}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Collapsible sections */}
      <details className="mb-3">
        <summary className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-2">
          <span>🎨</span> Design Evolution
        </summary>
        <ul className="mt-2 ml-6 space-y-1">
          {analysis?.designChanges.map((change, i) => (
            <li key={i} className="text-sm text-gray-600">{change}</li>
          ))}
        </ul>
      </details>
      
      <details className="mb-3">
        <summary className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-2">
          <span>📝</span> Content Shifts
        </summary>
        <ul className="mt-2 ml-6 space-y-1">
          {analysis?.contentChanges.map((change, i) => (
            <li key={i} className="text-sm text-gray-600">{change}</li>
          ))}
        </ul>
      </details>
      
      <details className="mb-3">
        <summary className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-2">
          <span>💼</span> Business Insights
        </summary>
        <ul className="mt-2 ml-6 space-y-1">
          {analysis?.businessInsights.map((insight, i) => (
            <li key={i} className="text-sm text-gray-600">{insight}</li>
          ))}
        </ul>
      </details>
      
      {/* Actionable Insights */}
      {analysis?.actionableInsights && analysis.actionableInsights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <span className="text-green-500">💡</span> Actionable Takeaways
          </h4>
          <div className="grid gap-2">
            {analysis.actionableInsights.map((insight, i) => (
              <div key={i} className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-gray-700">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
