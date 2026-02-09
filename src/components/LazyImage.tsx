'use client';

import { useState, useEffect, useRef, memo } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  fallbackIcon?: React.ReactNode;
  fallbackGradient?: string;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

// Skeleton loader component
function SkeletonLoader() {
  return (
    <div className="absolute inset-0 skeleton flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 opacity-50">
        <svg className="w-8 h-8 text-gray-600 animate-pulse" fill="none" viewBox="0 0 24 24">
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    </div>
  );
}

// Fallback placeholder when image fails
function FallbackPlaceholder({ 
  gradient = 'from-gray-100 to-gray-200',
  icon,
  message = 'Preview unavailable'
}: { 
  gradient?: string; 
  icon?: React.ReactNode;
  message?: string;
}) {
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col items-center gap-2 z-10">
        <div className="w-12 h-12 bg-gray-300/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
          {icon || (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <span className="text-gray-400 text-xs">{message}</span>
      </div>
    </div>
  );
}

// Main LazyImage component with Intersection Observer
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  fallbackIcon,
  fallbackGradient,
  className = '',
  containerClassName = '',
  onLoad,
  onError,
  onClick
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Only set image src when in view
  useEffect(() => {
    if (isInView && src) {
      setImageSrc(src);
    }
  }, [isInView, src]);

  // Handle load
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Check if image is valid (not a placeholder or error)
    if (img.naturalWidth > 10 && img.naturalHeight > 10) {
      setIsLoading(false);
      onLoad?.();
    } else {
      handleError();
    }
  };

  // Handle error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      onClick={onClick}
    >
      {/* Show skeleton while loading */}
      {isLoading && !hasError && <SkeletonLoader />}

      {/* Show fallback on error */}
      {hasError && (
        <FallbackPlaceholder 
          gradient={fallbackGradient} 
          icon={fallbackIcon} 
        />
      )}

      {/* Actual image (only load when in view) */}
      {isInView && imageSrc && !hasError && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
});

export { SkeletonLoader, FallbackPlaceholder };
