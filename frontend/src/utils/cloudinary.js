const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxyarr4p8';

/**
 * Converts a Cloudinary public_id, relative path, or external URL into a valid, optimized image URL.
 *
 * Handles:
 * 1. Full HTTPS / HTTP Cloudinary URLs: dynamically injects transformations (width, format, quality, dpr)
 * 2. Unsplash URLs: appends width, quality, and format query params
 * 3. Local public paths (e.g. /images/esu.png): returned as-is
 * 4. Raw Cloudinary public_id strings (e.g. "portfolio-projects/abc123"):
 *    constructed into: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<public_id>
 *
 * @param {string} imageSource - public_id or URL
 * @param {object} options - optional transformations & fallback
 * @param {number} [options.width] - max width in px
 * @param {number} [options.height] - max height in px
 * @param {string|number} [options.dpr] - device pixel ratio ('auto', 1, 2)
 * @param {string} [options.crop='limit'] - crop mode ('fill', 'scale', 'limit', 'thumb')
 * @param {string} [options.quality='auto'] - quality setting
 * @param {string} [options.format='auto'] - format setting (e.g. 'auto', 'webp')
 * @param {string} [options.fallback=''] - fallback image URL if imageSource is missing
 * @returns {string} Fully qualified image URL
 */
export function getCloudinaryUrl(imageSource, options = {}) {
  const {
    width,
    height,
    dpr,
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
    fallback = '',
  } = options;

  if (!imageSource || typeof imageSource !== 'string' || !imageSource.trim()) {
    return fallback;
  }

  const cleanSource = imageSource.trim();

  // If local static asset in public/ folder (e.g., "/images/esu.png")
  if (cleanSource.startsWith('/') || cleanSource.startsWith('./')) {
    return cleanSource;
  }

  // Build Cloudinary transformations
  const transformations = [];
  if (format) transformations.push(`f_${format}`);
  if (quality) transformations.push(`q_${quality}`);
  if (dpr) transformations.push(`dpr_${dpr}`);
  if (crop && (width || height)) transformations.push(`c_${crop}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';

  // If already a Cloudinary URL, inject or replace transformations
  if (cleanSource.includes('res.cloudinary.com')) {
    // If it contains /image/upload/, insert transformations right after
    return cleanSource.replace(
      /\/image\/upload\/(?:(?:[a-zA-Z0-9_,.:-]+)\/)?/,
      `/image/upload/${transformString}`
    );
  }

  // If Unsplash URL, apply responsive query parameters
  if (cleanSource.includes('images.unsplash.com')) {
    try {
      const url = new URL(cleanSource);
      if (width) url.searchParams.set('w', String(width));
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', '80');
      return url.toString();
    } catch {
      return cleanSource;
    }
  }

  // If other external URL, return directly
  if (/^(https?:|\/\/|data:)/i.test(cleanSource)) {
    return cleanSource;
  }

  // Raw public_id
  const cleanPublicId = cleanSource.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${cleanPublicId}`;
}

/**
 * Generates a responsive srcset string for 320w, 640w, 800w, and 1200w breakpoints.
 * Uses Cloudinary's w_ and dpr_ transformations for high-DPI display optimization.
 *
 * @param {string} publicId - Cloudinary public ID, Cloudinary URL, or Unsplash URL
 * @returns {string} Responsive srcset string
 */
export function getResponsiveCloudinarySet(publicId) {
  if (!publicId || typeof publicId !== 'string') return '';

  const widths = [320, 640, 800, 1200];

  // If Unsplash URL
  if (publicId.includes('images.unsplash.com')) {
    return widths
      .map((w) => {
        try {
          const url = new URL(publicId);
          url.searchParams.set('w', String(w));
          url.searchParams.set('auto', 'format');
          url.searchParams.set('fit', 'crop');
          url.searchParams.set('q', '80');
          return `${url.toString()} ${w}w`;
        } catch {
          return `${publicId} ${w}w`;
        }
      })
      .join(', ');
  }

  // If local public asset without Cloudinary transformations
  if (publicId.startsWith('/') || publicId.startsWith('./')) {
    return `${publicId} 800w`;
  }

  // Cloudinary public_id or Cloudinary URL
  return widths
    .map((w) => {
      const url = getCloudinaryUrl(publicId, {
        width: w,
        dpr: 'auto',
        crop: 'limit',
        quality: 'auto',
        format: 'auto',
      });
      return `${url} ${w}w`;
    })
    .join(', ');
}

/**
 * Returns a 10px low-quality blurred thumbnail URL for progressive loading placeholders.
 *
 * @param {string} imageSource - Cloudinary public ID or URL
 * @returns {string} Tiny thumbnail URL
 */
export function getCloudinaryThumbnail(imageSource) {
  if (!imageSource || typeof imageSource !== 'string') return '';

  if (imageSource.startsWith('/') || imageSource.startsWith('./')) {
    return imageSource;
  }

  return getCloudinaryUrl(imageSource, {
    width: 10,
    crop: 'limit',
    quality: 30,
    format: 'auto',
  });
}

export default getCloudinaryUrl;
