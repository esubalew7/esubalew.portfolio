import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';

const ProjectContext = createContext(null);

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://portfolio-backend-gxhv.onrender.com');

// Fallback projects with all required fields matching the backend Project model
const fallbackProjects = [
  {
    _id: 'fb-1',
    title: 'Real Estate Management Platform',
    category: 'mern',
    description:
      'A full-featured MERN stack property marketplace with role-based dashboard, property filtering, inquiry workflows, and image management.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    liveLink: 'https://github.com/esubalew7',
    githubLink: 'https://github.com/esubalew7',
  },
  {
    _id: 'fb-2',
    title: 'College Management System',
    category: 'mern',
    description:
      'An administrative and academic tracking platform managing students, courses, grades, and faculty records with JWT-secured endpoints.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    liveLink: 'https://github.com/esubalew7',
    githubLink: 'https://github.com/esubalew7',
  },
  {
    _id: 'fb-3',
    title: 'Agricultural Marketplace',
    category: 'mern',
    description:
      'A digital supply-chain marketplace connecting farmers with buyers, featuring real-time inventory listings, location-based matching, and order tracking.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Redux Toolkit'],
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&q=80',
    liveLink: 'https://github.com/esubalew7',
    githubLink: 'https://github.com/esubalew7',
  },
  {
    _id: 'fb-4',
    title: 'Distributed Real-Time Operations Platform',
    category: 'backend',
    description:
      'High-throughput backend service with WebSocket event streaming, TOTP 2FA authentication, and low-latency system health monitors.',
    technologies: ['Node.js', 'PostgreSQL', 'Socket.IO', 'Express', 'Docker'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    liveLink: 'https://github.com/esubalew7',
    githubLink: 'https://github.com/esubalew7',
  },
];

/**
 * Normalizes a project object from backend API or fallback data
 * so every field expected by the frontend cards is guaranteed.
 */
function normalizeProject(project) {
  if (!project) return null;

  const live = project.liveLink || project.liveUrl || project.link || '#';
  const github = project.githubLink || project.githubUrl || '#';

  const tech = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
    ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean)
    : project.techStack || [];

  return {
    ...project,
    _id: project._id || project.id,
    title: project.title || 'Untitled Project',
    description: project.description || '',
    category: (project.category || 'mern').toLowerCase().trim(),
    image:
      project.image ||
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    technologies: tech,
    liveLink: live,
    liveUrl: live,
    githubLink: github,
    githubUrl: github,
    caseStudy: project.caseStudy || null,
  };
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(fallbackProjects.map(normalizeProject));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`);
      if (!res.ok) {
        throw new Error(`Failed to fetch projects: ${res.statusText}`);
      }
      const data = await res.json();
      // Handle both plain array and { success: true, data: [...] } responses
      const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];

      if (list.length > 0) {
        setProjects(list.map(normalizeProject));
      }
      setError(null);
    } catch (err) {
      console.warn('[ProjectContext] Using fallback projects:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    // Listen for real-time project updates via Socket.IO
    let socket = null;
    try {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      socket.on('project:create', () => fetchProjects());
      socket.on('project:update', () => fetchProjects());
      socket.on('project:delete', () => fetchProjects());
    } catch (err) {
      console.warn('[ProjectContext] Socket connection error:', err);
    }

    return () => {
      if (socket) {
        socket.off('project:create');
        socket.off('project:update');
        socket.off('project:delete');
        socket.disconnect();
      }
    };
  }, [fetchProjects]);

  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      refetch: fetchProjects,
    }),
    [projects, loading, error, fetchProjects]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    return {
      projects: fallbackProjects.map(normalizeProject),
      loading: false,
      error: null,
      refetch: () => {},
    };
  }
  return context;
}

export default ProjectContext;
