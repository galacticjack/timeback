'use client';

interface PopularSitesProps {
  onSelect: (url: string) => void;
  loading?: boolean;
}

const POPULAR_SITES = [
  { 
    url: 'apple.com', 
    name: 'Apple', 
    emoji: '🍎',
    description: 'Watch the evolution from iPod era to iPhone'
  },
  { 
    url: 'google.com', 
    name: 'Google', 
    emoji: '🔍',
    description: 'From simple search to tech giant'
  },
  { 
    url: 'amazon.com', 
    name: 'Amazon', 
    emoji: '📦',
    description: 'Online bookstore to everything store'
  },
  { 
    url: 'twitter.com', 
    name: 'Twitter/X', 
    emoji: '🐦',
    description: 'The social platform\'s visual journey'
  },
  { 
    url: 'facebook.com', 
    name: 'Facebook', 
    emoji: '👥',
    description: 'From dorm room to metaverse'
  },
  { 
    url: 'youtube.com', 
    name: 'YouTube', 
    emoji: '▶️',
    description: 'Video platform evolution'
  },
  { 
    url: 'nytimes.com', 
    name: 'NY Times', 
    emoji: '📰',
    description: 'Digital news transformation'
  },
  { 
    url: 'ebay.com', 
    name: 'eBay', 
    emoji: '🛒',
    description: 'Auction pioneer\'s redesigns'
  },
];

export function PopularSites({ onSelect, loading }: PopularSitesProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Popular Time Machines</h2>
        <p className="text-sm text-gray-500">Explore how these iconic sites evolved</p>
      </div>
      
      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="relative">
        {/* Gradient fade hints for scroll on mobile */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden" />
        
        {/* Scrollable container on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x snap-mandatory md:snap-none px-2 md:px-0 -mx-2 md:mx-0">
          {POPULAR_SITES.map((site) => (
            <button
              key={site.url}
              onClick={() => onSelect(site.url)}
              disabled={loading}
              className="flex-shrink-0 w-[160px] md:w-auto snap-center group bg-white border border-gray-200 rounded-xl p-4 hover:border-tb-accent/50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-tb-accent focus:ring-offset-2 focus:ring-offset-white"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {site.emoji}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{site.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{site.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Scroll hint on mobile */}
      <div className="flex justify-center mt-4 md:hidden">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Scroll for more
        </div>
      </div>
    </div>
  );
}
