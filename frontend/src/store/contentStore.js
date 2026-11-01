import { create } from 'zustand';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

export const defaultContent = {
  hero: {
    name: 'Esubalew Molla',
    titles: [
      'Full-Stack Engineer.',
      'Systems Architect.',
      'MERN Stack Specialist.',
      'Distributed Systems Engineer.',
      'Real-Time Web Architect.',
    ],
    description:
      'Building production-grade distributed systems, MERN platforms, and real-time web architecture — from API design to production deployment.',
    available: true,
    metrics: [
      { id: 'metric-1', value: '15+', label: 'Systems shipped', suffix: '', order: 1, visible: true },
      { id: 'metric-2', value: '3+', label: 'Years building', suffix: '', order: 2, visible: true },
      { id: 'metric-3', value: '<100ms', label: 'API response focus', suffix: '', order: 3, visible: true },
      { id: 'metric-4', value: '2FA', label: 'Zero-trust auth', suffix: '', order: 4, visible: true },
    ],
    availabilityBanner: {
      enabled: true,
      badgeText: 'Available for freelance',
      subText: 'Response time < 24h',
      buttonText: 'Book a Call',
      buttonLink: '#contact',
      bookedBadgeText: 'Currently booked',
      bookedSubText: 'Accepting inquiries for next quarter',
      bookedButtonText: 'Inquire',
      visible: true,
    },
    cta: {
      primary: { text: 'Selected Work', link: '#projects' },
      secondary: { text: 'Download CV', link: '/resume.pdf' },
    },
  },
  about: {
    title: 'About Me',
    dossierRef: 'Ref: ESU-2024',
    clearanceLevel: 'Clearance: Senior Engineer',
    personnelId: 'ESU-001',
    description:
      "I'm Esubalew Molla — a full-stack engineer based in Ethiopia and a Computer Science student at Bahir Dar University, currently interning at Askuala Link.\n\nI architect and ship distributed systems that handle real-world production loads: from JWT + TOTP 2FA backends to live WebSocket-synced admin dashboards.\n\nMy approach is architecture-first: prioritizing clean event flows, intelligent caching layers, and resilient separation of concerns before writing code — building software that scales reliably under production workloads.",
    image: '/images/esu.png',
    education: {
      institution: 'Bahir Dar University',
      degree: 'B.Sc. Computer Science',
      year: 'B.Sc. Computer Science',
    },
    stats: [
      { value: 3, suffix: '+', label: 'Years of production code' },
      { value: 15, suffix: '+', label: 'Full-stack systems shipped' },
      { value: 3, suffix: '', label: 'Live production stacks' },
    ],
    competencies: [
      'MERN Stack', 'PERN Stack', 'Flutter', 'Node.js', 'React',
      'TypeScript', 'PostgreSQL', 'MongoDB', 'Docker', 'Socket.IO',
      'REST API', 'Microservices', 'NestJS', 'Redis', 'RabbitMQ',
      'JWT Auth', '2FA', 'Swagger', 'Postman', 'Git',
    ],
    assignments: [
      {
        id: 'asg-1',
        organization: 'Askuala Link Software Company',
        role: 'Frontend Developer Intern',
        period: '2024 — Present',
        status: 'active',
        current: true,
        order: 1,
        visible: true,
      },
      {
        id: 'asg-2',
        organization: 'Bahir Dar University',
        role: 'B.Sc. Computer Science',
        period: '2022 — Present',
        status: 'completed',
        current: false,
        order: 2,
        visible: true,
      },
    ],
  },
  skills: {
    title: 'Technical Arsenal',
    subtitle: 'Technologies and tools I use to build production systems.',
    categories: [],
  },
  projectsSection: {
    eyebrow: 'Selected Work',
    title: "What I've Built\nfor Production.",
    subtitle: 'Production-grade applications architected for reliability, responsive API performance, and resilient state synchronization.',
    filters: [
      { id: 'all', label: 'All', order: 1 },
      { id: 'mern', label: 'MERN', order: 2 },
      { id: 'frontend', label: 'Frontend', order: 3 },
      { id: 'backend', label: 'Backend', order: 4 },
      { id: 'mobile', label: 'Mobile', order: 5 },
    ],
  },
  experience: {
    categories: [
      {
        name: 'Engineering Experience',
        items: [
          {
            id: 'exp-1',
            role: 'Frontend Developer Intern',
            title: 'Frontend Developer Intern',
            company: 'Askuala Link Software Company',
            location: 'Ethiopia',
            duration: '2024 — Present',
            current: true,
            description: 'Building enterprise-grade React + Node.js systems. Architecting microservice backends, real-time WebSocket dashboards, and TOTP 2FA authentication flows for production deployments.',
            bullets: [
              'Architected real-time WebSocket event streaming dashboards cutting state synchronization latency by 45%.',
              'Implemented end-to-end TOTP 2FA authentication pipelines and JWT authorization middleware across distributed microservices.',
              'Developed high-performance component architecture in React with Tailwind CSS and Framer Motion micro-interactions.',
            ],
            tags: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'Express'],
            skills: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'Express'],
            logo: '',
          },
          {
            id: 'exp-2',
            role: 'Full Stack Developer',
            title: 'Full Stack Developer',
            company: 'Freelance',
            location: 'Remote',
            duration: '2023 — 2024',
            current: false,
            description: 'Delivered 8+ production MERN stack applications including real estate platforms, college management systems, and agricultural marketplaces for Ethiopian clients.',
            bullets: [
              'Engineered responsive web applications for diverse industry verticals from conception through deployment.',
              'Integrated role-based access control, complex aggregation queries, and third-party payment gateways.',
              'Optimized database indices and API latency, achieving sub-100ms response times on high-load endpoints.',
            ],
            tags: ['MERN', 'REST API', 'JWT', 'Tailwind', 'Flutter'],
            skills: ['MERN', 'REST API', 'JWT', 'Tailwind', 'Flutter'],
            logo: '',
          },
        ],
      },
      {
        name: 'Education',
        items: [
          {
            id: 'edu-1',
            role: 'B.Sc. in Computer Science',
            title: 'B.Sc. in Computer Science',
            company: 'Bahir Dar University',
            location: 'Bahir Dar, Ethiopia',
            duration: '2022 — Present',
            current: true,
            description: 'Third-year CS student. Core coursework in algorithms, distributed systems, database design, and operating systems — applied directly to production projects.',
            bullets: [
              'Maintained top academic standing in core algorithmic thinking, computational complexity, and system design.',
              'Collaborated on departmental software projects focusing on relational schema design and network protocols.',
              'Applied academic distributed systems principles directly to real-world MERN production deployments.',
            ],
            tags: ['Algorithms', 'Data Structures', 'System Design', 'DB Architecture'],
            skills: ['Algorithms', 'Data Structures', 'System Design', 'DB Architecture'],
            logo: '',
          },
        ],
      },
    ],
  },
  certificates: [
    {
      id: 'cert-1',
      name: 'Meta Front-End Developer',
      issuer: 'Meta',
      issuerColor: '#0081FB',
      date: '2024',
      image: '/certificates/meta-frontend.svg',
      credentialUrl: '#',
      skills: ['React', 'JavaScript', 'CSS'],
    },
    {
      id: 'cert-2',
      name: 'MongoDB Node.js Developer Path',
      issuer: 'MongoDB University',
      issuerColor: '#47A248',
      date: '2024',
      image: '/certificates/mongodb-developer.svg',
      credentialUrl: '#',
      skills: ['MongoDB', 'Node.js', 'Aggregation'],
    },
    {
      id: 'cert-3',
      name: 'Back End Development and APIs',
      issuer: 'freeCodeCamp',
      issuerColor: '#FF4D00',
      date: '2023',
      image: '/certificates/fcc-backend.svg',
      credentialUrl: '#',
      skills: ['Node.js', 'Express', 'REST APIs'],
    },
    {
      id: 'cert-4',
      name: 'Responsive Web Design',
      issuer: 'freeCodeCamp',
      issuerColor: '#FF4D00',
      date: '2023',
      image: '/certificates/fcc-responsive.svg',
      credentialUrl: '#',
      skills: ['HTML', 'CSS', 'Flexbox', 'Grid'],
    },
  ],
  contactInfo: {
    email: 'esubalew392@gmail.com',
    phone: '+251 915795794',
    location: 'Bahir Dar, Ethiopia',
    formTitle: 'What are we building?',
    formDescription: 'Select your project type',
    formButtonText: 'Send Brief',
    successMessage: "I'll review your inquiry and respond within 24 hours.",
    wizard: {
      steps: [
        { stepNumber: 1, title: 'What are we building?', description: 'Select your project type' },
        { stepNumber: 2, title: 'Tell me who you are.', description: 'Your contact information' },
        { stepNumber: 3, title: 'When do you need this?', description: 'Select your timeline' },
      ],
      projectTypes: [
        { value: 'web-app', title: 'Web App', desc: 'React · Next.js · Full Stack' },
        { value: 'mobile-app', title: 'Mobile App', desc: 'Flutter · Cross Platform' },
        { value: 'api-backend', title: 'API / Backend', desc: 'Node · Express · NestJS' },
        { value: 'full-system', title: 'Full System', desc: 'End-to-End Architecture' },
      ],
      timelines: [
        { value: 'asap', number: '01', title: 'As Soon As Possible', desc: 'Ready to start immediately' },
        { value: '1-3-months', number: '02', title: '1–3 Months', desc: 'Planning phase, flexible start' },
        { value: '3-plus-months', number: '03', title: '3+ Months', desc: 'Long-term planning' },
      ],
      submitButtonText: 'Send Brief',
      submittingButtonText: 'Sending...',
      responseTimeText: 'Response within 24 hours',
      privacyText: 'Your data is never shared',
    },
  },
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/esubalew7', enabled: true },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/esubalew-molla-7a584739b', enabled: true },
    { platform: 'Telegram', url: 'https://t.me/Esuman7', enabled: true },
  ],
  navbar: {
    brand: 'Esubalew',
    navItems: [
      { id: 'home', label: 'Home', sectionId: 'home', order: 1, visible: true },
      { id: 'about', label: 'About', sectionId: 'about', order: 2, visible: true },
      { id: 'skills', label: 'Skills', sectionId: 'skills', order: 3, visible: true },
      { id: 'projects', label: 'Work', sectionId: 'projects', order: 4, visible: true },
      { id: 'experience', label: 'Timeline', sectionId: 'experience', order: 5, visible: true },
      { id: 'contact', label: 'Contact', sectionId: 'contact', order: 6, visible: true },
    ],
  },
  resume: {
    url: '/resume.pdf',
    title: 'Resume',
  },
  terminal: {
    enabled: true,
    title: 'Command Prompt',
    subtitle: 'Interactive Developer Console',
    welcomeMessage: `        WELCOME TO MY INTERACTIVE DEVELOPER TERMINAL        

Hi, I'm an interactive terminal that lets you explore my portfolio,
projects, and professional journey.

Getting Started:
   • Type 'help' to see all available commands
   • Use Arrow Keys ↑↓ to navigate command history
   • Click links to open external profiles

Quick Commands:
   • about        → Learn about me
   • experience   → View my work history
   • projects     → Browse portfolio projects
   • skills       → See my technical skills
   • contact      → Get in touch

Ready to explore? Let's go!`,
    promptPrefix: 'E C:\\esubalew\\portfolio>',
    shortcut: 'Ctrl+`',
    showEntryPoint: true,
    commands: [
      { id: 'help', name: 'help', description: 'Show all available commands', category: 'System', aliases: ['h', '?'], enabled: true, order: 1 },
      { id: 'about', name: 'about', description: 'Information about me and background', category: 'Information', aliases: ['whoami', 'info'], enabled: true, order: 2 },
      { id: 'skills', name: 'skills', description: 'View technical skills and stack', category: 'Information', aliases: ['tech', 'techstack'], enabled: true, order: 3 },
      { id: 'projects', name: 'projects', description: 'View portfolio projects', category: 'Portfolio', aliases: ['proj'], enabled: true, order: 4 },
      { id: 'experience', name: 'experience', description: 'My professional experience and roles', category: 'Information', aliases: ['exp'], enabled: true, order: 5 },
      { id: 'education', name: 'education', description: 'Educational background and certifications', category: 'Information', aliases: ['edu'], enabled: true, order: 6 },
      { id: 'resume', name: 'resume', description: 'Download my CV/Resume', category: 'Portfolio', aliases: ['cv'], enabled: true, order: 7 },
      { id: 'contact', name: 'contact', description: 'Get direct contact details', category: 'Links', aliases: ['mail', 'email'], enabled: true, order: 8 },
      { id: 'github', name: 'github', description: 'Open GitHub profile', category: 'Links', aliases: ['gh'], enabled: true, order: 9 },
      { id: 'linkedin', name: 'linkedin', description: 'Open LinkedIn profile', category: 'Links', aliases: ['in'], enabled: true, order: 10 },
      { id: 'clear', name: 'clear', description: 'Clear terminal history', category: 'System', aliases: ['cls', 'rm'], enabled: true, order: 11 },
    ],
  },
  sections: {
    hero: true,
    about: true,
    skills: true,
    projects: true,
    experience: true,
    testimonials: true,
    terminal: false,
    contact: true,
  },
  testimonials: [
    {
      name: 'Marcus Vance',
      role: 'Founder & CTO',
      company: 'Vance Media Labs',
      platform: 'Upwork',
      rating: 5,
      text: 'Esubalew delivered our full-stack MERN application with exceptional precision. His architectural decisions around WebSocket state streaming cut our server latency by 45%. Clear communicator, proactive, and one of the best engineers on Upwork.',
      date: 'August 2024',
      enabled: true,
    },
    {
      name: 'Anonymous Client',
      role: 'Product Lead',
      company: 'FinTech Enterprise',
      platform: 'Direct',
      rating: 5,
      text: 'Hired Esubalew for critical backend security and TOTP 2FA architecture. He shipped the complete production auth pipeline in 4 days with zero vulnerabilities and complete documentation. Highly recommended.',
      date: 'October 2024',
      enabled: true,
    },
    {
      name: 'Elena Rostova',
      role: 'Engineering Director',
      company: 'CloudScale SaaS',
      platform: 'LinkedIn',
      rating: 5,
      text: 'A rare engineer who masters high-throughput Node.js microservices as well as sleek, responsive frontend interfaces. He hit every milestone on schedule with production-grade code quality.',
      date: 'December 2024',
      enabled: true,
    },
  ],
  footer: {
    copyright: 'All rights reserved.',
    text: 'Built with care and shipped to production.',
    attribution: 'Built with React + Three.js',
  },
  seo: {
    title: 'Esubalew Molla | Full-Stack Software Engineer',
    description:
      'Portfolio of Esubalew Molla — Full-Stack Software Engineer based in Ethiopia. Specializing in React, Node.js, MERN stack, distributed systems, and high-performance web architecture.',
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

  const bullets = Array.isArray(item.bullets)
    ? item.bullets
    : description ? [description] : [];

  return {
    ...item,
    id: item._id || item.id || '',
    title: item.title || item.role || '',
    role: item.role || item.title || '',
    company: item.company || item.institution || item.organization || '',
    location: item.location || '',
    description,
    bullets,
    skills,
    tags: Array.isArray(item.tags) && item.tags.length ? item.tags : skills,
    logo: item.logo || '',
    period: item.period || duration || (startYear ? `${startYear} — ${endYear}` : ''),
    startDate: item.startDate || startYear,
    endDate: isCurrent ? 'Present' : item.endDate || endYear,
    current: isCurrent,
    order: item.order ?? 0,
    published: item.published !== false,
  };
}

