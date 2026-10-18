import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractItemName,
  extractNames,
  formatBanner,
  formatColumns,
  cleanTitle,
} from '../../frontend/src/components/Terminal/terminalFormatter.js';
import { buildCommandRegistry } from '../../frontend/src/components/Terminal/commandRegistry.js';
import CommandParser from '../../frontend/src/components/Terminal/commandParser.js';

describe('Developer Terminal - Formatter and Object Leak Prevention Tests', () => {
  test('extractItemName extracts clean strings from various object schemas', () => {
    assert.equal(extractItemName({ id: 'comp-1', name: 'MERN Stack', order: 1 }), 'MERN Stack');
    assert.equal(extractItemName({ title: 'Lead Architect' }), 'Lead Architect');
    assert.equal(extractItemName({ label: 'Years of Experience' }), 'Years of Experience');
    assert.equal(extractItemName({ role: 'Frontend Developer' }), 'Frontend Developer');
    assert.equal(extractItemName({ company: 'Askuala Link' }), 'Askuala Link');
    assert.equal(extractItemName({ skill: 'PostgreSQL' }), 'PostgreSQL');
    assert.equal(extractItemName('React'), 'React');
    assert.equal(extractItemName(123), '123');
    assert.equal(extractItemName(null), '');
    assert.equal(extractItemName(undefined), '');
  });

  test('extractItemName never returns [object Object]', () => {
    const complexObj = { someUnknownProp: 'Valid String', id: '123' };
    const res = extractItemName(complexObj);
    assert.notEqual(res, '[object Object]');
    assert.equal(res, 'Valid String');

    const emptyObj = {};
    assert.equal(extractItemName(emptyObj), '');
  });

  test('extractNames filters non-visible items and extracts valid names', () => {
    const rawList = [
      { id: '1', name: 'React', visible: true },
      { id: '2', name: 'Hidden Tool', visible: false },
      'Direct String Skill',
      null,
      undefined,
      { id: '3', name: 'Docker' },
    ];

    const names = extractNames(rawList);
    assert.deepEqual(names, ['React', 'Direct String Skill', 'Docker']);
  });

  test('formatColumns arranges items into clean multi-column layout', () => {
    const items = ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Socket.IO', 'TypeScript'];
    const output = formatColumns(items, { numCols: 2, colWidth: 20 });

    assert.ok(output.includes('• React'));
    assert.ok(output.includes('• Node.js'));
    assert.ok(!output.includes('[object Object]'));
  });

  test('cleanTitle removes unwanted trailing dots from titles', () => {
    assert.equal(cleanTitle('Full Stack Developer.'), 'Full Stack Developer');
    assert.equal(cleanTitle('Software Engineer...'), 'Software Engineer');
    assert.equal(cleanTitle('DevOps & Cloud'), 'DevOps & Cloud');
  });
});

