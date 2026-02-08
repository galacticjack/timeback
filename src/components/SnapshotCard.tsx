'use client';

interface Snapshot {
  timestamp: string;
  url: string;
  screenshotUrl: string;
  date: Date;
}

interface SnapshotCardProps {
  snapshot: Snapshot;
  isSelected: boolean;
  onClick: () => void;
}

export function SnapshotCard({ snapshot, isSelected, onClick }: SnapshotCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <button
      onClick={onClick}
      className={`group relative bg-gray-800/50 border rounded-xl overflow-hidden transition-all hover:scale-105 ${
        isSelected 
          ? 'border-tb-accent ring-2 ring-tb-accent/30' 
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-gray-900 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      {/* Date Label */}
      <div className="p-2 text-center">
        <span className="text-xs font-medium text-gray-300">{formatDate(snapshot.date)}</span>
      </div>
      
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-tb-accent rounded-full"></div>
      )}
    </button>
  );
}
