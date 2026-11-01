/**
 * commandRegistry.js
 * Builds the interactive terminal command registry dynamically using live CMS data
 * from contentStore and published projects from ProjectContext.
 * Guarantees professional English output, clean ASCII formatting, and zero [object Object] leaks.
 */

import {
  extractItemName,
  extractNames,
  formatBanner,
  formatColumns,
  formatTable,
  cleanTitle,
} from './terminalFormatter.js';

export function buildCommandRegistry({ content = {}, projects = [] } = {}) {
  const terminalConfig = content.terminal || {};
  const commandsConfig = Array.isArray(terminalConfig.commands) ? terminalConfig.commands : [];

  // Lookup for enabled status, description, and custom response overrides from CMS
  const cmsConfigMap = new Map();
  commandsConfig.forEach((cmd) => {
    cmsConfigMap.set(cmd.id || cmd.name, cmd);
  });

  const isCmdEnabled = (id, defaultVal = true) => {
    if (!cmsConfigMap.has(id)) return defaultVal;
    return cmsConfigMap.get(id).enabled !== false;
  };

  const getCmdDesc = (id, defaultDesc) => {
    return cmsConfigMap.get(id)?.description || defaultDesc;
  };

  const getCustomResponse = (id) => {
    return cmsConfigMap.get(id)?.customResponse || null;
  };

  // Base aliases map
  const aliases = {
    h: 'help',
    '?': 'help',
    commands: 'help',
    cls: 'clear',
    rm: 'clear',
    exp: 'experience',
    work: 'experience',
    history: 'experience',
    edu: 'education',
    university: 'education',
    degree: 'education',
    certs: 'certifications',
    cert: 'certifications',
    certificate: 'certifications',
    certificates: 'certifications',
    cv: 'resume',
    tech: 'skills',
    techstack: 'skills',
    stack: 'skills',
    proj: 'projects',
    gh: 'github',
    in: 'linkedin',
    mail: 'contact',
    email: 'contact',
    message: 'contact',
    info: 'about',
    bio: 'about',
    dir: 'ls',
    time: 'date',
  };

  // Add any CMS-configured aliases
  commandsConfig.forEach((cmd) => {
    if (Array.isArray(cmd.aliases)) {
      cmd.aliases.forEach((alias) => {
        if (alias && typeof alias === 'string') {
          aliases[alias.toLowerCase().trim()] = cmd.id || cmd.name;
        }
      });
    }
  });

  const aboutData = content.about || {};
  const heroData = content.hero || {};
  const contactData = content.contactInfo || {};
  const skillsData = content.skills || {};
  const experienceData = content.experience || {};
  const certificatesData = Array.isArray(content.certificates) ? content.certificates : [];
  const socialLinksData = Array.isArray(content.socialLinks) ? content.socialLinks : [];
  const resumeUrl = content.resume?.url || '/resume.pdf';

  const githubSocial = socialLinksData.find(
    (s) => (s.platform || '').toLowerCase() === 'github'
  );
  const githubUrl = githubSocial?.url || 'https://github.com/esubalew7';

  const linkedinSocial = socialLinksData.find(
    (s) => (s.platform || '').toLowerCase() === 'linkedin'
  );
  const linkedinUrl = linkedinSocial?.url || 'https://linkedin.com/in/esubalew-molla-7a584739b';

  const commands = {};

  // 1. HELP
  if (isCmdEnabled('help')) {
    commands.help = {
      description: getCmdDesc('help', 'Display all available terminal commands'),
      metadata: { category: 'System', processTime: 100 },
      response: () => {
        const custom = getCustomResponse('help');
        if (custom) return custom;

        // Group enabled commands by category
        const categories = {
          Information: [],
          'Portfolio & Work': [],
          'Direct Links': [],
          'Filesystem & Shell': [],
          System: [],
          Custom: [],
        };

        Object.entries(commands).forEach(([name, def]) => {
          const cat = def.metadata?.category || 'General';
          const target = categories[cat] || categories.Custom;

          // Find aliases for this command
          const cmdAliases = Object.entries(aliases)
            .filter(([alias, targetCmd]) => targetCmd === name && alias !== name)
            .map(([alias]) => alias);

          const aliasStr = cmdAliases.length ? ` (${cmdAliases.join(', ')})` : '';
          target.push(`  ${name.padEnd(14)}${aliasStr.padEnd(16)} → ${def.description}`);
        });

        let output = `${formatBanner('AVAILABLE COMMANDS')}\n\n`;

        Object.entries(categories).forEach(([category, list]) => {
          if (list.length > 0) {
            output += `[ ${category.toUpperCase()} ]\n${list.join('\n')}\n\n`;
          }
        });

        output += `Tips:\n` +
          `  • Press Tab to autocomplete commands.\n` +
          `  • Use ↑ / ↓ arrow keys to cycle through previous command history.\n` +
          `  • Type 'clear' or press Ctrl+L to reset the terminal viewport.`;

        return output;
      },
    };
  }

  // 2. ABOUT
  if (isCmdEnabled('about')) {
    commands.about = {
      description: getCmdDesc('about', 'Learn about my background, core competencies, and metrics'),
      metadata: { category: 'Information', processTime: 150 },
      response: () => {
        const custom = getCustomResponse('about');
        if (custom) return custom;

        const name = heroData.name || 'Esubalew Molla';
        const titles = Array.isArray(heroData.titles) && heroData.titles.length
          ? heroData.titles.map(cleanTitle).filter(Boolean).join(' · ')
          : 'Full Stack Engineer & Distributed Systems Specialist';

        const bio = (aboutData.description || '').trim() ||
          "I'm Esubalew Molla, a full-stack engineer based in Ethiopia and a Computer Science student at Bahir Dar University, currently interning at Askuala Link. I architect and ship distributed systems that handle real-world production loads: from JWT + TOTP 2FA backends to live WebSocket-synced admin dashboards.";

        const statsList = Array.isArray(aboutData.stats) && aboutData.stats.length
          ? aboutData.stats
              .filter((s) => s && (s.label || s.value !== undefined))
              .map((s) => `  • ${s.value}${s.suffix || ''} — ${s.label}`)
              .join('\n')
          : '  • 3+ — Years of production code\n  • 15+ — Full-stack systems shipped\n  • 3 — Live production stacks';

        // Extract real competency names without any [object Object] leaks
        const rawCompetencies = aboutData.competencies || [];
        const compNames = extractNames(rawCompetencies);

        let competenciesBlock = '';
        if (compNames.length > 0) {
          competenciesBlock = `\n\nCompetencies:\n${formatColumns(compNames, { numCols: 2, colWidth: 26 })}`;
        }

        return `${formatBanner(`ABOUT ME — ${name}`)}\n` +
          `${titles}\n\n` +
          `${bio}\n\n` +
          `Key Metrics:\n${statsList}` +
          `${competenciesBlock}\n\n` +
          `Type 'skills' or 'projects' to explore more details.`;
      },
    };
  }

  // 3. SKILLS / TECHSTACK
  if (isCmdEnabled('skills')) {
    commands.skills = {
      description: getCmdDesc('skills', 'Inspect technical skills, tools, and production technologies'),
      metadata: { category: 'Information', processTime: 180 },
      response: () => {
        const custom = getCustomResponse('skills');
        if (custom) return custom;

        let output = `${formatBanner('TECHNICAL ARSENAL & SKILLS')}\n`;

        if (Array.isArray(skillsData.categories) && skillsData.categories.length > 0) {
          skillsData.categories.forEach((cat) => {
            const catName = cat.name || 'Core Technologies';
            const items = Array.isArray(cat.items)
              ? cat.items
                  .filter((i) => i.visible !== false)
                  .map((i) => {
                    const name = extractItemName(i);
                    const tag = i.exp ? ` (${i.exp})` : (i.level ? ` (${i.level})` : '');
                    return `${name}${tag}`;
                  })
                  .filter(Boolean)
                  .join(', ')
              : '';

            output += `\n[ ${catName.toUpperCase()} ]\n  ${items || 'Production-grade tools and libraries'}\n`;
          });
        } else {
          output += `\n[ FRONTEND ]\n  React, Next.js, TypeScript, Tailwind CSS, JavaScript (ESNext), Three.js\n`;
          output += `\n[ BACKEND & ARCHITECTURE ]\n  Node.js, Express, NestJS, Socket.IO, Redis, Docker, JWT Authentication\n`;
          output += `\n[ DATABASES & STORAGE ]\n  MongoDB, PostgreSQL, Mongoose, Prisma, Redis\n`;
          output += `\n[ MOBILE ]\n  Flutter, Cross-Platform Dart, Firebase\n`;
        }

        // Add Architectural Competencies safely
        const compNames = extractNames(aboutData.competencies);
        if (compNames.length > 0) {
          output += `\n[ ARCHITECTURAL COMPETENCIES ]\n  ${compNames.join(', ')}\n`;
        }

        output += `\nTip: Type 'projects' to see these technologies applied in production systems.`;
        return output.trim();
      },
    };
  }

  // 4. PROJECTS
  if (isCmdEnabled('projects')) {
    commands.projects = {
      description: getCmdDesc('projects', 'Browse published portfolio projects and systems'),
      metadata: { category: 'Portfolio & Work', processTime: 200 },
      response: () => {
        const custom = getCustomResponse('projects');
        if (custom) return custom;

        if (!projects || projects.length === 0) {
          return `No published projects found at this time. Please visit my GitHub profile for open-source repositories:\n→ ${githubUrl}`;
        }

        let output = `${formatBanner(`FEATURED PRODUCTION PROJECTS (${projects.length})`)}\n\n`;

        projects.forEach((p, idx) => {
          const title = p.title || `Project ${idx + 1}`;
          const cat = p.category ? ` [${p.category.toUpperCase()}]` : '';
          const desc = p.summary || p.description || 'Production web application';
          const techs = extractNames(p.technologies).join(', ') || p.techStack || '';
          const liveUrl = p.liveLink || p.liveUrl || p.demoUrl || '';
          const repoUrl = p.githubLink || p.githubUrl || p.repoUrl || '';

          output += `${idx + 1}. ${title}${cat}\n`;
          output += `   Description: ${desc}\n`;
          if (techs) output += `   Stack:       ${techs}\n`;
          if (liveUrl) output += `   Live Demo:   ${liveUrl}\n`;
          if (repoUrl) output += `   Repository:  ${repoUrl}\n`;
          output += `\n`;
        });

        output += `Tip: Type 'project <name>' for deep-dive technical details on any specific project.`;
        return output.trim();
      },
    };
  }

  // 5. PROJECT (Single project lookup)
  if (isCmdEnabled('project', isCmdEnabled('projects'))) {
    commands.project = {
      description: 'View deep-dive technical details for a specific project',
      metadata: { category: 'Portfolio & Work', processTime: 120 },
      response: (args) => {
        if (!args || !args.length) {
          return `Usage: project <name-or-keyword>\nExample: project service-finder\nType 'projects' to list all available projects.`;
        }

        const query = args.join(' ').toLowerCase().trim();
        const found = projects.find((p) => {
          const t = (p.title || '').toLowerCase();
          const s = (p.slug || '').toLowerCase();
          const id = (p._id || p.id || '').toLowerCase();
          return t.includes(query) || s.includes(query) || id === query;
        });

        if (!found) {
          return `No project found matching '${query}'. Type 'projects' to view all available project titles.`;
        }

        const techs = extractNames(found.technologies).join(', ');
        const liveUrl = found.liveLink || found.liveUrl || found.demoUrl || '';
        const repoUrl = found.githubLink || found.githubUrl || found.repoUrl || '';

        let details = `${formatBanner(`PROJECT DOSSIER: ${found.title}`)}\n`;
        details += `Category:    ${(found.category || 'Full Stack').toUpperCase()}\n`;
        if (found.featured) details += `Status:      ★ Featured Production System\n`;
        details += `\nOverview:\n${found.description || found.summary || 'Production application.'}\n\n`;

        if (techs) {
          details += `Technologies:\n  ${techs}\n\n`;
        }

        if (Array.isArray(found.features) && found.features.length) {
          details += `Key Features:\n` + found.features.map((f) => `  • ${f}`).join('\n') + `\n\n`;
        }

        if (liveUrl) details += `Live Demo:   ${liveUrl}\n`;
        if (repoUrl) details += `Repository:  ${repoUrl}\n`;

        return details.trim();
      },
    };
  }

  // 6. EXPERIENCE
  if (isCmdEnabled('experience')) {
    commands.experience = {
      description: getCmdDesc('experience', 'Review professional engineering experience and roles'),
      metadata: { category: 'Information', processTime: 150 },
      response: () => {
        const custom = getCustomResponse('experience');
        if (custom) return custom;

        let output = `${formatBanner('PROFESSIONAL ENGINEERING EXPERIENCE')}\n\n`;

        const stations = Array.isArray(experienceData.categories)
          ? experienceData.categories
              .filter((c) => c.published !== false)
              .flatMap((c) => (Array.isArray(c.items) ? c.items.filter((i) => i.published !== false) : []))
          : [];

        if (stations.length > 0) {
          stations.forEach((st, idx) => {
            const role = st.role || st.title || 'Software Engineer';
            const company = st.company || st.organization || '';
            const period = (st.duration || st.period || `${st.startDate || ''} — ${st.endDate || 'Present'}`).trim();
            const location = st.location || '';
            const bullets = Array.isArray(st.bullets) ? st.bullets.filter(Boolean) : [];
            const stack = extractNames(st.skills || st.tags).join(', ');

            output += `${idx + 1}. ${role}${company ? ` — ${company}` : ''}\n`;
            if (period && period !== '—') {
              output += `   Timeline: ${period} ${location ? `(${location})` : ''}\n`;
            } else if (location) {
              output += `   Location: ${location}\n`;
            }

            if (bullets.length) {
              bullets.forEach((b) => {
                output += `   • ${b}\n`;
              });
            }

            if (stack) {
              output += `   Tech Stack: ${stack}\n`;
            }
            output += `\n`;
          });
        } else if (Array.isArray(aboutData.assignments) && aboutData.assignments.length) {
          aboutData.assignments
            .filter((asg) => asg.visible !== false)
            .forEach((asg, idx) => {
              output += `${idx + 1}. ${asg.role} — ${asg.organization}\n   Timeline: ${asg.period}\n\n`;
            });
        } else {
          output += `1. Full Stack Developer Intern — Askuala Link Software Co.\n   Timeline: 2024 — Present (Bahir Dar, Ethiopia)\n   • Engineering real-time WebSocket state streaming pipelines and responsive client UIs.\n   • Implementing JWT + TOTP 2FA authentication and database optimization.\n\n`;
        }

        output += `Tip: Type 'resume' to download my official CV with complete work history.`;
        return output.trim();
      },
    };
  }

  // 7. EDUCATION
  if (isCmdEnabled('education')) {
    commands.education = {
      description: getCmdDesc('education', 'View university degree program and academic background'),
      metadata: { category: 'Information', processTime: 120 },
      response: () => {
        const custom = getCustomResponse('education');
        if (custom) return custom;

        let output = `${formatBanner('ACADEMIC BACKGROUND & EDUCATION')}\n\n`;
        output += `DEGREE PROGRAM:\n`;
        output += `  Program:     Bachelor of Science in Computer Science\n`;
        output += `  Institution: Bahir Dar University\n`;
        output += `  Timeline:    2022 — Present\n`;
        output += `  Location:    Bahir Dar, Ethiopia\n`;
        output += `  Core Focus:  Distributed Systems, Database Architecture, Operating Systems, Computer Networks\n\n`;

        if (certificatesData.length > 0) {
          output += `VERIFIED CREDENTIALS (${certificatesData.length}):\n`;
          certificatesData.forEach((cert) => {
            const issuer = cert.issuer || 'Professional Authority';
            const date = cert.date ? ` (${cert.date})` : '';
            output += `  • ${cert.name} — ${issuer}${date}\n`;
          });
          output += `\nTip: Type 'certifications' to inspect full credential details and links.`;
        }

        return output.trim();
      },
    };
  }

  // 8. CERTIFICATIONS
  if (isCmdEnabled('certifications')) {
    commands.certifications = {
      description: getCmdDesc('certifications', 'Inspect verified industry certificates and credentials'),
      metadata: { category: 'Information', processTime: 120 },
      response: () => {
        const custom = getCustomResponse('certifications');
        if (custom) return custom;

        if (!certificatesData.length) {
          return `No verified certifications currently on record. Type 'education' to view academic degree details.`;
        }

        let output = `${formatBanner(`VERIFIED CERTIFICATIONS & CREDENTIALS (${certificatesData.length})`)}\n\n`;

        certificatesData
          .filter((c) => c.published !== false)
          .forEach((cert, idx) => {
            const issuer = cert.issuer || 'Accredited Authority';
            const date = cert.date ? ` (${cert.date})` : '';
            const skills = extractNames(cert.skills).join(', ');
            const credUrl = cert.credentialUrl || cert.url || '';

            output += `${idx + 1}. ${cert.name}\n`;
            output += `   Issuer:     ${issuer}${date}\n`;
            if (skills) output += `   Skills:     ${skills}\n`;
            if (credUrl) output += `   Credential: ${credUrl}\n`;
            output += `\n`;
          });

        return output.trim();
      },
    };
  }

  // 9. RESUME
  if (isCmdEnabled('resume')) {
    commands.resume = {
      description: getCmdDesc('resume', 'Download official engineering CV / Resume (PDF)'),
      metadata: {
        category: 'Portfolio & Work',
        type: 'download',
        fileUrl: resumeUrl,
        fileName: 'Esubalew_Molla_Resume.pdf',
        processTime: 200,
      },
      response: () => {
        const custom = getCustomResponse('resume');
        if (custom) return custom;
        return `Initiating download of Esubalew_Molla_Resume.pdf...\nResume dispatched successfully. Please check your browser's Downloads folder.`;
      },
    };
  }

  // 10. CONTACT
  if (isCmdEnabled('contact')) {
    commands.contact = {
      description: getCmdDesc('contact', 'Display contact information, location, and communication channels'),
      metadata: { category: 'Direct Links', processTime: 100 },
      response: () => {
        const custom = getCustomResponse('contact');
        if (custom) return custom;

        const email = contactData.email || 'esubalew392@gmail.com';
        const phone = contactData.phone || '+251 915795794';
        const location = contactData.location || 'Bahir Dar, Ethiopia';

        return `${formatBanner('DIRECT CHANNELS & CONTACT')}\n` +
          `Email:        ${email}\n` +
          `Phone:        ${phone}\n` +
          `Location:     ${location} (Available for remote opportunities worldwide)\n` +
          `Availability: Open to full-time software engineering roles and contracts\n` +
          `Response:     Within 24 hours guaranteed\n\n` +
          `Quick Commands:\n` +
          `  github    → Open GitHub profile in new tab\n` +
          `  linkedin  → Open LinkedIn profile in new tab\n` +
          `  socials   → View all social channels\n` +
          `  resume    → Download official CV / Resume`;
      },
    };
  }

  // 11. SOCIALS
  if (isCmdEnabled('socials')) {
    commands.socials = {
      description: getCmdDesc('socials', 'List all public social and professional profiles'),
      metadata: { category: 'Direct Links', processTime: 80 },
      response: () => {
        if (!socialLinksData.length) {
          return `GitHub:   ${githubUrl}\nLinkedIn: ${linkedinUrl}`;
        }
        return `${formatBanner('PUBLIC SOCIAL PROFILES')}\n` +
          socialLinksData
            .filter((s) => s.enabled !== false)
            .map((s) => `  ${s.platform.padEnd(12)} → ${s.url}`)
            .join('\n');
      },
    };
  }

  // 12. GITHUB
  if (isCmdEnabled('github')) {
    commands.github = {
      description: getCmdDesc('github', 'Open GitHub profile in a new browser tab'),
      metadata: {
        category: 'Direct Links',
        type: 'link',
        url: githubUrl,
      },
      response: () => `Opening GitHub profile in a new browser tab...\n→ ${githubUrl}`,
    };
  }

  // 13. LINKEDIN
  if (isCmdEnabled('linkedin')) {
    commands.linkedin = {
      description: getCmdDesc('linkedin', 'Open LinkedIn profile in a new browser tab'),
      metadata: {
        category: 'Direct Links',
        type: 'link',
        url: linkedinUrl,
      },
      response: () => `Opening LinkedIn profile in a new browser tab...\n→ ${linkedinUrl}`,
    };
  }

  // 14. WHOAMI
  if (isCmdEnabled('whoami')) {
    commands.whoami = {
      description: getCmdDesc('whoami', 'Display current session identity, privileges, and profile summary'),
      metadata: { category: 'System', processTime: 50 },
      response: () => {
        const custom = getCustomResponse('whoami');
        if (custom) return custom;
        return `${formatBanner('USER SESSION PROFILE')}\n` +
          `User:        guest@portfolio:terminal\n` +
          `Subject:     Esubalew Molla (Full Stack Software Engineer)\n` +
          `Clearance:   Guest Access (Read-Only Interactive Shell)\n` +
          `Affiliation: Askuala Link Intern · Bahir Dar University CS Student\n` +
          `Status:      Available for full-time engineering roles and projects\n` +
          `Permissions: Standard interactive commands permitted`;
      },
    };
  }

  // 15. LS / DIR
  if (isCmdEnabled('ls')) {
    commands.ls = {
      description: getCmdDesc('ls', 'List virtual portfolio files and directories'),
      metadata: { category: 'Filesystem & Shell', processTime: 80 },
      response: () => {
        return `Directory: /home/esubalew/portfolio\n\n` +
          `Permissions  Size   File Name\n` +
          `-----------  -----  --------------------\n` +
          `-r--r--r--   2.4KB  about.txt\n` +
          `-r--r--r--   3.8KB  skills.md\n` +
          `-r--r--r--   4.1KB  projects.log\n` +
          `-r--r--r--   2.9KB  experience.txt\n` +
          `-r--r--r--   1.6KB  education.txt\n` +
          `-r--r--r--   1.8KB  certifications.json\n` +
          `-r--r--r--   1.2KB  contact.json\n` +
          `-r--r--r--   184KB  resume.pdf\n\n` +
          `Tip: Type 'cat <filename>' to view any file, or run the command directly (e.g. 'about', 'skills').`;
      },
    };
  }

  // 16. CAT
  if (isCmdEnabled('cat')) {
    commands.cat = {
      description: getCmdDesc('cat', 'Read and display the contents of a virtual portfolio file'),
      metadata: { category: 'Filesystem & Shell', processTime: 120 },
      response: (args) => {
        if (!args || !args.length) {
          return `Usage: cat <filename>\nExample: cat about.txt\nType 'ls' to see all available files.`;
        }

        const target = args[0].toLowerCase().trim().replace(/^(\.\/|\/)/, '');
        const base = target.replace(/\.[a-z0-9]+$/i, '');

        if (base === 'about' && commands.about) {
          return commands.about.response();
        }
        if (base === 'skills' && commands.skills) {
          return commands.skills.response();
        }
        if (base === 'projects' && commands.projects) {
          return commands.projects.response();
        }
        if (base === 'experience' && commands.experience) {
          return commands.experience.response();
        }
        if (base === 'education' && commands.education) {
          return commands.education.response();
        }
        if ((base === 'certifications' || base === 'certs') && commands.certifications) {
          return commands.certifications.response();
        }
        if (base === 'contact' && commands.contact) {
          return commands.contact.response();
        }
        if (base === 'resume') {
          return `[PDF Binary Content]\nType 'resume' to trigger the direct PDF download.`;
        }

        return `cat: ${args[0]}: No such file or directory. Type 'ls' to view available files.`;
      },
    };
  }

  // 17. DATE
  if (isCmdEnabled('date')) {
    commands.date = {
      description: getCmdDesc('date', 'Display current client timestamp and timezone'),
      metadata: { category: 'System', processTime: 40 },
      response: () => `Current Local Time: ${new Date().toLocaleString()}`,
    };
  }

  // 18. SUDO
  if (isCmdEnabled('sudo')) {
    commands.sudo = {
      description: getCmdDesc('sudo', 'Execute a command with administrator privileges'),
      metadata: { category: 'System', processTime: 60 },
      response: () => `Permission denied: User 'guest' is not authorized to escalate privileges. This incident has been logged.`,
    };
  }

  // 19. CLEAR
  if (isCmdEnabled('clear')) {
    commands.clear = {
      description: getCmdDesc('clear', 'Clear the terminal output screen'),
      metadata: { category: 'System', type: 'clear' },
      response: null,
    };
  }

  // 20. Support any Custom Commands added through CMS
  commandsConfig.forEach((cmd) => {
    const id = (cmd.id || cmd.name || '').toLowerCase().trim();
    if (!id || commands[id]) return; // Built-in already registered

    if (cmd.enabled !== false) {
      commands[id] = {
        description: cmd.description || `Custom command: ${id}`,
        metadata: { category: cmd.category || 'Custom', processTime: 80 },
        response: () => cmd.customResponse || `Output for custom command '${id}'.`,
      };
    }
  });

  return {
    aliases,
    commands,
  };
}
