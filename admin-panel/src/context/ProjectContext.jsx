import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const ProjectContext = createContext(undefined);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      // Don't override the "Server is waking up..." message if it's retrying
      setLoading(true);
      const res = await api.get('/api/projects');
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setProjects(list);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      
      const isNetworkError = err.code === 'ECONNABORTED' || 
                            err.message?.includes('Network Error') || 
                            err.message?.includes('Failed to fetch') ||
                            !err.response;
      
      if (isNetworkError) {
        setError('Server is waking up, please wait...');
        setTimeout(fetchProjects, 3000); // retry after 3 sec
      } else {
        setError(err.message || 'Failed to fetch projects');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Listen for manual retry events
  useEffect(() => {
    const handleRetry = () => fetchProjects();
    window.addEventListener('retryProjects', handleRetry);
    return () => window.removeEventListener('retryProjects', handleRetry);
  }, [fetchProjects]);

  const addProject = async (projectData) => {
    try {
      const response = await api.post('/api/projects', projectData);
      const newProj = response?.data && (response.data._id || response.data.title) ? response.data : response;
      setProjects((prev) => [newProj, ...prev]);
      return { success: true, data: newProj };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const response = await api.put(`/api/projects/${id}`, projectData);
      const updatedProj = response?.data && (response.data._id || response.data.title) ? response.data : response;
      setProjects((prev) =>
        prev.map((p) => (p._id === id || p.id === id ? updatedProj : p))
      );
      return { success: true, data: updatedProj };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
