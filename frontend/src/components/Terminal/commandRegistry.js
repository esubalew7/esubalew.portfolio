/**
 * commandRegistry.js
 * Builds the terminal command registry dynamically using live CMS data
 * from contentStore and published projects from ProjectContext.
 */

export function buildCommandRegistry({ content = {}, projects = [] } = {}) {
  const terminalConfig = content.terminal || {};
  const commandsConfig = Array.isArray(terminalConfig.commands) ? terminalConfig.commands : [];
  
  // Quick lookup for enabled status, description, and custom response overrides from CMS
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
    cls: 'clear',
    rm: 'clear',
    exp: 'experience',
    edu: 'education',
    cv: 'resume',
    tech: 'skills',
    techstack: 'skills',
    proj: 'projects',
    gh: 'github',
    in: 'linkedin',
    mail: 'contact',
    email: 'contact',
    whoami: 'whoami',
    info: 'about',
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
      description: getCmdDesc('help', 'Show all available commands'),
      metadata: { category: 'System', processTime: 120 },
      response: () => {
        const custom = getCustomResponse('help');
        if (custom) return custom;

        // Group currently enabled commands by category
        const categories = {
          Information: [],
          'Portfolio & Work': [],
          'Direct Links': [],
          System: [],
          Custom: [],
        };

        Object.entries(commands).forEach(([name, def]) => {
          const cat = def.metadata?.category || 'General';
          const target = categories[cat] || categories.Custom;
          
          // Find matching aliases
          const cmdAliases = Object.entries(aliases)
            .filter(([alias, targetCmd]) => targetCmd === name && alias !== name)
            .map(([alias]) => alias);

          const aliasStr = cmdAliases.length ? ` (${cmdAliases.join(', ')})` : '';
          target.push(`  ${name.padEnd(12)}${aliasStr.padEnd(16)} → ${def.description}`);
        });

        let output = `AVAILABLE COMMANDS\n════════════════════════════════════════════════════════\n\n`;

        Object.entries(categories).forEach(([category, list]) => {
          if (list.length > 0) {
            output += `[ ${category.toUpperCase()} ]\n${list.join('\n')}\n\n`;
          }
        });

        output += `Tip: Use ↑ / ↓ arrow keys to cycle command history. Tab to autocomplete.`;
        return output;
      },
    };
  }

  // 2. ABOUT
  if (isCmdEnabled('about')) {
    commands.about = {
      description: getCmdDesc('about', 'Learn about me and background'),
      metadata: { category: 'Information', processTime: 180 },
      response: () => {
        const custom = getCustomResponse('about');
        if (custom) return custom;

        const name = heroData.name || 'Esubalew Molla';
        const titles = Array.isArray(heroData.titles) && heroData.titles.length
          ? heroData.titles.join(' · ')
          : 'Full Stack Engineer & Distributed Systems Specialist';
        const bio = aboutData.description || 'Full-stack software engineer based in Ethiopia, architecting production web platforms and distributed services.';
        const stats = Array.isArray(aboutData.stats) && aboutData.stats.length
          ? aboutData.stats.map(s => `  • ${s.value}${s.suffix || ''} — ${s.label}`).join('\n')
          : '  • 3+ Years of production code\n  • 15+ Full-stack systems shipped\n  • 3 Production stacks';

        const competencies = Array.isArray(aboutData.competencies) && aboutData.competencies.length
          ? `Competencies:\n  ${aboutData.competencies.join(', ')}`
          : '';

        return `ABOUT ME — ${name.toUpperCase()}\n════════════════════════════════════════════════════════\n${titles}\n\n${bio}\n\nKey Metrics:\n${stats}\n\n${competencies}\n\nType 'skills' or 'projects' to explore more.`;
      },
    };
  }

  // 3. SKILLS / TECHSTACK
  if (isCmdEnabled('skills')) {
    commands.skills = {
      description: getCmdDesc('skills', 'Technical skills & production stack'),
      metadata: { category: 'Information', processTime: 200 },
      response: () => {
        const custom = getCustomResponse('skills');
        if (custom) return custom;

        let output = `TECHNICAL ARSENAL & SKILLS\n════════════════════════════════════════════════════════\n`;

        if (Array.isArray(skillsData.categories) && skillsData.categories.length > 0) {
          skillsData.categories.forEach((cat) => {
            const catName = cat.name || 'Core';
            const items = Array.isArray(cat.items)
              ? cat.items.filter(i => i.visible !== false).map(i => `${i.name}${i.level ? ` (${i.level})` : ''}`).join(', ')
              : '';
            output += `\n[ ${catName.toUpperCase()} ]\n  ${items || 'Production-grade tools'}\n`;
          });
        } else {
          output += `\n[ FRONTEND ]\n  React, Next.js, TypeScript, Tailwind CSS, Three.js / R3F\n`;
          output += `\n[ BACKEND & ARCHITECTURE ]\n  Node.js, Express, NestJS, Socket.IO, Redis, Docker, JWT Auth\n`;
          output += `\n[ DATABASES ]\n  MongoDB, PostgreSQL, Mongoose, Prisma\n`;
          output += `\n[ MOBILE ]\n  Flutter, Cross-Platform Dart\n`;
        }

        if (Array.isArray(aboutData.competencies) && aboutData.competencies.length > 0) {
          output += `\n[ ARCHITECTURAL COMPETENCIES ]\n  ${aboutData.competencies.join(', ')}\n`;
        }

        return output.trim();
      },
    };
  }

  // 4. PROJECTS
  if (isCmdEnabled('projects')) {
    commands.projects = {
      description: getCmdDesc('projects', 'Browse published portfolio projects'),
      metadata: { category: 'Portfolio & Work', processTime: 250 },
      response: (args) => {
        const custom = getCustomResponse('projects');
        if (custom) return custom;

        if (!projects || projects.length === 0) {
          return `No published projects currently found. Check GitHub profile for open-source repositories.`;
        }

        let output = `FEATURED PRODUCTION PROJECTS (${projects.length})\n════════════════════════════════════════════════════════\n\n`;

        projects.forEach((p, idx) => {
          const title = p.title || `Project ${idx + 1}`;
          const cat = p.category ? ` [${p.category}]` : '';
          const desc = p.summary || p.description || 'Production web application';
          const techs = Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.techStack || '');
          const liveUrl = p.liveUrl || p.demoUrl || '';
          const repoUrl = p.githubUrl || p.repoUrl || '';

          output += `${idx + 1}. ${title}${cat}\n`;
          output += `   Description: ${desc}\n`;
          if (techs) output += `   Stack:       ${techs}\n`;
          if (liveUrl) output += `   Live:        ${liveUrl}\n`;
          if (repoUrl) output += `   GitHub:      ${repoUrl}\n`;
          output += `\n`;
        });

        output += `Tip: Type 'project <name>' for deep-dive details on any specific project.`;
        return output.trim();
      },
    };
  }

  // 5. PROJECT (Single project lookup)
  if (isCmdEnabled('project', isCmdEnabled('projects'))) {
    commands.project = {
      description: 'View deep-dive details for a specific project',
      metadata: { category: 'Portfolio & Work', processTime: 150 },
      response: (args) => {
        if (!args || !args.length) {
          return `Usage: project <name-or-slug>\nExample: project portfolio\nType 'projects' to list all project names.`;
        }

        const query = args.join(' ').toLowerCase().trim();
        const found = projects.find((p) => {
          const t = (p.title || '').toLowerCase();
          const s = (p.slug || '').toLowerCase();
          const id = (p._id || p.id || '').toLowerCase();
          return t.includes(query) || s.includes(query) || id === query;
        });

        if (!found) {
          return `Project not found matching '${query}'. Type 'projects' to see all available projects.`;
        }

        let details = `PROJECT DOSSIER: ${found.title.toUpperCase()}\n════════════════════════════════════════════════════════\n`;
        details += `Category:    ${found.category || 'Full Stack'}\n`;
        if (found.featured) details += `Status:      ★ Featured Production System\n`;
        details += `\nOverview:\n${found.description || found.summary || 'Production application.'}\n\n`;

        if (Array.isArray(found.technologies) && found.technologies.length) {
          details += `Technologies:\n  ${found.technologies.join(', ')}\n\n`;
        }

        if (Array.isArray(found.features) && found.features.length) {
          details += `Key Features:\n` + found.features.map(f => `  • ${f}`).join('\n') + `\n\n`;
        }

        if (found.liveUrl) details += `Live Demo:   ${found.liveUrl}\n`;
        if (found.githubUrl) details += `Repository:  ${found.githubUrl}\n`;

        return details.trim();
      },
    };
  }

  // 6. EXPERIENCE
  if (isCmdEnabled('experience')) {
    commands.experience = {
      description: getCmdDesc('experience', 'Professional engineering experience'),
      metadata: { category: 'Information', processTime: 180 },
      response: () => {
        const custom = getCustomResponse('experience');
        if (custom) return custom;

        let output = `PROFESSIONAL RECORD\n════════════════════════════════════════════════════════\n\n`;

        const stations = Array.isArray(experienceData.categories)
          ? experienceData.categories.flatMap(c => Array.isArray(c.items) ? c.items : [])
          : [];

        if (stations.length > 0) {
          stations.forEach((st, idx) => {
            const role = st.role || st.title || 'Engineer';
            const company = st.company || st.organization || '';
            const period = st.period || st.duration || '';
            const location = st.location || '';
            const bullets = Array.isArray(st.bullets) ? st.bullets : [];

            output += `${idx + 1}. ${role} — ${company}\n`;
            output += `   Timeline: ${period} ${location ? `(${location})` : ''}\n`;
            if (bullets.length) {
              bullets.forEach(b => {
                output += `   • ${b}\n`;
              });
            }
            output += `\n`;
          });
        } else if (Array.isArray(aboutData.assignments) && aboutData.assignments.length) {
          aboutData.assignments.forEach((asg, idx) => {
            output += `${idx + 1}. ${asg.role} — ${asg.organization}\n   Timeline: ${asg.period}\n\n`;
          });
        } else {
          output += `1. Frontend Developer Intern — Askuala Link Software Co.\n   Timeline: 2024 — Present (Bahir Dar, Ethiopia)\n   • Architecting real-time MERN stacks & WebSocket sync pipelines.\n\n`;
        }

        return output.trim();
      },
    };
  }

  // 7. EDUCATION
  if (isCmdEnabled('education')) {
    commands.education = {
      description: getCmdDesc('education', 'Educational background & certifications'),
      metadata: { category: 'Information', processTime: 180 },
      response: () => {
        const custom = getCustomResponse('education');
        if (custom) return custom;

        let output = `EDUCATION & CREDENTIALS\n════════════════════════════════════════════════════════\n\n`;
        output += `DEGREE PROGRAM:\n`;
        output += `  B.Sc. in Computer Science — Bahir Dar University\n`;
        output += `  Period: 2022 — Present (Bahir Dar, Ethiopia)\n`;
        output += `  Coursework: Distributed Systems, Database Systems, Operating Systems, Algorithms\n\n`;

        if (certificatesData.length > 0) {
          output += `VERIFIED CERTIFICATIONS:\n`;
          certificatesData.forEach((cert) => {
            output += `  • ${cert.name} — ${cert.issuer || 'Professional'} (${cert.date || 'Verified'})\n`;
          });
        }

        return output.trim();
      },
    };
  }

  // 8. RESUME
  if (isCmdEnabled('resume')) {
    commands.resume = {
      description: getCmdDesc('resume', 'Download official CV / Resume'),
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
        return `Initiating download of Esubalew_Molla_Resume.pdf...\nResume dispatched. Please check your Downloads folder.`;
      },
    };
  }

  // 9. CONTACT
  if (isCmdEnabled('contact')) {
    commands.contact = {
      description: getCmdDesc('contact', 'Direct contact details and availability'),
      metadata: { category: 'Direct Links', processTime: 150 },
      response: () => {
        const custom = getCustomResponse('contact');
        if (custom) return custom;

        const email = contactData.email || 'esubalew392@gmail.com';
        const phone = contactData.phone || '+251 915795794';
        const location = contactData.location || 'Bahir Dar, Ethiopia';

        return `DIRECT CHANNELS & CONTACT\n════════════════════════════════════════════════════════\n` +
          `Email:        ${email}\n` +
          `Phone:        ${phone}\n` +
          `Location:     ${location} (Open to remote worldwide)\n` +
          `Response:     < 4 hours guaranteed\n\n` +
          `Quick Commands:\n` +
          `  github    → Open GitHub repositories\n` +
          `  linkedin  → Open LinkedIn network profile\n` +
          `  resume    → Download PDF resume`;
      },
    };
  }

  // 10. SOCIALS
  if (isCmdEnabled('socials')) {
    commands.socials = {
      description: getCmdDesc('socials', 'List all public social media links'),
      metadata: { category: 'Direct Links', processTime: 100 },
      response: () => {
        if (!socialLinksData.length) {
          return `GitHub:   ${githubUrl}\nLinkedIn: ${linkedinUrl}`;
        }
        return `PUBLIC SOCIAL PROFILES\n════════════════════════════════════════════════════════\n` +
          socialLinksData
            .filter((s) => s.enabled !== false)
            .map((s) => `  ${s.platform.padEnd(12)} → ${s.url}`)
            .join('\n');
      },
    };
  }

  // 11. GITHUB
  if (isCmdEnabled('github')) {
    commands.github = {
      description: getCmdDesc('github', 'Open GitHub profile in new tab'),
      metadata: {
        category: 'Direct Links',
        type: 'link',
        url: githubUrl,
      },
      response: () => `Opening GitHub profile in a new tab...\n→ ${githubUrl}`,
    };
  }

  // 12. LINKEDIN
  if (isCmdEnabled('linkedin')) {
    commands.linkedin = {
      description: getCmdDesc('linkedin', 'Open LinkedIn profile in new tab'),
      metadata: {
        category: 'Direct Links',
        type: 'link',
        url: linkedinUrl,
      },
      response: () => `Opening LinkedIn network profile in a new tab...\n→ ${linkedinUrl}`,
    };
  }

  // 13. WHOAMI
  if (isCmdEnabled('whoami')) {
    commands.whoami = {
      description: getCmdDesc('whoami', 'Current session identity and role'),
      metadata: { category: 'System', processTime: 50 },
      response: () => {
        const custom = getCustomResponse('whoami');
        if (custom) return custom;
        return `Identity:  Esubalew Molla (Full Stack Engineer)\nClearance: Senior Developer · Askuala Link Intern\nSession:   guest@portfolio:terminal\nAccess:    Public Read-Only\nStatus:    Available for hire & collaboration`;
      },
    };
  }

  // 14. DATE
  if (isCmdEnabled('date')) {
    commands.date = {
      description: getCmdDesc('date', 'Display current client timestamp'),
      metadata: { category: 'System', processTime: 50 },
      response: () => `Client Time: ${new Date().toLocaleString()}`,
    };
  }

  // 15. CLEAR
  if (isCmdEnabled('clear')) {
    commands.clear = {
      description: getCmdDesc('clear', 'Clear terminal viewport history'),
      metadata: { category: 'System', type: 'clear' },
      response: null,
    };
  }

  // 16. Support any Custom Commands added through CMS
  commandsConfig.forEach((cmd) => {
    const id = (cmd.id || cmd.name || '').toLowerCase().trim();
    if (!id || commands[id]) return; // Built-in already registered

    if (cmd.enabled !== false) {
      commands[id] = {
        description: cmd.description || `Custom command ${id}`,
        metadata: { category: cmd.category || 'Custom', processTime: 80 },
        response: () => cmd.customResponse || `Output for command '${id}'`,
      };
    }
  });

  return {
    aliases,
    commands,
  };
}
