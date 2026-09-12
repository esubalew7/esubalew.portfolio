import { useState, useEffect, useRef } from 'react';
import { getCloudinaryThumbnail } from '../../utils/cloudinary';

/**
 * LazyImage Component
 *
 * Performance-optimized image component for high Core Web Vitals (LCP) and smooth UX:
 * - Loads high-res image only when within 200px of the viewport via IntersectionObserver
 * - Displays a low-quality blurred placeholder (10px Cloudinary thumb) while loading
 * - Fades in the full image with a 0.4s opacity transition
 * - Native loading="lazy" and decoding="async"
 * - Built-in fallback error state showing a dark placeholder with alt text
 */
export function LazyImage({
  src,
  srcSet,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  alt = '',
  aspectRatio,
  className = '',
  style = {},
  imgStyle = {},
  placeholderSrc,
  objectFit = 'cover',
  onLoad,
}) {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // IntersectionObserver: trigger load when within 200px of viewport
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Compute 10px low-quality thumbnail for placeholder
  const thumbUrl = placeholderSrc || getCloudinaryThumbnail(src);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: aspectRatio || undefined,
        background: 'var(--ink-raised, #080A0E)',
        ...style,
      }}
    >
      {/* ── Error State ── */}
      {hasError ? (
        <div
          role="img"
          aria-label={alt || 'Failed to load image'}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            textAlign: 'center',
            background: 'var(--ink-raised, #080A0E)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
            color: 'var(--text-muted, #94A3B8)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            zIndex: 3,
          }}
        >
          <svg
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.25}
            style={{ opacity: 0.4, marginBottom: 8 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <span style={{ maxWidth: '85%', lineHeight: 1.4 }}>
            {alt || 'Image unavailable'}
          </span>
        </div>
      ) : (
        <>
          {/* ── Low-Quality Blurred Placeholder ── */}
          {thumbUrl && !isLoaded && (
            <img
              src={thumbUrl}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit,
                filter: 'blur(16px)',
                transform: 'scale(1.08)',
                opacity: isLoaded ? 0 : 1,
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}

          {/* ── High-Res Full Image ── */}
          {isInView && (
            <img
              src={src}
              srcSet={srcSet || undefined}
              sizes={sizes}
              alt={alt}
              loading="lazy"
              decoding="async"
              onLoad={(e) => {
                setIsLoaded(true);
                if (onLoad) onLoad(e);
              }}
              onError={() => {
                setHasError(true);
              }}
              style={{
                position: 'relative',
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit,
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 2,
                ...imgStyle,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default LazyImage;
