export const realContentData = {
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
  navbar: {
    logo: '',
    navItems: [
      { label: 'Home', id: 'home' },
      { label: 'About', id: 'about' },
      { label: 'Skills', id: 'skills' },
      { label: 'Work', id: 'projects' },
      { label: 'Timeline', id: 'experience' },
      { label: 'Contact', id: 'contact' },
    ],
  },
  footer: {
    copyright: 'All rights reserved.',
    socials: [
      { platform: 'GitHub', url: 'https://github.com/esubalew7', enabled: true },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/esubalew-molla-7a584739b', enabled: true },
      { platform: 'Telegram', url: 'https://t.me/Esuman7', enabled: true },
    ],
  },
  hero: {
    greeting: 'Hello, I am',
    name: 'Esubalew Molla',
    titles: [
      'Full Stack Developer.',
      'MERN Specialist.',
      'PERN Architect.',
      'Flutter Engineer.',
      'Distributed Systems.',
    ],
    description:
      'Building production-grade distributed systems, MERN & PERN platforms, and real-time web architecture — from API design to deployment pipeline.',
    image: '/images/esu.png',
    backgroundImage: '',
    available: true,
    cta: {
      primary: { text: 'View Projects', link: '#projects' },
      secondary: { text: 'Download Resume', link: '/resume.pdf' },
    },
  },
  about: {
    title: 'About Me',
    subtitle: 'Full Stack Engineer & 3rd-year CS Student at Bahir Dar University',
    description:
      "I'm Esubalew Molla — a full-stack engineer based in Ethiopia and a 3rd-year Computer Science student at Bahir Dar University, currently interning at Askuala Link. I architect and ship distributed systems that handle real-world production loads: from JWT + TOTP 2FA backends to live WebSocket-synced admin dashboards.",
    image: '/images/esu.png',
    stats: [
      { label: 'Years of production code', value: 3, suffix: '+' },
      { label: 'Full-stack systems shipped', value: 15, suffix: '+' },
      { label: 'Live production stacks', value: 3, suffix: '' },
    ],
    cta: {
      text: 'Start a conversation',
      link: '#contact',
    },
  },
  skills: {
    title: 'Core Skills',
    subtitle: 'The stack I ship to production.',
    categories: [
      {
        name: 'Frontend & Mobile',
        items: [
          { name: 'JavaScript', level: 93 },
          { name: 'React', level: 90 },
          { name: 'Tailwind', level: 90 },
          { name: 'TypeScript', level: 80 },
          { name: 'Flutter', level: 70 },
        ],
      },
      {
        name: 'Backend & Architecture',
        items: [
          { name: 'Node.js', level: 88 },
          { name: 'Express', level: 87 },
          { name: 'NestJS', level: 70 },
          { name: 'Python', level: 68 },
          { name: 'Swagger', level: 72 },
        ],
      },
      {
        name: 'Database & DevOps',
        items: [
          { name: 'MongoDB', level: 85 },
          { name: 'PostgreSQL', level: 72 },
          { name: 'Docker', level: 65 },
        ],
      },
      {
        name: 'Tools & Testing',
        items: [
          { name: 'Postman', level: 85 },
          { name: 'Git', level: 90 },
        ],
      },
    ],
  },
  experience: {
    title: 'Experience',
    subtitle: 'A timeline of production systems, software engineering internships, and academic excellence.',
    categories: [
      {
        name: 'Engineering Experience',
        items: [
          {
            role: 'Frontend Developer Intern',
            company: 'Askuala Link Software Company',
            duration: '2024 — Present',
            location: 'Bahir Dar, Ethiopia',
            tags: ['React', 'Node.js', 'MongoDB', 'Socket.IO', 'Express', '2FA'],
            bullets: [
              'Building enterprise-grade React + Node.js systems with real-time state synchronization.',
              'Architecting microservice backends, WebSocket dashboard streaming, and TOTP 2FA authentication flows for production deployments.',
            ],
            logo: 'images/askuala.jpg',
          },
          {
            role: 'Freelance Full Stack Developer',
            company: 'Self-Employed / Freelance',
            duration: '2023 — 2024',
            location: 'Remote / Ethiopia',
            tags: ['MERN', 'REST API', 'JWT', 'Tailwind', 'Flutter', 'PostgreSQL'],
            bullets: [
              'Delivered 8+ production MERN stack applications including real estate platforms, college management systems, and agricultural marketplaces.',
              'Engineered resilient MongoDB and PostgreSQL schemas, role-based access control, and mobile clients with Flutter.',
            ],
            logo: '',
          },
        ],
      },
      {
        name: 'Education',
        items: [
          {
            role: 'Computer Science (B.Sc.) - 3rd Year',
            company: 'Bahir Dar University',
            duration: '2022 — Present',
            location: 'Bahir Dar, Ethiopia',
            tags: ['Algorithms', 'Data Structures', 'Database Architecture', 'System Design'],
            bullets: [
              'Third-year Computer Science student pursuing high-rigor engineering coursework.',
              'Advanced study in distributed systems, network security, operating systems, and database optimization.',
            ],
            logo: 'images/bdu.jpg',
          },
        ],
      },
    ],
  },
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/esubalew7', enabled: true },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/esubalew-molla-7a584739b', enabled: true },
    { platform: 'Telegram', url: 'https://t.me/Esuman7', enabled: true },
  ],
  resume: {
    title: 'Resume',
    url: '/resume.pdf',
    buttonText: 'Download Resume',
  },
  contactInfo: {
    email: 'esubalew392@gmail.com',
    phone: '+251 915795794',
    location: 'Ethiopia',
    formTitle: "Let's build something serious.",
    formDescription:
      'Whether it is a new system, a freelance engagement, or a full-time engineering role — I respond to every message within 24 hours.',
    formButtonText: 'Send Message',
    successMessage: 'Thank you! Your message has been sent successfully.',
  },
  testimonials: {
    title: 'Client Feedback',
    subtitle: 'What clients and engineering leads say about working with me.',
    items: [
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
        name: 'Anonymous client',
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
        text: 'Rare engineer who masters high-throughput Node.js microservices as well as sleek, pixel-perfect frontend interfaces. He hit every single milestone ahead of schedule with production-grade code quality.',
        date: 'December 2024',
        enabled: true,
      },
    ],
  },
  seo: {
    title: 'Esubalew Molla | Full Stack Developer',
    description: 'Portfolio of Esubalew Molla, Full Stack Developer specializing in MERN, PERN, and Flutter.',
    keywords: 'Esubalew Molla, Full Stack Developer, MERN, PERN, Flutter, React, Node.js, Ethiopia',
  },
};

