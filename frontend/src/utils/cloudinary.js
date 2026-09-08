const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxyarr4p8';

/**
 * Converts a Cloudinary public_id, relative path, or external URL into a valid, optimized image URL.
 *
 * Handles:
 * 1. Full HTTPS / HTTP URLs (e.g. Cloudinary secure URLs, Unsplash): returned as-is
 * 2. Local public paths (e.g. /images/esu.png): returned as-is
 * 3. Raw Cloudinary public_id strings (e.g. "portfolio-projects/abc123" or "sample"):
 *    constructed into: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<public_id>
 *
 * @param {string} imageSource - public_id or URL
 * @param {object} options - optional transformations & fallback
 * @param {number} [options.width] - max width in px
 * @param {number} [options.height] - max height in px
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
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
    fallback = '',
  } = options;

  if (!imageSource || typeof imageSource !== 'string' || !imageSource.trim()) {
    return fallback;
  }

  const cleanSource = imageSource.trim();

  // If already an absolute URL (Cloudinary URL, external URL) or data URI, return directly
  if (/^(https?:|\/\/|data:)/i.test(cleanSource)) {
    return cleanSource;
  }

  // If local static asset in public/ folder (e.g., "/images/esu.png")
  if (cleanSource.startsWith('/') || cleanSource.startsWith('./')) {
    return cleanSource;
  }

  // Build Cloudinary transformations
  const transformations = [];
  if (format) transformations.push(`f_${format}`);
  if (quality) transformations.push(`q_${quality}`);
  if (crop && (width || height)) transformations.push(`c_${crop}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  const cleanPublicId = cleanSource.replace(/^\/+/, '');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${cleanPublicId}`;
}

export default getCloudinaryUrl;
