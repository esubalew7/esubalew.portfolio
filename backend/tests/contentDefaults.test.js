import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureAllContentDefaults,
  ensureExperienceAndCertificates,
  getDefaultContent,
} from '../controllers/contentController.js';

describe('CMS Default Reversion Bug Prevention Tests', () => {
  test('1. A custom skills category can be renamed without being reverted', () => {
    const customContent = {
      skills: {
        title: 'My Custom Tech Stack',
        subtitle: 'Production Systems',
        categories: [
          {
            name: 'Cloud & Distributed Platforms',
            orbit: 'orbit-1',
            items: [
              { name: 'Kubernetes', level: 'Advanced', exp: '2+ yrs', visible: true },
              { name: 'Kafka', level: 'Advanced', exp: '1+ yr', visible: true },
            ],
          },
        ],
      },
    };

    // Run ensureAllContentDefaults multiple times (simulating repeated GET requests)
    ensureAllContentDefaults(customContent);
    ensureAllContentDefaults(customContent);

    assert.equal(customContent.skills.categories.length, 1);
    assert.equal(customContent.skills.categories[0].name, 'Cloud & Distributed Platforms');
    assert.equal(customContent.skills.categories[0].items[0].name, 'Kubernetes');
  });

  test('2. The default "Frontend" category can be deleted if admin deletes it', () => {
    const customContent = {
      skills: {
        title: 'Backend Only',
        categories: [
          {
            name: 'Backend Core',
            orbit: 'orbit-2',
            items: [{ name: 'Go', level: 'Expert', visible: true }],
          },
        ],
      },
    };

    ensureAllContentDefaults(customContent);

    const hasFrontend = customContent.skills.categories.some((c) => c.name === 'Frontend');
    assert.equal(hasFrontend, false, '"Frontend" category must not be resurrected');
    assert.equal(customContent.skills.categories[0].name, 'Backend Core');
  });

  test('3. Custom skills and their order survive repeated normalization', () => {
    const customContent = {
      skills: {
        categories: [
          {
            name: 'Languages',
            orbit: 'orbit-1',
            items: [
              { name: 'Rust', order: 1, visible: true },
              { name: 'Elixir', order: 2, visible: true },
              { name: 'TypeScript', order: 3, visible: true },
            ],
          },
        ],
      },
    };

    for (let i = 0; i < 5; i++) {
      ensureAllContentDefaults(customContent);
    }

    assert.equal(customContent.skills.categories[0].items.length, 3);
    assert.equal(customContent.skills.categories[0].items[0].name, 'Rust');
    assert.equal(customContent.skills.categories[0].items[1].name, 'Elixir');
    assert.equal(customContent.skills.categories[0].items[2].name, 'TypeScript');
  });

  test('4. An intentionally empty array is not repopulated with defaults', () => {
    const customContent = {
      hero: {
        metrics: [], // Admin emptied all metrics
        titles: [],  // Admin emptied typewriter titles
      },
      about: {
        competencies: [], // Admin emptied competencies
        assignments: [],  // Admin emptied assignments
      },
      certificates: [],   // Admin emptied certificates
    };

    ensureAllContentDefaults(customContent);
    ensureExperienceAndCertificates(customContent);

    assert.deepEqual(customContent.hero.metrics, [], 'Hero metrics must remain empty array');
    assert.deepEqual(customContent.hero.titles, [], 'Hero titles must remain empty array');
    assert.deepEqual(customContent.about.competencies, [], 'About competencies must remain empty array');
    assert.deepEqual(customContent.about.assignments, [], 'About assignments must remain empty array');
    assert.deepEqual(customContent.certificates, [], 'Certificates must remain empty array');
  });

  test('5. Missing content can still be initialized safely', () => {
    const blankContent = {};

    ensureAllContentDefaults(blankContent);
    ensureExperienceAndCertificates(blankContent);

    const defaults = getDefaultContent();
    assert.ok(blankContent.hero, 'Hero section initialized');
    assert.equal(blankContent.hero.name, defaults.hero.name);
    assert.ok(blankContent.skills, 'Skills section initialized');
    assert.ok(blankContent.about, 'About section initialized');
    assert.ok(blankContent.experience, 'Experience section initialized');
    assert.ok(Array.isArray(blankContent.certificates), 'Certificates initialized');
  });

  test('6. Normalization is strictly idempotent', () => {
    const content = getDefaultContent();
    const snapshot1 = JSON.stringify(content);

    ensureAllContentDefaults(content);
    ensureExperienceAndCertificates(content);
    const snapshot2 = JSON.stringify(content);

    ensureAllContentDefaults(content);
    ensureExperienceAndCertificates(content);
    const snapshot3 = JSON.stringify(content);

    assert.equal(snapshot2, snapshot3, 'Repeated normalization must not mutate document');
  });

  test('7. Terminal settings and custom commands survive normalization', () => {
    const customContent = {
      terminal: {
        enabled: true,
        title: 'Custom Terminal',
        subtitle: 'Dev Shell',
        promptPrefix: 'guest@custom:~$',
        shortcut: 'Ctrl+K',
        showEntryPoint: false,
        welcomeMessage: 'Hello custom terminal',
        commands: [
          {
            id: 'secret',
            name: 'secret',
            description: 'My custom easter egg',
            category: 'Custom',
            aliases: ['sec'],
            enabled: true,
            order: 1,
            customResponse: 'Secret revealed!',
          },
        ],
      },
    };

    ensureAllContentDefaults(customContent);
    ensureAllContentDefaults(customContent);

    assert.equal(customContent.terminal.title, 'Custom Terminal');
    assert.equal(customContent.terminal.promptPrefix, 'guest@custom:~$');
    assert.equal(customContent.terminal.shortcut, 'Ctrl+K');
    assert.equal(customContent.terminal.showEntryPoint, false);
    assert.equal(customContent.terminal.commands.length, 1);
    assert.equal(customContent.terminal.commands[0].name, 'secret');
    assert.equal(customContent.terminal.commands[0].customResponse, 'Secret revealed!');
  });
});

