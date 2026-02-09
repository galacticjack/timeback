'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Inner component that uses useSearchParams
function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;

    // Track page view
    const trackPageView = () => {
      const url = searchParams?.get('url');
      const view = {
        path: pathname,
        url: url || null,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || null,
      };

      // Store locally
      try {
        const views = JSON.parse(localStorage.getItem('timeback_views') || '[]');
        views.push(view);
        // Keep last 1000 views
        if (views.length > 1000) views.shift();
        localStorage.setItem('timeback_views', JSON.stringify(views));
      } catch {
        // Storage full or disabled
      }

      // Track unique visitors
      if (!sessionStorage.getItem('timeback_session')) {
        sessionStorage.setItem('timeback_session', Date.now().toString());
        try {
          const visitors = parseInt(localStorage.getItem('timeback_visitors') || '0');
          localStorage.setItem('timeback_visitors', (visitors + 1).toString());
        } catch {
          // Storage disabled
        }
      }

      // If Google Analytics is configured
      if (typeof window !== 'undefined' && (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
          page_path: pathname,
        });
      }
    };

    trackPageView();
    setInitialized(true);
  }, [pathname, searchParams]);

  // Track URL searches
  useEffect(() => {
    if (!initialized) return;
    
    const url = searchParams?.get('url');
    if (url) {
      try {
        const searches = JSON.parse(localStorage.getItem('timeback_searches') || '[]');
        searches.push({
          url,
          timestamp: new Date().toISOString(),
        });
        if (searches.length > 500) searches.shift();
        localStorage.setItem('timeback_searches', JSON.stringify(searches));
      } catch {
        // Storage full
      }
    }
  }, [searchParams, initialized]);

  return null;
}

// Wrapper with Suspense
export function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}

// Hook to get analytics data
export function useAnalytics() {
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    topSearches: [] as { url: string; count: number }[],
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const views = JSON.parse(localStorage.getItem('timeback_views') || '[]');
      const visitors = parseInt(localStorage.getItem('timeback_visitors') || '0');
      const searches = JSON.parse(localStorage.getItem('timeback_searches') || '[]');

      // Count top searches
      const searchCounts: Record<string, number> = {};
      searches.forEach((s: { url: string }) => {
        searchCounts[s.url] = (searchCounts[s.url] || 0) + 1;
      });
      const topSearches = Object.entries(searchCounts)
        .map(([url, count]) => ({ url, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalViews: views.length,
        uniqueVisitors: visitors,
        topSearches,
      });
    } catch {
      // Storage disabled
    }
  }, []);

  return stats;
}

// Simple view counter display
export function ViewCounter() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedViews = JSON.parse(localStorage.getItem('timeback_views') || '[]');
      setViews(storedViews.length);
    } catch {
      setViews(0);
    }
  }, []);

  if (views === null) return null;

  return (
    <div className="text-xs text-gray-500 flex items-center gap-1">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
      <span>{views.toLocaleString()} views</span>
    </div>
  );
}
