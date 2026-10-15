import PortfolioContent from "../models/PortfolioContent.js";
import jwt from "jsonwebtoken";
import { emitContentSectionUpdated } from "../socket/emitters.js";
import { createNotification } from "../services/notificationService.js";
import { propagateHeroToDependents } from "../services/contentPropagationService.js";

const SOCIAL_PLATFORMS_DEFAULT = [
  { platform: "GitHub", url: "https://github.com/esubalew7", enabled: true },
  { platform: "LinkedIn", url: "https://linkedin.com/in/esubalew-molla-7a584739b", enabled: true },
  { platform: "Telegram", url: "https://t.me/Esuman7", enabled: true },
  { platform: "Facebook", url: "https://facebook.com", enabled: true },
  { platform: "Twitter", url: "https://twitter.com", enabled: true },
  { platform: "Instagram", url: "https://instagram.com/esubalew_7_7", enabled: true },
];

const getDefaultContent = () => ({
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
    logo: "",
    navItems: [
      { label: "Home", id: "home" },
      { label: "About", id: "about" },
      { label: "Skills", id: "skills" },
      { label: "Projects", id: "projects" },
      { label: "Experience", id: "experience" },
      { label: "Contact", id: "contact" },
    ],
  },
  footer: {
    copyright: "All rights reserved.",
    attribution: "Built with React + Three.js",
    socials: SOCIAL_PLATFORMS_DEFAULT,
  },
  hero: {
    greeting: "Hello, I am",
    name: "Esubalew Molla",
    titles: [
      "Full Stack Engineer.",
      "System Architect.",
      "MERN Specialist.",
      "Distributed Systems.",
      "Real-Time Platforms.",
    ],
    description:
      "Building production-grade distributed systems, MERN platforms, and real-time web architecture — from API design to deployment pipeline.",
    image: "/images/esu.png",
    backgroundImage: "",
    available: true,
    availabilityBanner: {
      visible: true,
      badgeText: "AVAILABLE FOR FREELANCE",
      subText: "RESPONSE TIME < 24H",
      buttonText: "BOOK A CALL",
      buttonLink: "#contact",
    },
    metrics: [
      { id: "hm-1", value: "3+", label: "Years building", suffix: "", order: 1, visible: true },
      { id: "hm-2", value: "15+", label: "Systems shipped", suffix: "", order: 2, visible: true },
      { id: "hm-3", value: "3", label: "Production stacks", suffix: "", order: 3, visible: true },
      { id: "hm-4", value: "2FA", label: "Auth architecture", suffix: "", order: 4, visible: true },
    ],
    cta: {
      primary: { text: "Selected Work", link: "#projects" },
      secondary: { text: "Download CV", link: "/resume.pdf" },
    },
  },
  about: {
    title: "About Me",
    subtitle: "Full Stack Engineer & 3rd-year CS Student at Bahir Dar University",
    description:
      "I'm Esubalew — a full-stack engineer based in Ethiopia, currently interning at Askuala Link. I architect and ship distributed systems that handle real-world production loads: from JWT + TOTP 2FA backends to live WebSocket-synced admin dashboards. My approach is architecture first: I think in event flows, caching layers, and separation of concerns before writing the first line of code. The result is software that scales and doesn't break at 3 AM.",
    image: "/images/esu.png",
    dossierRef: "Ref: ESU-2024",
    clearanceLevel: "Senior Engineer",
    personnelId: "ID: ESU-001",
    stats: [
      { label: "Years of production code", value: 3, suffix: "+" },
      { label: "Systems Shipped", value: 15, suffix: "+" },
      { label: "Live production stacks", value: 3, suffix: "" },
    ],
    competencies: [
      "MERN Stack", "PERN Stack", "Flutter", "Node.js", "React", "TypeScript",
      "PostgreSQL", "MongoDB", "Docker", "Socket.IO", "REST API", "Microservices",
      "NestJS", "Redis", "RabbitMQ", "JWT Auth", "2FA", "Swagger", "Postman", "Git"
    ].map((name, i) => ({ id: `comp-${i + 1}`, name, order: i + 1, visible: true })),
    assignments: [
      {
        id: "asgn-1",
        organization: "Askuala Link Software Co.",
        role: "Frontend Developer Intern",
        period: "2024 — Present",
        status: "Active",
        order: 1,
        visible: true,
      },
      {
        id: "asgn-2",
        organization: "Bahir Dar University",
        role: "B.Sc. Computer Science",
        period: "2022 — Present",
        status: "Active",
        order: 2,
        visible: true,
      },
    ],
    cta: { text: "Start a Conversation", link: "#contact" },
  },
  skills: {
    title: "Technical Arsenal",
    subtitle: "The stack I ship to production.",
    categories: [
      {
        name: "Frontend",
        orbit: "orbit-1",
        items: [
          { id: "sk-1", name: "JavaScript", level: "Advanced", exp: "3+ yrs", orbit: "orbit-1", category: "Core Language", description: "Modern ES2024+ JavaScript powering responsive applications and async pipelines.", tags: ["ESNext", "Async/Await", "DOM", "Performance"], iconSlug: "javascript", order: 1, visible: true },
          { id: "sk-2", name: "TypeScript", level: "Advanced", exp: "2+ yrs", orbit: "orbit-1", category: "Full-Stack Type System", description: "Enterprise typed JavaScript ensuring compile-time contracts, strict types, and robust refactoring.", tags: ["Type Safety", "Generics", "Interfaces", "Strict Mode"], iconSlug: "typescript", order: 2, visible: true },
          { id: "sk-3", name: "React", level: "Advanced", exp: "3+ yrs", orbit: "orbit-1", category: "Frontend UI Library", description: "Building interactive, scalable user interfaces using component-driven architecture.", tags: ["React 19", "Hooks", "SPA", "Vite", "Component UI"], iconSlug: "react", order: 3, visible: true },
          { id: "sk-4", name: "Next.js", level: "Advanced", exp: "1+ yr", orbit: "orbit-1", category: "Full-Stack React Framework", description: "Production React framework for high-performance SSR, Server Components, and edge rendering.", tags: ["App Router", "SSR", "Server Actions", "Edge API"], iconSlug: "nextdotjs", order: 4, visible: true },
          { id: "sk-5", name: "Tailwind CSS", level: "Advanced", exp: "2+ yrs", orbit: "orbit-1", category: "Design Systems & UI", description: "Utility-first CSS framework for building ultra-fast, responsive, and custom design systems.", tags: ["Utility CSS", "Design Tokens", "Dark Mode", "Responsive"], iconSlug: "tailwindcss", order: 5, visible: true },
        ],
      },
      {
        name: "Backend",
        orbit: "orbit-2",
        items: [
          { id: "sk-6", name: "Node.js", level: "Advanced", exp: "3+ yrs", orbit: "orbit-2", category: "Backend Architecture", description: "High-throughput asynchronous runtime powering distributed backends and event streams.", tags: ["Event Loop", "Streams", "Async I/O", "V8 Engine"], iconSlug: "nodedotjs", order: 1, visible: true },
          { id: "sk-7", name: "Express", level: "Advanced", exp: "3+ yrs", orbit: "orbit-2", category: "Backend Framework", description: "Fast, minimalist server framework for scalable REST APIs, authentication, and middleware.", tags: ["REST APIs", "Middleware", "JWT Auth", "CORS"], iconSlug: "express", order: 2, visible: true },
          { id: "sk-8", name: "NestJS", level: "Intermediate", exp: "1+ yr", orbit: "orbit-2", category: "Enterprise Microservices", description: "Structured enterprise TypeScript backend framework built on dependency injection and modules.", tags: ["Dependency Injection", "Decorators", "Microservices", "DTOs"], iconSlug: "nestjs", order: 3, visible: true },
          { id: "sk-9", name: "Redis", level: "Intermediate", exp: "1+ yr", orbit: "orbit-2", category: "In-Memory Data Store", description: "Ultra-fast in-memory data cache for high-speed session storage, rate limiting, and pub/sub queues.", tags: ["In-Memory", "Pub/Sub", "TTL Caching", "Session Store"], iconSlug: "redis", order: 4, visible: true },
          { id: "sk-10", name: "RabbitMQ", level: "Active Learner", exp: "< 1 yr", orbit: "orbit-2", category: "Message Broker Systems", description: "Distributed message broker orchestrating decoupled asynchronous queues and event architectures.", tags: ["AMQP", "Message Queues", "Dead Letter", "Decoupling"], iconSlug: "rabbitmq", order: 5, visible: true },
        ],
      },
      {
        name: "Data & Infrastructure",
        orbit: "orbit-3",
        items: [
          { id: "sk-11", name: "MongoDB", level: "Advanced", exp: "3+ yrs", orbit: "orbit-3", category: "NoSQL Database", description: "Scalable document database with aggregation pipelines, compound indices, and geospatial querying.", tags: ["Aggregation", "Indexing", "Mongoose", "GeoJSON"], iconSlug: "mongodb", order: 1, visible: true },
          { id: "sk-12", name: "PostgreSQL", level: "Advanced", exp: "2+ yrs", orbit: "orbit-3", category: "Relational Database", description: "Advanced relational database management with strict ACID compliance, relational schemas, and complex joins.", tags: ["Relational", "ACID", "SQL Joins", "Indexing"], iconSlug: "postgresql", order: 2, visible: true },
          { id: "sk-13", name: "Docker", level: "Intermediate", exp: "1+ yr", orbit: "orbit-3", category: "Containerization & DevOps", description: "Lightweight container virtualization standardizing isolated multi-service development and production setups.", tags: ["Containers", "Images", "Docker Compose", "Multi-Stage"], iconSlug: "docker", order: 3, visible: true },
          { id: "sk-14", name: "Microservices", level: "Intermediate", exp: "1+ yr", orbit: "orbit-3", category: "Distributed Architecture", description: "Decoupled domain-driven service architecture with independent deployment cycles and fault isolation.", tags: ["Event-Driven", "API Gateway", "Service Mesh", "Fault Isolation"], iconSlug: "microservices", order: 4, visible: true },
        ],
      },
      {
        name: "Mobile & Tools",
        orbit: "orbit-4",
        items: [
          { id: "sk-15", name: "Flutter", level: "Intermediate", exp: "1+ yr", orbit: "orbit-4", category: "Cross-Platform Mobile UI", description: "High-performance cross-platform mobile framework compiling to native ARM binaries for iOS and Android.", tags: ["Dart", "State Management", "Cross-Platform", "Mobile UI"], iconSlug: "flutter", order: 1, visible: true },
          { id: "sk-16", name: "Git", level: "Advanced", exp: "3+ yrs", orbit: "orbit-4", category: "Version Control & Collaboration", description: "Distributed source control for branching workflows, code reviews, and automated CI/CD deployments.", tags: ["VCS", "GitHub", "Branching", "Gitflow"], iconSlug: "git", order: 2, visible: true },
          { id: "sk-17", name: "Postman", level: "Advanced", exp: "3+ yrs", orbit: "orbit-4", category: "API Testing & Automation", description: "Comprehensive API client for testing request payloads, running integration suites, and mocking responses.", tags: ["REST Testing", "Automation", "Collections", "Mock Servers"], iconSlug: "postman", order: 3, visible: true },
          { id: "sk-18", name: "Swagger", level: "Advanced", exp: "2+ yrs", orbit: "orbit-4", category: "API Documentation & OpenAPI", description: "Interactive OpenAPI specifications facilitating team contract testing, documentation, and client generation.", tags: ["OpenAPI 3.0", "API Docs", "Contracts", "Interactive Testing"], iconSlug: "swagger", order: 4, visible: true },
        ],
      },
    ],
  },
  projectsSection: {
    eyebrow: "Selected Work",
    title: "What I've built\nfor production.",
    subtitle: "",
    filters: [
      { id: "all", label: "All", order: 1 },
      { id: "mern", label: "MERN", order: 2 },
      { id: "frontend", label: "Frontend", order: 3 },
      { id: "backend", label: "Backend", order: 4 },
      { id: "mobile", label: "Mobile", order: 5 },
    ],
  },
  contactInfo: {
    email: "esubalew392@gmail.com",
    phone: "+251 915795794",
    location: "Bahir Dar, Ethiopia",
    formTitle: "Get in touch",
    formDescription:
      "I'm currently available for freelance work or full-time opportunities. Reach out via the form or any of the methods below.",
    formButtonText: "Send Message",
    successMessage:
      "Thank you! Your message has been sent successfully.",
    wizard: {
      steps: [
        { stepNumber: 1, title: "Project Scope", description: "What type of system are we building?" },
        { stepNumber: 2, title: "Your Identity", description: "Who should I address the proposal to?" },
        { stepNumber: 3, title: "Timeline & Launch", description: "When do you need the platform deployed?" },
      ],
      projectTypes: [
        { value: "fullstack", title: "Full-Stack Web App", desc: "React, Node, MongoDB/Postgres, Cloud" },
        { value: "backend", title: "Backend / Microservices", desc: "REST APIs, Socket.IO, DB schema, 2FA" },
        { value: "mobile", title: "Mobile Application", desc: "Cross-platform Flutter iOS & Android" },
        { value: "contract", title: "Senior Contract Engineer", desc: "Embedded in existing engineering sprint" },
      ],
      timelines: [
        { value: "immediate", title: "< 2 Weeks", desc: "Fast turnaround or immediate start" },
        { value: "month", title: "1 — 2 Months", desc: "Standard production build" },
        { value: "quarter", title: "3+ Months", desc: "Long-term platform architecture" },
        { value: "flexible", title: "Flexible", desc: "Timeline depends on design scope" },
      ],
      submitButtonText: "Send Brief",
      submittingButtonText: "Dispatching brief...",
      responseTimeText: "Response within 4 hours",
      privacyText: "Your data is never shared",
    },
  },
  experience: {
    title: "Where I've built\nreal systems.",
    subtitle: "A timeline of production systems, software engineering internships, and academic excellence.",
    eyebrow: "Career Record",
    resumeUrl: "/resume.pdf",
    resumeText: "Resume",
    categories: [
      {
        id: "cat-1",
        name: "Engineering Experience",
        order: 1,
        published: true,
        items: [
          {
            id: "exp-1",
            role: "Frontend Developer Intern",
            title: "Frontend Developer Intern",
            company: "Askuala Link Software Company",
            duration: "2024 — Present",
            startDate: "2024",
            endDate: "Present",
            current: true,
            location: "Bahir Dar, Ethiopia",
            tags: ["React", "Node.js", "MongoDB", "Socket.IO", "Express", "2FA"],
            skills: ["React", "Node.js", "MongoDB", "Socket.IO", "Express", "2FA"],
            bullets: [
              "Building enterprise-grade React + Node.js systems with real-time state synchronization.",
              "Architecting microservice backends, WebSocket dashboard streaming, and TOTP 2FA authentication flows for production deployments.",
            ],
            logo: "images/askuala.jpg",
            order: 1,
            published: true,
          },
          {
            id: "exp-2",
            role: "Freelance Full Stack Developer",
            title: "Freelance Full Stack Developer",
            company: "Self-Employed / Freelance",
            duration: "2023 — 2024",
            startDate: "2023",
            endDate: "2024",
            current: false,
            location: "Remote / Ethiopia",
            tags: ["MERN", "REST API", "JWT", "Tailwind", "Flutter", "PostgreSQL"],
            skills: ["MERN", "REST API", "JWT", "Tailwind", "Flutter", "PostgreSQL"],
            bullets: [
              "Delivered 8+ production MERN stack applications including real estate platforms, college management systems, and agricultural marketplaces.",
              "Engineered resilient MongoDB and PostgreSQL schemas, role-based access control, and mobile clients with Flutter.",
            ],
            logo: "",
            order: 2,
            published: true,
          },
        ],
      },
      {
        id: "cat-2",
        name: "Education",
        order: 2,
        published: true,
        items: [
          {
            id: "edu-1",
            role: "Computer Science (B.Sc.) - 3rd Year",
            title: "Computer Science (B.Sc.) - 3rd Year",
            company: "Bahir Dar University",
            duration: "2022 — Present",
            startDate: "2022",
            endDate: "Present",
            current: true,
            location: "Bahir Dar, Ethiopia",
            tags: ["Algorithms", "Data Structures", "Database Architecture", "System Design"],
            skills: ["Algorithms", "Data Structures", "Database Architecture", "System Design"],
            bullets: [
              "Third-year Computer Science student pursuing high-rigor engineering coursework.",
              "Advanced study in distributed systems, network security, operating systems, and database optimization.",
            ],
            logo: "images/bdu.jpg",
            order: 1,
            published: true,
          },
        ],
      },
    ],
  },
  certificates: [
    {
      id: "cert-1",
      name: "Meta Front-End Developer",
      issuer: "Meta",
      issuerColor: "#0081FB",
      date: "2024",
      image: "/certificates/meta-frontend.svg",
      credentialUrl: "https://www.coursera.org/account/accomplishments/professional-cert/meta-front-end-developer",
      url: "https://www.coursera.org/account/accomplishments/professional-cert/meta-front-end-developer",
      skills: ["React", "JavaScript", "CSS"],
      order: 1,
      published: true,
    },
    {
      id: "cert-2",
      name: "MongoDB Node.js Developer Path",
      issuer: "MongoDB University",
      issuerColor: "#00ED64",
      date: "2024",
      image: "/certificates/mongodb-developer.svg",
      credentialUrl: "https://learn.mongodb.com/",
      url: "https://learn.mongodb.com/",
      skills: ["MongoDB", "Node.js", "Aggregation"],
      order: 2,
      published: true,
    },
    {
      id: "cert-3",
      name: "Back End Development and APIs",
      issuer: "freeCodeCamp",
      issuerColor: "#FF4D00",
      date: "2023",
      image: "/certificates/fcc-backend.svg",
      credentialUrl: "https://www.freecodecamp.org/certification/esubalew/back-end-development-and-apis",
      url: "https://www.freecodecamp.org/certification/esubalew/back-end-development-and-apis",
      skills: ["Node.js", "Express", "REST APIs"],
      order: 3,
      published: true,
    },
    {
      id: "cert-4",
      name: "Responsive Web Design",
      issuer: "freeCodeCamp",
      issuerColor: "#3b82f6",
      date: "2023",
      image: "/certificates/fcc-responsive.svg",
      credentialUrl: "https://www.freecodecamp.org/certification/esubalew/responsive-web-design",
      url: "https://www.freecodecamp.org/certification/esubalew/responsive-web-design",
      skills: ["HTML", "CSS", "Flexbox"],
      order: 4,
      published: true,
    },
  ],
  testimonials: {
    title: "Client Feedback",
    subtitle: "What people say about working with me.",
    items: [
      {
        name: "Abebe Kebede",
        role: "CEO",
        company: "Tech Solutions PLC",
        image: "images/p1.jpg",
        rating: 5,
        feedback:
          "Exceptional developer with a keen eye for design. He delivered our platform ahead of schedule with flawless performance and clean architecture.",
      },
      {
        name: "Sara Mohammed",
        role: "Project Manager",
        company: "Digital Innovations",
        image: "images/p2.jpg",
        rating: 4,
        feedback:
          "Working with him was a breeze. Clear communication, timely deliveries, and a deep understanding of modern web technologies that made our project stand out.",
      },
      {
        name: "Dr. Getachew Alemu",
        role: "Professor",
        company: "Bahir Dar University",
        image: "images/p3.jpg",
        rating: 5,
        feedback:
          "One of the brightest students I have mentored. His ability to grasp complex concepts and implement them into working solutions is truly impressive.",
      },
      {
        name: "Meron Tadesse",
        role: "Team Lead",
        company: "Askuala Link",
        image: "images/p4.jpg",
        rating: 5,
        feedback:
          "He consistently exceeded expectations during his internship. Every pull request was production-ready, well-documented, and required minimal review.",
      },
      {
        name: "Yonas Desta",
        role: "Startup Founder",
        company: "Addis Tech Ventures",
        image: "images/p5.jpg",
        rating: 4,
        feedback:
          "He built our entire MVP in record time. The architecture is rock-solid, the UX is polished, and users have been loving the experience since day one.",
      },
    ],
  },
  socialLinks: SOCIAL_PLATFORMS_DEFAULT,
  resume: {
    title: "Resume",
    url: "/resume.pdf",
    buttonText: "Download Resume",
  },
  contactInfo: {
    email: "esubalew392@gmail.com",
    phone: "+251 915795794",
    location: "Bahir Dar, Ethiopia",
    formTitle: "Get in touch",
    formDescription:
      "I'm currently available for freelance work or full-time opportunities. Reach out via the form or any of the methods below.",
    formButtonText: "Send Message",
    successMessage:
      "Thank you! Your message has been sent successfully.",
  },
  seo: {
    title: "",
    description: "",
    ogImage: "",
    keywords: "",
  },
});

