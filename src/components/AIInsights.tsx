'use client';

interface AIInsightsProps {
  insights: string | null;
  loading: boolean;
  onGenerate: () => void;
  disabled: boolean;
}

export function AIInsights({ insights, loading, onGenerate, disabled }: AIInsightsProps) {
  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Insights</h3>
            <p className="text-sm text-gray-400">Powered by GPT-4</p>
          </div>
        </div>
        
        {!insights && (
          <button
            onClick={onGenerate}
            disabled={disabled || loading}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-medium text-sm transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Insights
              </>
            )}
          </button>
        )}
      </div>
      
      {insights ? (
        <div className="prose prose-invert max-w-none">
          <div className="bg-gray-800/50 rounded-xl p-4 text-gray-300 leading-relaxed whitespace-pre-wrap">
            {insights}
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">
          <p>Click "Generate Insights" to get AI-powered analysis of this website's evolution, including:</p>
          <ul className="mt-2 space-y-1 ml-4">
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span> Major redesigns and when they happened
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">•</span> Brand evolution and messaging changes
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">•</span> Technology and design trend adoption
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-400">•</span> Business pivots visible through the site
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
