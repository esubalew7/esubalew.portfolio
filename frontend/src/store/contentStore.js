import { create } from 'zustand';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

const defaultContent = {
  hero: {
    name: 'Esubalew Molla',
    titles: [
      'Full Stack Developer.',
      'MERN Specialist.',
      'PERN Architect.',
      'Flutter Engineer.',
      'Distributed Systems.',
    ],
    description:
      'Building production-grade distributed systems, MERN platforms, and real-time web architecture — from API design to deployment pipeline.',
    available: true,
    cta: {
      primary: { text: 'Selected Work', link: '#projects' },
      secondary: { text: 'Download CV', link: '/resume.pdf' },
    },
  },
  about: {
    title: 'About Me',
    description:
      "I'm Esubalew — a full-stack engineer based in Ethiopia, currently interning at Askuala Link. I architect and ship distributed systems that handle real-world production loads: from JWT + TOTP 2FA backends to live WebSocket-synced admin dashboards.",
    image: '/images/esu.png',
    stats: [
      { value: 3, suffix: '+', label: 'Years of production code' },
      { value: 15, suffix: '+', label: 'Full-stack systems shipped' },
      { value: 3, suffix: '', label: 'Live production stacks' },
    ],
  },
  skills: {
    categories: [],
  },
  experience: {
    categories: [],
  },
  contactInfo: {
    email: 'esubalew392@gmail.com',
    phone: '+251 915795794',
    location: 'Ethiopia',
  },
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/esubalew7', enabled: true },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/esubalew-molla-7a584739b', enabled: true },
    { platform: 'Telegram', url: 'https://t.me/Esuman7', enabled: true },
  ],
  resume: {
    url: '/resume.pdf',
    title: 'Resume',
  },
  sections: {
    hero: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    contact: true,
  },
  footer: {
    copyright: 'All rights reserved.',
    text: 'Built with care and shipped to production.',
  },
  seo: {
    title: 'Esubalew Molla | Full Stack Developer',
    description:
      'Portfolio of Esubalew Molla — Full Stack Developer & Software Engineer based in Ethiopia. Specializing in React, Node.js, MERN stack, distributed systems, and high-performance web architecture.',
    keywords:
      'Esubalew Molla, developer Ethiopia, Full Stack Developer, MERN Stack Developer, Software Engineer Ethiopia, Bahir Dar University, React Developer, Node.js, Web Developer Ethiopia, Upwork',
    ogImage: '',
  },
};

function mapExperienceItem(item) {
  if (!item) return {};

  const duration = (item.duration || '').trim();
  const isCurrent = /present/i.test(duration) || Boolean(item.current);
  const years = duration.match(/\b(19\d\d|20\d\d)\b/g) || [];
  const startYear = years[0] || (item.startDate ? String(new Date(item.startDate).getFullYear()) : '');
  const endYear = isCurrent
    ? 'Present'
    : years[1] || (item.endDate ? String(new Date(item.endDate).getFullYear()) : '');

  const description =
    item.description ||
    (Array.isArray(item.bullets) && item.bullets.length ? item.bullets.join(' ') : '');

  const skills =
    Array.isArray(item.skills) && item.skills.length
      ? item.skills
      : Array.isArray(item.tags)
      ? item.tags
      : [];

  return {
    ...item,
    title: item.title || item.role || '',
    role: item.role || item.title || '',
    company: item.company || item.institution || item.organization || '',
    location: item.location || '',
    description,
    skills,
    period: item.period || duration || (startYear ? `${startYear} — ${endYear}` : ''),
    startDate: item.startDate || startYear,
    endDate: isCurrent ? 'Present' : item.endDate || endYear,
    current: isCurrent,
  };
}

export function mapBackendContent(raw) {
  if (!raw) return defaultContent;

  const data = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;

  const rawExpCategories = data.experience?.categories || [];
  const mappedExperienceCategories = rawExpCategories.map((cat) => ({
    ...cat,
    items: Array.isArray(cat.items) ? cat.items.map(mapExperienceItem) : [],
  }));

  const resolvedSocialLinks = Array.isArray(data.socialLinks) && data.socialLinks.length
    ? data.socialLinks
    : Array.isArray(data.footer?.socials)
    ? data.footer.socials
    : defaultContent.socialLinks;

  return {
    hero: {
      ...defaultContent.hero,
      ...data.hero,
      name: data.hero?.name || defaultContent.hero.name,
      titles: data.hero?.titles?.length ? data.hero.titles : defaultContent.hero.titles,
      description: data.hero?.description || defaultContent.hero.description,
      available: typeof data.hero?.available === 'boolean' ? data.hero.available : defaultContent.hero.available,
      cta: {
        primary: {
          ...defaultContent.hero.cta.primary,
          ...(data.hero?.cta?.primary || {}),
        },
        secondary: {
          ...defaultContent.hero.cta.secondary,
          ...(data.hero?.cta?.secondary || {}),
        },
      },
    },
    about: {
      ...defaultContent.about,
      ...data.about,
      description: data.about?.description || defaultContent.about.description,
      image: data.about?.image || defaultContent.about.image,
      stats: Array.isArray(data.about?.stats) && data.about.stats.length
        ? data.about.stats
        : defaultContent.about.stats,
    },
    skills: {
      ...defaultContent.skills,
      ...data.skills,
      categories: Array.isArray(data.skills?.categories)
        ? data.skills.categories
        : defaultContent.skills.categories,
    },
    experience: {
      ...defaultContent.experience,
      ...data.experience,
      categories: mappedExperienceCategories,
    },
    contactInfo: {
      ...defaultContent.contactInfo,
      ...data.contactInfo,
      email: data.contactInfo?.email || defaultContent.contactInfo.email,
      phone: data.contactInfo?.phone || defaultContent.contactInfo.phone,
      location: data.contactInfo?.location || defaultContent.contactInfo.location,
    },
    socialLinks: resolvedSocialLinks,
    resume: {
      ...defaultContent.resume,
      ...data.resume,
      url: data.resume?.url || data.hero?.cta?.secondary?.link || defaultContent.resume.url,
    },
    sections: {
      ...defaultContent.sections,
      ...(data.sections || {}),
    },
    footer: {
      ...defaultContent.footer,
      ...data.footer,
      copyright: data.footer?.copyright || defaultContent.footer.copyright,
      text: data.footer?.copyright || defaultContent.footer.text,
    },
    seo: {
      ...defaultContent.seo,
      ...(data.seo || {}),
      title: data.seo?.title || defaultContent.seo.title,
      description: data.seo?.description || defaultContent.seo.description,
      keywords: data.seo?.keywords || defaultContent.seo.keywords,
      ogImage: data.seo?.ogImage || defaultContent.seo.ogImage,
    },
  };
}

export const useContentStore = create((set) => ({
  content: defaultContent,
  loading: false,
  error: null,

  fetchContent: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/content`);
      if (!res.ok) {
        throw new Error(`Failed to fetch content: ${res.statusText}`);
      }
      const json = await res.json();
      const mapped = mapBackendContent(json);
      set({ content: mapped, loading: false });
      return mapped;
    } catch (err) {
      console.warn('[ContentStore] Falling back to default content due to API error:', err.message);
      set({ error: err.message, loading: false });
      return defaultContent;
    }
  },

  setContent: (newContent) => {
    set({ content: mapBackendContent(newContent) });
  },
}));
