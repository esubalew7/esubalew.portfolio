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
    socials: SOCIAL_PLATFORMS_DEFAULT,
  },
  hero: {
    greeting: "Hello, I am",
    name: "Esubalew",
    titles: [
      "MERN Stack Developer.",
      "Problem Solver.",
      "Creative Thinker.",
      "React Enthusiast.",
    ],
    description:
      "I am a Computer Science student and MERN Stack Developer with a passion for building dynamic web applications. I specialize in creating seamless user experiences and robust backend systems. Let's build something amazing together!",
    image: "/images/esu2.png",
    backgroundImage: "",
    cta: {
      primary: { text: "View Projects", link: "#projects" },
      secondary: { text: "Download Resume", link: "/resume.pdf" },
    },
  },
  about: {
    title: "About Me",
    subtitle: "Computer Science Student & MERN Stack Developer",
    description:
      "I am a third-year Computer Science student passionate about full-stack development. My expertise lies in the MERN stack, where I focus on building robust applications with clean architecture and scalable design patterns. I thrive on solving complex problems and turning ideas into seamless digital experiences.",
    image: "/images/esu3.png",
    stats: [
      { label: "Years Experience", value: 1, suffix: "+" },
      { label: "Total Projects", value: 5, suffix: "+" },
      { label: "Core Skills", value: 15, suffix: "+" },
    ],
    cta: { text: "Let's Collaborate", link: "#contact" },
  },
  skills: {
    title: "Core Skills",
    subtitle:
      "A comprehensive overview of my technical expertise across modern web development, backend engineering, and foundational tooling.",
    categories: [
      {
        name: "Frontend",
        items: [
          { name: "HTML", level: 95 },
          { name: "CSS", level: 90 },
          { name: "JavaScript", level: 85 },
          { name: "Bootstrap", level: 80 },
          { name: "Tailwind CSS", level: 95 },
          { name: "React", level: 90 },
        ],
      },
      {
        name: "Backend",
        items: [
          { name: "Node.js", level: 80 },
          { name: "Express.js", level: 85 },
        ],
      },
      {
        name: "Database",
        items: [
          { name: "MongoDB", level: 85 },
          { name: "mySQL", level: 50 },
          { name: "Firebase", level: 60 },
        ],
      },
      {
        name: "Programming",
        items: [
          { name: "C++", level: 55 },
          { name: "Java", level: 55 },
          { name: "Flutter", level: 65 },
          { name: "PHP", level: 55 },
        ],
      },
      {
        name: "Tools",
        items: [
          { name: "Git", level: 85 },
          { name: "GitHub", level: 90 },
          { name: "Postman", level: 85 },
        ],
      },
    ],
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

const ensureExperienceAndCertificates = async (content) => {
  let modified = false;

  // 1. Ensure certificates exist
  if (!content.certificates || content.certificates.length === 0) {
    const defaults = getDefaultContent().certificates;
    content.certificates = defaults;
    modified = true;
  } else {
    content.certificates.forEach((cert, idx) => {
      if (!cert.id && !cert._id) {
        cert.id = `cert-${idx + 1}`;
        modified = true;
      }
      if (cert.order === undefined) {
        cert.order = idx + 1;
        modified = true;
      }
      if (cert.published === undefined) {
        cert.published = true;
        modified = true;
      }
    });
  }

  // 2. Ensure experience metadata & items
  if (content.experience) {
    if (!content.experience.eyebrow) {
      content.experience.eyebrow = "Career Record";
      modified = true;
    }
    if (!content.experience.title) {
      content.experience.title = "Where I've built\nreal systems.";
      modified = true;
    }
    if (!content.experience.resumeUrl) {
      content.experience.resumeUrl = content.resume?.url || "/resume.pdf";
      modified = true;
    }

    if (Array.isArray(content.experience.categories)) {
      content.experience.categories.forEach((cat, catIdx) => {
        if (!cat.id && !cat._id) {
          cat.id = `cat-${catIdx + 1}`;
          modified = true;
        }
        if (cat.order === undefined) {
          cat.order = catIdx + 1;
          modified = true;
        }
        if (cat.published === undefined) {
          cat.published = true;
          modified = true;
        }

        if (Array.isArray(cat.items)) {
          cat.items.forEach((item, itemIdx) => {
            if (!item.id && !item._id) {
              item.id = `exp-${catIdx + 1}-${itemIdx + 1}`;
              modified = true;
            }
            if (item.order === undefined) {
              item.order = itemIdx + 1;
              modified = true;
            }
            if (item.published === undefined) {
              item.published = true;
              modified = true;
            }
          });
        }
      });
    }
  }

  if (modified) {
    await content.save();
  }
};

export const getContent = async (req, res) => {
  try {
    let content = await PortfolioContent.findOne();

    if (!content) {
      content = await PortfolioContent.create(getDefaultContent());
    } else {
      await migrateFooterSocials(content);
      await ensureExperienceAndCertificates(content);
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
      await ensureExperienceAndCertificates(content);
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
      "sections", "navbar", "footer", "hero", "about", "skills", "experience",
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
