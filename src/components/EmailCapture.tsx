'use client';

import { useState } from 'react';

interface EmailCaptureProps {
  url?: string;
  context?: 'sidebar' | 'inline' | 'modal';
}

export function EmailCapture({ url, context = 'inline' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const subscribers = JSON.parse(localStorage.getItem('timeback_subscribers') || '[]');
      subscribers.push({
        email,
        url: url || 'general',
        timestamp: new Date().toISOString(),
        source: context
      });
      localStorage.setItem('timeback_subscribers', JSON.stringify(subscribers));
      
      setStatus('success');
      setEmail('');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`${context === 'sidebar' ? 'p-4' : 'p-6'} bg-green-50 border border-green-200 rounded-xl text-center`}>
        <div className="text-2xl mb-2">✓</div>
        <p className="text-green-700 font-medium">You&apos;re on the list!</p>
        <p className="text-sm text-gray-500 mt-1">
          {url ? `We'll notify you when ${url} changes.` : `We'll keep you updated.`}
        </p>
      </div>
    );
  }

  return (
    <div className={`${context === 'sidebar' ? 'p-4' : 'p-6'} bg-white border border-gray-200 rounded-xl shadow-sm`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-tb-accent/10 rounded-lg shrink-0">
          <svg className="w-5 h-5 text-tb-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {url ? 'Track This Site' : 'Get Notified'}
          </h3>
          <p className="text-sm text-gray-500">
            {url 
              ? `Get alerted when ${url} makes significant changes.`
              : 'Be the first to know about new features and interesting archive discoveries.'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder="your@email.com"
            className={`w-full bg-white border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-tb-accent transition-colors ${
              status === 'error' ? 'border-red-400' : 'border-gray-200'
            }`}
            disabled={status === 'loading'}
          />
          {status === 'error' && (
            <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-tb-accent hover:bg-tb-accent/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Subscribing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{url ? 'Notify Me' : 'Subscribe'}</span>
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-3">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
