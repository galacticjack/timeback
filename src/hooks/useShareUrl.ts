'use client';

import { useEffect, useCallback } from 'react';

interface ShareState {
  url?: string;
  snapshot1?: number;
  snapshot2?: number;
  viewMode?: 'rewind' | 'compare';
}

export function useShareUrl() {
  // Parse URL on mount
  const parseUrl = useCallback((): ShareState => {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    const state: ShareState = {};
    
    const url = params.get('url');
    if (url) state.url = url;
    
    const s1 = params.get('s1');
    if (s1) state.snapshot1 = parseInt(s1, 10);
    
    const s2 = params.get('s2');
    if (s2) state.snapshot2 = parseInt(s2, 10);
    
    const mode = params.get('mode');
    if (mode === 'compare' || mode === 'rewind') state.viewMode = mode;
    
    return state;
  }, []);
  
  // Update URL without reload
  const updateUrl = useCallback((state: ShareState) => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams();
    
    if (state.url) params.set('url', state.url);
    if (state.snapshot1 !== undefined) params.set('s1', state.snapshot1.toString());
    if (state.snapshot2 !== undefined) params.set('s2', state.snapshot2.toString());
    if (state.viewMode) params.set('mode', state.viewMode);
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    window.history.replaceState({}, '', newUrl);
  }, []);
  
  // Copy share URL to clipboard
  const copyShareUrl = useCallback(async (state: ShareState): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const params = new URLSearchParams();
    if (state.url) params.set('url', state.url);
    if (state.snapshot1 !== undefined) params.set('s1', state.snapshot1.toString());
    if (state.snapshot2 !== undefined) params.set('s2', state.snapshot2.toString());
    if (state.viewMode) params.set('mode', state.viewMode);
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }, []);
  
  // Get share URL as string
  const getShareUrl = useCallback((state: ShareState): string => {
    if (typeof window === 'undefined') return '';
    
    const params = new URLSearchParams();
    if (state.url) params.set('url', state.url);
    if (state.snapshot1 !== undefined) params.set('s1', state.snapshot1.toString());
    if (state.snapshot2 !== undefined) params.set('s2', state.snapshot2.toString());
    if (state.viewMode) params.set('mode', state.viewMode);
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, []);
  
  return {
    parseUrl,
    updateUrl,
    copyShareUrl,
    getShareUrl,
  };
}