export const realProjectsData = [
  {
    title: 'Real Estate Management Platform',
    description:
      'A full-featured MERN stack property marketplace with role-based dashboard, property filtering, inquiry workflows, and image management.',
    category: 'mern',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    liveLink: 'https://github.com/esubalew7',
    githubLink: 'https://github.com/esubalew7',
    caseStudy: {
      problem:
        'Property agents and buyers suffered from fragmented communication channels, unorganized listings with slow search performance, and lack of inquiry status visibility, causing high lead drop-off rates.',
      solution:
        'Architected a unified MERN portal featuring indexed compound MongoDB geo-filtering, role-based dashboards (Agent, Buyer, Admin), automated inquiry tracking, and CDN-optimized image pipelines.',
      techStack: ['React 18', 'Node.js', 'Express', 'MongoDB Atlas', 'Tailwind CSS', 'Multer + Cloudinary'],
      outcome:
        'Reduced property search latency by 64% and improved lead conversion turnaround from 48 hours to under 4 hours with instant inquiry routing.',
      metrics: [
        { label: 'Query Speedup', value: '64%' },
        { label: 'Lead Turnaround', value: '< 4h' },
        { label: 'Active Listings', value: '1,200+' },
      ],
    },
  },
  {
    title: 'College Management System',
    description:
      'An administrative and academic tracking platform managing students, courses, grades, and faculty records with JWT-secured endpoints.',
    category: 'mern',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    liveLink: 'https://github.com/esubalew7',
    githubLink: 'https://github.com/esubalew7',
    caseStudy: {
      problem:
        'Manual spreadsheet record-keeping led to frequent grade calculation discrepancies, unauthorized access risks, and high administrative bottlenecks during student registration periods.',
      solution:
        'Engineered a multi-tenant university portal with JWT authentication, RBAC authorization matrices, automated grade GPA computation engines, and transactional MongoDB course registration pipelines.',
      techStack: ['React', 'Express.js', 'MongoDB', 'JWT Auth', 'Bcrypt.js', 'Tailwind CSS'],
      outcome:
        'Eliminated transcript processing errors and reduced semester enrollment registration processing time from 3 days down to 15 minutes per batch.',
      metrics: [
        { label: 'Process Time', value: '92% cut' },
        { label: 'Data Accuracy', value: '100%' },
        { label: 'Concurrent Users', value: '2,500+' },
      ],
    },
  },
  {
    title: 'Agricultural Marketplace',
    description:
      'A digital supply-chain marketplace connecting farmers with buyers, featuring real-time inventory listings, location-based matching, and order tracking.',
    category: 'mern',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Redux Toolkit'],
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&q=80',
    liveLink: 'https://github.com/esubalew7',
    githubLink: 'https://github.com/esubalew7',
    caseStudy: {
      problem:
        'Smallholder farmers faced severe exploitation by predatory middlemen, opaque commodity pricing, and high crop spoilage rates due to delayed order matching.',
      solution:
        'Developed a peer-to-peer agro-marketplace empowering farmers with live market price feeds, direct buyer bidding, SMS notifications, and localized regional filtering algorithms.',
      techStack: ['React', 'Redux Toolkit', 'Node.js', 'Express', 'MongoDB GeoJSON', 'Socket.IO'],
      outcome:
        'Increased participating farmers net profit margins by 35% and decreased post-harvest supply matching time from 5 days to 24 hours.',
      metrics: [
        { label: 'Farmer Margins', value: '+35%' },
        { label: 'Supply Matching', value: '< 24h' },
        { label: 'Orders Shipped', value: '5,000+' },
      ],
    },
  },
  {
    title: 'Distributed Real-Time Operations Platform',
    description:
      'High-throughput backend service with WebSocket event streaming, TOTP 2FA authentication, and low-latency system health monitors.',
    category: 'backend',
    technologies: ['Node.js', 'PostgreSQL', 'Socket.IO', 'Express', 'Docker'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    liveLink: 'https://github.com/esubalew7',
    githubLink: 'https://github.com/esubalew7',
    caseStudy: {
      problem:
        'Enterprise operations teams needed sub-second visibility into system telemetry and high-frequency IoT sensor alerts, while legacy polling caused severe database lockups.',
      solution:
        'Designed an event-driven architecture using Socket.IO room namespaces, RFC 6238 TOTP two-factor authentication, connection pooling, and Docker containerization.',
      techStack: ['Node.js', 'PostgreSQL', 'Socket.IO', 'Docker', 'JWT + Speakeasy 2FA', 'Nginx'],
      outcome:
        'Handled 10,000+ concurrent WebSocket connections with sub-50ms event propagation latency and zero downtime across production failovers.',
      metrics: [
        { label: 'WebSocket Latency', value: '< 50ms' },
        { label: 'Concurrency', value: '10,000+' },
        { label: 'Auth Security', value: 'TOTP 2FA' },
      ],
    },
  },
];