export function mapBackendContent(raw) {
  if (!raw) return defaultContent;

  const data = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;

  const rawExpCategories = data.experience?.categories || [];
  const mappedExperienceCategories = rawExpCategories
    .filter((cat) => cat.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((cat) => ({
      ...cat,
      id: cat._id || cat.id || '',
      name: cat.name || '',
      order: cat.order ?? 0,
      published: cat.published !== false,
      items: (Array.isArray(cat.items) ? cat.items : [])
        .filter((item) => item.published !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(mapExperienceItem),
    }));

  const rawCertificates = Array.isArray(data.certificates)
    ? data.certificates
    : Array.isArray(data.experience?.certificates)
      ? data.experience.certificates
      : [];

  const mappedCertificates = rawCertificates
    .filter((cert) => cert.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((cert) => ({
      id: cert._id || cert.id || '',
      name: cert.name || '',
      issuer: cert.issuer || '',
      issuerColor: cert.issuerColor || cert.color || '#FF4D00',
      date: cert.date || '',
      image: cert.image || '',
      credentialUrl: cert.credentialUrl || cert.url || '#',
      url: cert.url || cert.credentialUrl || '#',
      skills: Array.isArray(cert.skills) ? cert.skills : [],
      order: cert.order ?? 0,
      published: cert.published !== false,
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
      metrics: Array.isArray(data.hero?.metrics) && data.hero.metrics.length > 0
        ? data.hero.metrics
        : defaultContent.hero.metrics,
      availabilityBanner: {
        ...defaultContent.hero.availabilityBanner,
        ...(data.hero?.availabilityBanner || {}),
      },
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
      dossierRef: data.about?.dossierRef || defaultContent.about.dossierRef,
      clearanceLevel: data.about?.clearanceLevel || defaultContent.about.clearanceLevel,
      personnelId: data.about?.personnelId || defaultContent.about.personnelId,
      description: data.about?.description || defaultContent.about.description,
      image: data.about?.image || defaultContent.about.image,
      education: data.about?.education || defaultContent.about.education,
      stats: Array.isArray(data.about?.stats) && data.about.stats.length
        ? data.about.stats
        : defaultContent.about.stats,
      competencies: Array.isArray(data.about?.competencies) && data.about.competencies.length > 0
        ? data.about.competencies
        : defaultContent.about.competencies,
      assignments: Array.isArray(data.about?.assignments) && data.about.assignments.length > 0
        ? data.about.assignments
        : defaultContent.about.assignments,
    },
    skills: {
      ...defaultContent.skills,
      ...data.skills,
      categories: Array.isArray(data.skills?.categories)
        ? data.skills.categories
        : defaultContent.skills.categories,
    },
    projectsSection: {
      ...defaultContent.projectsSection,
      ...(data.projectsSection || {}),
      filters: Array.isArray(data.projectsSection?.filters) && data.projectsSection.filters.length > 0
        ? data.projectsSection.filters
        : defaultContent.projectsSection.filters,
    },
    experience: {
      ...defaultContent.experience,
      ...data.experience,
      title: data.experience?.title || defaultContent.experience.title,
      subtitle: data.experience?.subtitle || defaultContent.experience.subtitle,
      eyebrow: data.experience?.eyebrow || defaultContent.experience.eyebrow || 'Career Record',
      resumeUrl: data.experience?.resumeUrl || data.resume?.url || defaultContent.resume.url,
      resumeText: data.experience?.resumeText || 'Resume',
      categories: mappedExperienceCategories,
    },
    certificates: mappedCertificates.length > 0 ? mappedCertificates : (data.certificates !== undefined ? [] : defaultContent.certificates),
    contactInfo: {
      ...defaultContent.contactInfo,
      ...data.contactInfo,
      email: data.contactInfo?.email || defaultContent.contactInfo.email,
      phone: data.contactInfo?.phone || defaultContent.contactInfo.phone,
      location: data.contactInfo?.location || defaultContent.contactInfo.location,
      wizard: {
        ...defaultContent.contactInfo.wizard,
        ...(data.contactInfo?.wizard || {}),
      },
    },
    socialLinks: resolvedSocialLinks,
    navbar: {
      ...defaultContent.navbar,
      ...(data.navbar || {}),
      navItems: Array.isArray(data.navbar?.navItems) && data.navbar.navItems.length > 0
        ? data.navbar.navItems
        : defaultContent.navbar.navItems,
    },
    resume: {
      ...defaultContent.resume,
      ...data.resume,
      url: data.resume?.url || data.hero?.cta?.secondary?.link || defaultContent.resume.url,
    },
    sections: {
      ...defaultContent.sections,
      ...(data.sections || {}),
      testimonials: data.sections?.testimonials !== undefined ? data.sections.testimonials : true,
      terminal: data.sections?.terminal !== undefined ? data.sections.terminal : true,
    },
    terminal: {
      ...defaultContent.terminal,
      ...(data.terminal || {}),
      enabled: data.terminal?.enabled !== undefined ? data.terminal.enabled : defaultContent.terminal.enabled,
      title: data.terminal?.title || defaultContent.terminal.title,
      subtitle: data.terminal?.subtitle || defaultContent.terminal.subtitle,
      welcomeMessage: data.terminal?.welcomeMessage !== undefined ? data.terminal.welcomeMessage : defaultContent.terminal.welcomeMessage,
      promptPrefix: data.terminal?.promptPrefix || defaultContent.terminal.promptPrefix,
      shortcut: data.terminal?.shortcut || defaultContent.terminal.shortcut,
      showEntryPoint: data.terminal?.showEntryPoint !== undefined ? data.terminal.showEntryPoint : defaultContent.terminal.showEntryPoint,
      commands: Array.isArray(data.terminal?.commands) && data.terminal.commands.length > 0
        ? data.terminal.commands
        : defaultContent.terminal.commands,
    },
    footer: {
      ...defaultContent.footer,
      ...data.footer,
      copyright: data.footer?.copyright || defaultContent.footer.copyright,
      text: data.footer?.copyright || defaultContent.footer.text,
      attribution: data.footer?.attribution || defaultContent.footer.attribution,
    },
    testimonials: (
      (Array.isArray(data.testimonials) && data.testimonials.length > 0
        ? data.testimonials
        : Array.isArray(data.testimonials?.items) && data.testimonials.items.length > 0
          ? data.testimonials.items
          : defaultContent.testimonials) || defaultContent.testimonials
    ).map((t) => ({
      name: t.name || 'Anonymous client',
      role: t.role || '',
      company: t.company || '',
      platform: t.platform || 'Direct',
      rating: Number(t.rating) || 5,
      text: t.text || t.feedback || '',
      date: t.date || '2024',
      enabled: t.enabled !== false,
    })),
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
