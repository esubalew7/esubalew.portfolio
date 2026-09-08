import { create } from 'zustand';

const defaultContent = {
  hero: {
    name: 'Esubalew Molla',
    description: 'Building production-grade distributed systems, MERN platforms, and real-time web architecture.',
  },
  resume: { url: '/resume.pdf' },
  sections: { hero: true, about: true, skills: true, projects: true, experience: true, contact: true },
  footer: { text: 'Built with care and shipped to production.' },
  socialLinks: [],
  about: { stats: [] },
  skills: { categories: [] },
};

export const useContentStore = create(() => ({
  content: defaultContent,
  loading: false,
  error: null,
}));
