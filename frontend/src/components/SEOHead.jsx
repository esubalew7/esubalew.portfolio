import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContentStore } from '../store/contentStore';
import { getCloudinaryUrl } from '../utils/cloudinary';

const SITE_URL = 'https://portfolio-mern-one-rho.vercel.app';

export function SEOHead() {
  const content = useContentStore((state) => state.content);

  const title = content.seo?.title || 'Esubalew Molla | Full Stack Developer';
  const description =
    content.seo?.description ||
    'Portfolio of Esubalew Molla — Full Stack Developer & Software Engineer based in Ethiopia. Specializing in React, Node.js, MERN stack, distributed systems, and real-time web architecture.';
  const keywords =
    content.seo?.keywords ||
    'Esubalew Molla, developer Ethiopia, Full Stack Developer, MERN Stack Developer, Software Engineer Ethiopia, Bahir Dar University, React Developer, Node.js, Web Developer Ethiopia, Upwork';

  // Resolve OpenGraph image dynamically from content.about.image or content.seo.ogImage
  const rawImage = content.about?.image || content.seo?.ogImage || '/images/esu.png';
  const resolvedImage = getCloudinaryUrl(rawImage);
  const ogImage = resolvedImage.startsWith('http')
    ? resolvedImage
    : `${SITE_URL}${resolvedImage.startsWith('/') ? '' : '/'}${resolvedImage}`;

  const currentUrl =
    typeof window !== 'undefined' && window.location.href
      ? window.location.href
      : `${SITE_URL}/`;

  // Dynamic Person JSON-LD Schema
  const personSchema = useMemo(() => {
    const defaultSkills = [
      'React',
      'Node.js',
      'MongoDB',
      'Express',
      'Flutter',
      'PostgreSQL',
      'Docker',
      'TypeScript',
      'NestJS',
    ];

    const extractedSkills =
      content.skills?.categories?.flatMap((cat) => cat.items?.map((item) => item.name)) || [];

    const knowsAbout = extractedSkills.length > 0 ? extractedSkills : defaultSkills;

    const sameAs =
      Array.isArray(content.socialLinks) && content.socialLinks.length > 0
        ? content.socialLinks
            .filter((s) => s.enabled !== false && s.url)
            .map((s) => s.url)
        : [
            'https://github.com/esubalew7',
            'https://linkedin.com/in/esubalew-molla-7a584739b',
            'https://t.me/Esuman7',
          ];

    const jobTitle =
      content.hero?.titles?.[0]?.replace(/\.$/, '') ||
      content.about?.subtitle ||
      'Full Stack Developer';

    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: content.hero?.name || 'Esubalew Molla',
      jobTitle,
      url: SITE_URL,
      image: ogImage,
      sameAs,
      knowsAbout,
    };
  }, [content, ogImage]);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
    </Helmet>
  );
}

export default SEOHead;
