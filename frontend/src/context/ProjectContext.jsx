import { createContext, useContext, useMemo } from 'react';

const ProjectContext = createContext(null);

const projects = [
  {
    title: 'Distributed Commerce Platform',
    category: 'backend',
    description: 'A resilient commerce system with real-time inventory and service boundaries.',
    technologies: ['Node.js', 'PostgreSQL', 'WebSocket'],
    link: '#contact',
  },
  {
    title: 'Operations Dashboard',
    category: 'frontend',
    description: 'A focused interface for monitoring workflows, deployments, and team activity.',
    technologies: ['React', 'TypeScript', 'Vite'],
    link: '#contact',
  },
];

export function ProjectProvider({ children }) {
  const value = useMemo(() => ({ projects, loading: false }), []);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  return useContext(ProjectContext) || { projects: [], loading: false };
}