const migrateFooterSocials = async (content) => {
  const hasFooterSocials = content.footer?.socials?.length > 0;
  const hasCentralSocials = content.socialLinks?.length > 0;

  if (hasFooterSocials && !hasCentralSocials) {
    content.socialLinks = content.footer.socials.map(s => ({
      platform: s.platform,
      url: s.url || "",
      enabled: s.enabled !== undefined ? s.enabled : true,
    }));
    await content.save();
  }
};

const syncSocialLinks = async (content) => {
  if (content.socialLinks) {
    content.footer.socials = content.socialLinks.map(s => ({
      platform: s.platform,
      url: s.url || "",
      enabled: s.enabled !== undefined ? s.enabled : true,
    }));
  }
};

export const ensureExperienceAndCertificates = (content) => {
  const defaults = getDefaultContent();

  // 1. Certificates: only populate defaults if undefined or null, NEVER overwrite empty array []
  if (content.certificates === undefined || content.certificates === null) {
    content.certificates = defaults.certificates;
  } else if (Array.isArray(content.certificates)) {
    content.certificates.forEach((cert, idx) => {
      if (!cert.id && !cert._id) {
        cert.id = `cert-${idx + 1}`;
      }
      if (cert.order === undefined) {
        cert.order = idx + 1;
      }
      if (cert.published === undefined) {
        cert.published = true;
      }
    });
  }

  // 2. Experience metadata & categories
  if (!content.experience) {
    content.experience = defaults.experience;
  } else {
    if (content.experience.eyebrow === undefined) {
      content.experience.eyebrow = "Career Record";
    }
    if (content.experience.title === undefined) {
      content.experience.title = "Where I've built\nreal systems.";
    }
    if (content.experience.resumeUrl === undefined) {
      content.experience.resumeUrl = content.resume?.url || "/resume.pdf";
    }
    if (content.experience.resumeText === undefined) {
      content.experience.resumeText = "Resume";
    }

    if (Array.isArray(content.experience.categories)) {
      content.experience.categories.forEach((cat, catIdx) => {
        if (!cat.id && !cat._id) {
          cat.id = `cat-${catIdx + 1}`;
        }
        if (cat.order === undefined) {
          cat.order = catIdx + 1;
        }
        if (cat.published === undefined) {
          cat.published = true;
        }

        if (Array.isArray(cat.items)) {
          cat.items.forEach((item, itemIdx) => {
            if (!item.id && !item._id) {
              item.id = `exp-${catIdx + 1}-${itemIdx + 1}`;
            }
            if (item.order === undefined) {
              item.order = itemIdx + 1;
            }
            if (item.published === undefined) {
              item.published = true;
            }
          });
        }
      });
    }
  }
};

