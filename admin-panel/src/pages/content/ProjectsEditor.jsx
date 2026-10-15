import { useState, useEffect, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Github, 
  List, 
  Grid3X3,
  Image as ImageIcon,
  Upload,
  X as CloseIcon
} from 'lucide-react';

// UI Components
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/ui/FormInput';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

// Dashboard Components
import PageHeader from '../../components/dashboard/PageHeader';
import DashboardTable from '../../components/dashboard/DashboardTable';
import DashboardProjectCard from '../../components/dashboard/DashboardProjectCard';

// Utils
import { formatDate, normalizedText } from '../../utils/dashboardUtils';
import api from '../../utils/api';

const DashboardProjects = () => {
  const {
    projects,
    loading,
    error: projectsError,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const { showToast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mern',
    technologies: '',
    image: '',
    liveLink: '',
    githubLink: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Section Headers CMS State
  const [sectionHeaders, setSectionHeaders] = useState({
    eyebrow: 'Selected Work',
    title: "What I've built\nfor production.",
    subtitle: 'Production-grade applications architected for reliability, sub-100ms API response times, and resilient state synchronization.',
  });
  const [savingHeaders, setSavingHeaders] = useState(false);
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);

  useEffect(() => {
    api.get('/api/content').then((res) => {
      const data = res?.data?.data || res?.data;
      if (data?.projectsSection) {
        setSectionHeaders({
          eyebrow: data.projectsSection.eyebrow || 'Selected Work',
          title: data.projectsSection.title || "What I've built\nfor production.",
          subtitle: data.projectsSection.subtitle || '',
        });
      }
    }).catch((err) => console.warn('Failed to load project section settings:', err));
  }, []);

  const handleSaveHeaders = async () => {
    setSavingHeaders(true);
    try {
      await api.put('/api/content', { projectsSection: sectionHeaders });
      showToast('Section headers updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to save section headers.', 'error');
    } finally {
      setSavingHeaders(false);
    }
  };

  // Sync external errors to toasts
  useEffect(() => {
    if (projectsError) showToast(projectsError, 'error');
  }, [projectsError, showToast]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      [p.title, p.description, ...(p.technologies || [])]
        .some(val => normalizedText(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [projects, searchTerm]);

  // Handlers
  const handleOpenModal = (project = null) => {
    setFormErrors({});
    setImageFile(null);
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        description: project.description || '',
        category: (project.category || 'mern').toLowerCase().trim(),
        technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : (project.technologies || ''),
        image: project.image || '',
        liveLink: project.liveLink || project.liveUrl || '',
        githubLink: project.githubLink || project.githubUrl || '',
      });
      setImagePreview(project.image || null);
    } else {
      setEditingProject(null);
      setFormData({ title: '', description: '', category: 'mern', technologies: '', image: '', liveLink: '', githubLink: '' });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData(prev => ({ ...prev, image: url }));
    if (url.trim()) {
      setImagePreview(url.trim());
      setFormErrors(prev => ({ ...prev, image: null }));
    } else if (!imageFile) {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.category?.trim()) errors.category = 'Valid category is required';

    const hasImage = Boolean(imageFile || formData.image?.trim() || imagePreview || editingProject?.image);
    if (!hasImage) {
      errors.image = 'A project image file or image URL is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please check the form for errors.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Upload image to Cloudinary via /api/upload (if a new file was selected)
      let imageUrl = formData.image?.trim() || editingProject?.image || '';
      let imagePublicId = editingProject?.imagePublicId || '';
      if (imageFile) {
        const imgFormData = new FormData();
        imgFormData.append('image', imageFile);

        const uploadRes = await api.post('/api/upload', imgFormData);
        imageUrl = uploadRes.imageUrl || uploadRes.data?.imageUrl || imageUrl;
        imagePublicId = uploadRes.imagePublicId || uploadRes.data?.imagePublicId || imagePublicId;
      }

      // Step 2: Submit project with the image URL + public_id
      const projectPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.toLowerCase().trim(),
        technologies: formData.technologies,
        image: imageUrl,
        imagePublicId,
        liveLink: formData.liveLink?.trim() || '',
        githubLink: formData.githubLink?.trim() || '',
      };

      if (editingProject) {
        await updateProject(editingProject._id || editingProject.id, projectPayload);
        showToast('Project updated successfully!');
      } else {
        await addProject(projectPayload);
        showToast('Project created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      showToast(err.message || 'Failed to save project.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setSubmitting(true);
      await deleteProject(projectToDelete._id || projectToDelete.id);
      showToast('Project deleted successfully.');
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete project.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns
  const columns = [
    {
      label: 'Project',
      className: 'w-1/3',
      render: (p) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
            {p.image ? (
                <img src={p.image} alt="" className="h-full w-full object-cover" />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={20} />
                </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-gray-900 dark:text-white truncate">{p.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
          </div>
        </div>
      )
    },
    {
      label: 'Technologies',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {(p.technologies || []).slice(0, 3).map((t, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
              {t}
            </span>
          ))}
          {p.technologies?.length > 3 && <span className="text-[10px] text-gray-400">+{p.technologies.length-3}</span>}
        </div>
      )
    },
    {
      label: 'Links',
      render: (p) => (
        <div className="flex gap-3">
          {p.liveLink && <a href={p.liveLink} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors"><ExternalLink size={16} /></a>}
          {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github size={16} /></a>}
        </div>
      )
    },
    {
      label: 'Created',
      render: (p) => <span className="text-xs text-gray-500">{formatDate(p.createdAt)}</span>
    },
    {
      label: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" icon={Edit} onClick={() => handleOpenModal(p)} className="p-2" />
          <Button variant="ghost" icon={Trash2} onClick={() => { setProjectToDelete(p); setShowDeleteModal(true); }} className="p-2 text-gray-400 hover:text-red-500" />
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader 
        title="Projects"
        subtitle={`Manage your portfolio work (${filteredProjects.length})`}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search projects by title, stack, or details..."
        actions={
          <>
            <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mr-2">
              <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} onClick={() => setViewMode('table')} className="px-3 py-1.5 rounded-lg"><List size={18} /></Button>
              <Button variant={viewMode === 'cards' ? 'secondary' : 'ghost'} onClick={() => setViewMode('cards')} className="px-3 py-1.5 rounded-lg"><Grid3X3 size={18} /></Button>
            </div>
            <Button onClick={() => handleOpenModal()} icon={Plus}>Add Project</Button>
          </>
        }
      />

      {/* Section Header Controls */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Section Heading & Eyebrow</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customize the eyebrow tag and H2 title displayed on the public portfolio</p>
          </div>
          <Button
            size="sm"
            onClick={handleSaveHeaders}
            disabled={savingHeaders}
          >
            {savingHeaders ? 'Saving...' : 'Save Section Header'}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Eyebrow Tag"
            value={sectionHeaders.eyebrow}
            placeholder="Selected Work"
            onChange={(e) => setSectionHeaders((prev) => ({ ...prev, eyebrow: e.target.value }))}
          />
          <FormInput
            label="Section Title"
            value={sectionHeaders.title}
            placeholder="What I've built for production."
            onChange={(e) => setSectionHeaders((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>
      </div>

      {viewMode === 'table' ? (
        <DashboardTable 
            columns={columns}
            data={filteredProjects}
            loading={loading}
            searchTerm={searchTerm}
            emptyMessage="Start by adding your first project to showcase your skills."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((p) => (
                <DashboardProjectCard 
                    key={p._id || p.id} 
                    project={p} 
                    onEdit={handleOpenModal}
                    onDelete={(project) => { setProjectToDelete(project); setShowDeleteModal(true); }}
                />
            ))}
            {filteredProjects.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center text-gray-400 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">No projects found</p>
                    <p className="text-sm">Try adjusting your filters or search term.</p>
                </div>
            )}
        </div>
      )}

      {/* Project Entry/Edit Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        title={editingProject ? 'Update Project' : 'New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput 
                label="Project Title" 
                id="title" 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                error={formErrors.title}
                placeholder="e.g. AI Portfolio Dashboard"
            />
            
            <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                >
                    <option value="mern">MERN</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="mobile">Mobile App</option>
                    <option value="fullstack">Full Stack</option>
                    <option value="other">Other</option>
                </select>
                {formErrors.category && <p className="text-xs font-semibold text-red-500">{formErrors.category}</p>}
            </div>
            <FormInput 
                label="Description" 
                id="description" 
                textarea 
                rows={3} 
                required 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                error={formErrors.description}
                placeholder="What does this project do?"
            />
            <FormInput 
                label="Technologies (comma separated)" 
                id="tech" 
                value={formData.technologies} 
                onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                placeholder="React, Tailwind, Node.js"
            />
            
            {/* Image Upload Area */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Project Image
                </label>
                <div className="flex flex-col gap-3">
                    {imagePreview && (
                        <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                    variant="danger" 
                                    icon={CloseIcon} 
                                    className="p-2" 
                                    onClick={() => { setImageFile(null); handleImageUrlChange(''); }}
                                >
                                    Clear Image
                                </Button>
                            </div>
                        </div>
                    )}
                    <label className={`
                        flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                        ${formErrors.image ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'}
                    `}>
                        <div className="flex flex-col items-center justify-center pt-3 pb-3">
                            <Upload className={`h-6 w-6 mb-1.5 ${formErrors.image ? 'text-red-500' : 'text-gray-400'}`} />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                <span className="text-blue-600 dark:text-blue-400">Click to upload image file</span> or drag & drop
                            </p>
                            <p className="text-[10px] text-gray-400">PNG, JPG, WEBP (MAX. 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>

                    <FormInput 
                        label="Or Direct Image URL" 
                        id="imageUrl" 
                        value={formData.image} 
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                    />
                    {formErrors.image && <p className="text-xs font-semibold text-red-500">{formErrors.image}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput 
                    label="Live Demo URL" 
                    id="live" 
                    value={formData.liveLink} 
                    onChange={(e) => setFormData({...formData, liveLink: e.target.value})}
                    placeholder="https://..."
                />
                <FormInput 
                    label="GitHub Repository" 
                    id="github" 
                    value={formData.githubLink} 
                    onChange={(e) => setFormData({...formData, githubLink: e.target.value})}
                    placeholder="https://github.com/..."
                />
            </div>

            <div className="pt-6 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" loading={submitting} className="flex-1" icon={editingProject ? Edit : Plus}>
                    {editingProject ? 'Save Changes' : 'Create Project'}
                </Button>
            </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        loading={submitting}
        title="Delete Project"
        message={`This will permanently remove "${projectToDelete?.title}". This action cannot be undone.`}
      />
    </div>
  );
};

export default DashboardProjects;