describe('Developer Terminal - Command Registry Output and English Polish Tests', () => {
  const mockContent = {
    hero: {
      name: 'Esubalew Molla',
      titles: ['Full Stack Developer.'],
    },
    about: {
      description: 'Full-stack software engineer architecting production web platforms.',
      stats: [
        { label: 'Years of production code', value: 3, suffix: '+' },
        { label: 'Full-stack systems shipped', value: 15, suffix: '+' },
      ],
      competencies: [
        { id: 'comp-1', name: 'MERN Stack', order: 1, visible: true },
        { id: 'comp-2', name: 'PERN Stack', order: 2, visible: true },
        { id: 'comp-3', name: 'Flutter', order: 3, visible: true },
        { id: 'comp-4', name: 'Node.js', order: 4, visible: true },
        { id: 'comp-5', name: 'React', order: 5, visible: true },
      ],
    },
    skills: {
      categories: [
        {
          name: 'Frontend',
          items: [
            { id: 's1', name: 'React', exp: '3+ yrs', visible: true },
            { id: 's2', name: 'TypeScript', exp: '2+ yrs', visible: true },
          ],
        },
      ],
    },
    experience: {
      categories: [
        {
          name: 'Engineering Experience',
          published: true,
          items: [
            {
              role: 'Full Stack Developer Intern',
              company: 'Askuala Link Software Co.',
              duration: 'June 2026 — Present',
              location: 'Bahir Dar, Ethiopia',
              bullets: [
                'Architected real-time WebSocket state streaming dashboards cutting latency by 45%.',
              ],
              skills: ['React', 'Node.js', 'Express', 'Docker'],
              published: true,
            },
          ],
        },
      ],
    },
    certificates: [
      {
        name: 'CCNA: Introduction to Networks',
        issuer: 'Cisco Academy',
        date: '2024',
        skills: ['Networking'],
        published: true,
      },
    ],
    contactInfo: {
      email: 'esubalew392@gmail.com',
      phone: '+251 915795794',
      location: 'Bahir Dar, Ethiopia',
    },
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/esubalew7', enabled: true },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/esubalew-molla-7a584739b', enabled: true },
    ],
  };

  const mockProjects = [
    {
      _id: 'p1',
      title: 'Local Service Finder',
      description: 'A cross-platform Flutter mobile application connecting local service providers.',
      category: 'mobile',
      technologies: ['Flutter', 'Dart', 'Firebase'],
      liveLink: 'https://github.com/esubalew7/Local-Service-Finder-App',
      githubLink: 'https://github.com/esubalew7/Local-Service-Finder-App',
    },
  ];

  const registry = buildCommandRegistry({ content: mockContent, projects: mockProjects });
  const parser = new CommandParser(registry);

  test('1. "about" command outputs readable competencies with zero [object Object]', () => {
    const res = parser.execute(parser.parse('about'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('ABOUT ME — ESUBALEW MOLLA'));
    assert.ok(res.output.includes('Full Stack Developer'));
    assert.ok(!res.output.includes('Full Stack Developer.')); // Trailing dot cleaned
    assert.ok(res.output.includes('Competencies:'));
    assert.ok(res.output.includes('• MERN Stack'));
    assert.ok(res.output.includes('• React'));
    assert.ok(!res.output.includes('[object Object]'), 'Output must not leak [object Object]');
  });

  test('2. "skills" command displays categorised tech stack without object leakage', () => {
    const res = parser.execute(parser.parse('skills'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('TECHNICAL ARSENAL & SKILLS'));
    assert.ok(res.output.includes('React (3+ yrs)'));
    assert.ok(res.output.includes('ARCHITECTURAL COMPETENCIES'));
    assert.ok(res.output.includes('MERN Stack, PERN Stack'));
    assert.ok(!res.output.includes('[object Object]'));
  });

  test('3. "projects" command lists projects with technologies and links', () => {
    const res = parser.execute(parser.parse('projects'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('FEATURED PRODUCTION PROJECTS'));
    assert.ok(res.output.includes('1. Local Service Finder [MOBILE]'));
    assert.ok(res.output.includes('Stack:       Flutter, Dart, Firebase'));
    assert.ok(res.output.includes('Live Demo:   https://github.com/esubalew7/Local-Service-Finder-App'));
    assert.ok(!res.output.includes('[object Object]'));
  });

  test('4. "project" command retrieves single project details and handles not found', () => {
    const foundRes = parser.execute(parser.parse('project finder'));
    assert.equal(foundRes.success, true);
    assert.ok(foundRes.output.includes('PROJECT DOSSIER: LOCAL SERVICE FINDER'));
    assert.ok(foundRes.output.includes('Category:    MOBILE'));

    const notFoundRes = parser.execute(parser.parse('project unknown-app'));
    assert.equal(notFoundRes.success, true);
    assert.ok(notFoundRes.output.includes("No project found matching 'unknown-app'"));
  });

  test('5. "experience" command formats professional timeline in natural English', () => {
    const res = parser.execute(parser.parse('experience'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('PROFESSIONAL ENGINEERING EXPERIENCE'));
    assert.ok(res.output.includes('Full Stack Developer Intern — Askuala Link Software Co.'));
    assert.ok(res.output.includes('Timeline: June 2026 — Present (Bahir Dar, Ethiopia)'));
    assert.ok(res.output.includes('Architected real-time WebSocket state streaming dashboards'));
    assert.ok(!res.output.includes('[object Object]'));
  });

  test('6. "education" command displays degree and verified credentials', () => {
    const res = parser.execute(parser.parse('education'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('ACADEMIC BACKGROUND & EDUCATION'));
    assert.ok(res.output.includes('Bahir Dar University'));
    assert.ok(res.output.includes('CCNA: Introduction to Networks — Cisco Academy (2024)'));
    assert.ok(!res.output.includes('[object Object]'));
  });

  test('7. "certifications" command displays verified industry certifications', () => {
    const res = parser.execute(parser.parse('certifications'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('VERIFIED CERTIFICATIONS & CREDENTIALS'));
    assert.ok(res.output.includes('CCNA: Introduction to Networks'));
    assert.ok(res.output.includes('Issuer:     Cisco Academy (2024)'));
    assert.ok(!res.output.includes('[object Object]'));
  });

  test('8. "contact" command displays verified channels and response commitment', () => {
    const res = parser.execute(parser.parse('contact'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('DIRECT CHANNELS & CONTACT'));
    assert.ok(res.output.includes('esubalew392@gmail.com'));
    assert.ok(res.output.includes('+251 915795794'));
    assert.ok(res.output.includes('Within 24 hours guaranteed'));
  });

  test('9. "whoami" command displays user session profile', () => {
    const res = parser.execute(parser.parse('whoami'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('USER SESSION PROFILE'));
    assert.ok(res.output.includes('guest@portfolio:terminal'));
    assert.ok(res.output.includes('Esubalew Molla'));
  });

  test('10. "ls" and "cat" commands simulate clean virtual filesystem', () => {
    const lsRes = parser.execute(parser.parse('ls'));
    assert.equal(lsRes.success, true);
    assert.ok(lsRes.output.includes('Directory: /home/esubalew/portfolio'));
    assert.ok(lsRes.output.includes('about.txt'));
    assert.ok(lsRes.output.includes('skills.md'));

    const catRes = parser.execute(parser.parse('cat about.txt'));
    assert.equal(catRes.success, true);
    assert.ok(catRes.output.includes('ABOUT ME — ESUBALEW MOLLA'));

    const catNotFound = parser.execute(parser.parse('cat non_existent.txt'));
    assert.equal(catNotFound.success, true);
    assert.ok(catNotFound.output.includes('cat: non_existent.txt: No such file or directory'));
  });

  test('11. Unknown command provides polite message with "Did you mean?" suggestion', () => {
    const parsed = parser.parse('skils');
    assert.equal(parsed.valid, false);
    assert.ok(parsed.error.includes("Command not found: 'skils'"));
    assert.ok(parsed.error.includes("Did you mean 'skills'?"));

    const parsed2 = parser.parse('completely_invalid_random_cmd_123');
    assert.equal(parsed2.valid, false);
    assert.ok(parsed2.error.includes("Command not found: 'completely_invalid_random_cmd_123'"));
    assert.ok(parsed2.error.includes("Type 'help' to view all available commands."));
  });

  test('12. "clear" command dispatches clear type', () => {
    const res = parser.execute(parser.parse('clear'));
    assert.equal(res.success, true);
    assert.equal(res.type, 'clear');
  });

  test('13. "sudo" command returns polite permission denied', () => {
    const res = parser.execute(parser.parse('sudo rm -rf /'));
    assert.equal(res.success, true);
    assert.ok(res.output.includes('Permission denied'));
  });
});