export const ensureAllContentDefaults = (content) => {
  const defaults = getDefaultContent();

  // 1. Hero: only initialize missing structures
  if (!content.hero) {
    content.hero = defaults.hero;
  } else {
    if (content.hero.metrics === undefined) {
      content.hero.metrics = defaults.hero.metrics;
    }
    if (content.hero.availabilityBanner === undefined) {
      content.hero.availabilityBanner = defaults.hero.availabilityBanner;
    }
    if (content.hero.titles === undefined) {
      content.hero.titles = defaults.hero.titles;
    }
  }

  // 2. About competencies, assignments, dossierRef
  if (!content.about) {
    content.about = defaults.about;
  } else {
    if (content.about.competencies === undefined) {
      content.about.competencies = defaults.about.competencies;
    }
    if (content.about.assignments === undefined) {
      content.about.assignments = defaults.about.assignments;
    }
    if (content.about.dossierRef === undefined) {
      content.about.dossierRef = defaults.about.dossierRef;
    }
    if (content.about.clearanceLevel === undefined) {
      content.about.clearanceLevel = defaults.about.clearanceLevel;
    }
    if (content.about.personnelId === undefined) {
      content.about.personnelId = defaults.about.personnelId;
    }
  }

  // 3. Skills: Only default if completely missing/null. NEVER require 'Frontend' or orbital tags, NEVER overwrite custom categories or empty arrays.
  if (!content.skills) {
    content.skills = defaults.skills;
  } else if (!Array.isArray(content.skills.categories)) {
    content.skills.categories = defaults.skills.categories;
  }

  // 4. ProjectsSection
  if (!content.projectsSection) {
    content.projectsSection = defaults.projectsSection;
  }

  // 5. Contact wizard
  if (!content.contactInfo) {
    content.contactInfo = defaults.contactInfo;
  } else if (!content.contactInfo.wizard) {
    content.contactInfo.wizard = defaults.contactInfo.wizard;
  }

  // 6. Footer attribution
  if (!content.footer) {
    content.footer = defaults.footer;
  } else if (content.footer.attribution === undefined) {
    content.footer.attribution = defaults.footer.attribution;
  }
};

export { getDefaultContent };

export const getContent = async (req, res) => {
  try {
    let content = await PortfolioContent.findOne();

    if (!content) {
      content = await PortfolioContent.create(getDefaultContent());
    } else {
      ensureExperienceAndCertificates(content);
      ensureAllContentDefaults(content);
    }

    let isAdmin = false;
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = true;
      } catch (e) {
        isAdmin = false;
      }
    }

    if (isAdmin) {
      return res.status(200).json({ success: true, data: content });
    }

    // Public visitor: filter out unpublished items & categories & certificates, and sort deterministically
    const raw = content.toObject ? content.toObject() : JSON.parse(JSON.stringify(content));
    
    if (raw.experience?.categories) {
      raw.experience.categories = raw.experience.categories
        .filter(c => c.published !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(c => ({
          ...c,
          items: (c.items || [])
            .filter(i => i.published !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        }));
    }

    if (raw.certificates) {
      raw.certificates = raw.certificates
        .filter(c => c.published !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    res.status(200).json({ success: true, data: raw });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getExperience = async (req, res) => {
  try {
    let content = await PortfolioContent.findOne();
    if (!content) {
      content = await PortfolioContent.create(getDefaultContent());
    } else {
      ensureExperienceAndCertificates(content);
    }

    let isAdmin = false;
    const token = req.cookies?.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = true;
      } catch (e) {
        isAdmin = false;
      }
    }

    const raw = content.toObject ? content.toObject() : JSON.parse(JSON.stringify(content));
    let experience = raw.experience || {};
    let certificates = raw.certificates || [];

    if (!isAdmin) {
      experience.categories = (experience.categories || [])
        .filter(c => c.published !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(c => ({
          ...c,
          items: (c.items || [])
            .filter(i => i.published !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        }));

      certificates = certificates
        .filter(c => c.published !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    res.status(200).json({
      success: true,
      data: {
        experience,
        certificates,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateContent = async (req, res) => {
  try {
    let content = await PortfolioContent.findOne();

    if (!content) {
      content = await PortfolioContent.create(getDefaultContent());
    }

    const allowedFields = [
      "sections", "navbar", "footer", "hero", "about", "skills", "projectsSection", "experience",
      "certificates", "testimonials", "socialLinks", "resume", "contactInfo",
      "terminal", "seo",
    ];

    const updatedFields = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        content[field] = req.body[field];
        updatedFields.push(field);
      }
    }

    if (updatedFields.includes("socialLinks") && content.socialLinks) {
      content.footer.socials = content.socialLinks.map(s => ({
        platform: s.platform,
        url: s.url || "",
        enabled: s.enabled !== undefined ? s.enabled : true,
      }));
      updatedFields.push("footer");
    }

    await content.save();

    const propagated = propagateHeroToDependents(content);
    for (const section of propagated) {
      if (!updatedFields.includes(section)) {
        updatedFields.push(section);
      }
    }

    if (propagated.length > 0) {
      await content.save();
    }

    for (const section of updatedFields) {
      emitContentSectionUpdated(section, content[section]);
    }

    if (updatedFields.length > 0) {
      const sectionNames = updatedFields.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
      await createNotification({
        type: "content",
        title: "Content updated",
        description: `${updatedFields.length} section(s) updated`,
        message: sectionNames,
        relatedId: content._id,
        relatedModel: "PortfolioContent",
      });
    }

    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getSocialLinks = async (req, res) => {
  try {
    let content = await PortfolioContent.findOne();
    if (!content) {
      content = await PortfolioContent.create(getDefaultContent());
    } else {
      await migrateFooterSocials(content);
    }
    res.status(200).json({ success: true, data: content.socialLinks || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateSocialLinks = async (req, res) => {
  try {
    let content = await PortfolioContent.findOne();
    if (!content) {
      content = await PortfolioContent.create(getDefaultContent());
    }

    content.socialLinks = req.body.socialLinks || [];
    content.footer.socials = content.socialLinks.map(s => ({
      platform: s.platform,
      url: s.url || "",
      enabled: s.enabled !== undefined ? s.enabled : true,
    }));

    await content.save();

    emitContentSectionUpdated("socialLinks", content.socialLinks);
    emitContentSectionUpdated("footer", content.footer);

    await createNotification({
      type: "content",
      title: "Social links updated",
      description: "Social links have been updated",
      message: "Social Links",
      relatedId: content._id,
      relatedModel: "PortfolioContent",
    });

    res.status(200).json({ success: true, data: content.socialLinks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
