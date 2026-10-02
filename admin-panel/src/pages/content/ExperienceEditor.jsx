import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Briefcase,
  Award,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Check,
  Building2,
  ExternalLink,
  Calendar,
  MapPin,
  Tag,
  ListPlus,
  FileCheck2,
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import FormInput from '../../components/ui/FormInput';
import ImageUploader from '../../components/ui/ImageUploader';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const emptyItem = {
  id: '',
  role: '',
  title: '',
  company: '',
  duration: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  description: '',
  tags: [],
  skills: [],
  bullets: [],
  logo: '',
  order: 1,
  published: true,
};

const emptyCertificate = {
  id: '',
  name: '',
  issuer: '',
  issuerColor: '#FF4D00',
  date: '',
  image: '',
  credentialUrl: '',
  url: '',
  skills: [],
  order: 1,
  published: true,
};

const BRAND_COLORS = [
  { name: 'Accent Orange', color: '#FF4D00' },
  { name: 'Meta Blue', color: '#0081FB' },
  { name: 'MongoDB Green', color: '#00ED64' },
  { name: 'freeCodeCamp Red', color: '#E11D48' },
  { name: 'Azure Blue', color: '#0284C7' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Purple', color: '#8B5CF6' },
];

const ExperienceEditor = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('experience'); // 'experience' | 'certificates' | 'settings'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Experience and Certificates data state
  const [experienceData, setExperienceData] = useState({
    title: "Where I've built\nreal systems.",
    subtitle: '',
    eyebrow: 'Career Record',
    resumeUrl: '/resume.pdf',
    resumeText: 'Resume',
    categories: [],
  });
  const [certificatesData, setCertificatesData] = useState([]);

  // Tag & bullet input states
  const [newSkillInputs, setNewSkillInputs] = useState({});
  const [newCertSkillInput, setNewCertSkillInput] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/content');
      if (res.success && res.data) {
        if (res.data.experience) {
          setExperienceData({
            title: res.data.experience.title || "Where I've built\nreal systems.",
            subtitle: res.data.experience.subtitle || '',
            eyebrow: res.data.experience.eyebrow || 'Career Record',
            resumeUrl: res.data.experience.resumeUrl || res.data.resume?.url || '/resume.pdf',
            resumeText: res.data.experience.resumeText || 'Resume',
            categories: res.data.experience.categories || [],
          });
        }
        if (Array.isArray(res.data.certificates)) {
          setCertificatesData(res.data.certificates);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load experience & certificates data');
      showToast('Failed to load data: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, [fetchData]);

  // Save handler for both experience & certificates
  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/api/content', {
        experience: experienceData,
        certificates: certificatesData,
      });
      showToast('Experience & Certifications successfully saved!');
    } catch (err) {
      showToast('Failed to save: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORY ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const addCategory = () => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      order: (experienceData.categories?.length || 0) + 1,
      published: true,
      items: [],
    };
    setExperienceData((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), newCat],
    }));
  };

  const removeCategory = (ci) => {
    const cat = experienceData.categories[ci];
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${cat.name || 'Untitled'}" and all its ${cat.items?.length || 0} items? This cannot be undone.`,
      onConfirm: () => {
        setExperienceData((prev) => ({
          ...prev,
          categories: prev.categories.filter((_, i) => i !== ci),
        }));
      },
    });
  };

  const setCategoryField = (ci, field, value) => {
    setExperienceData((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => (i === ci ? { ...c, [field]: value } : c)),
    }));
  };

  const moveCategory = (ci, direction) => {
    const cats = [...experienceData.categories];
    const targetIdx = direction === 'up' ? ci - 1 : ci + 1;
    if (targetIdx < 0 || targetIdx >= cats.length) return;
    const temp = cats[ci];
    cats[ci] = cats[targetIdx];
    cats[targetIdx] = temp;
    // update order numbers
    cats.forEach((c, idx) => {
      c.order = idx + 1;
    });
    setExperienceData((prev) => ({ ...prev, categories: cats }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPERIENCE ITEM ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const addItem = (ci) => {
    const cat = experienceData.categories[ci];
    const newItem = {
      ...emptyItem,
      id: `exp-${Date.now()}`,
      order: (cat.items?.length || 0) + 1,
      role: '',
      company: '',
      published: true,
    };
    setExperienceData((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) =>
        i === ci ? { ...c, items: [...(c.items || []), newItem] } : c
      ),
    }));
  };

  const removeItem = (ci, ii) => {
    const item = experienceData.categories[ci]?.items[ii];
    setConfirmModal({
      isOpen: true,
      title: 'Delete Experience Entry',
      message: `Are you sure you want to delete "${item.role || item.title || 'Untitled'}" at "${item.company || 'Unknown Company'}"?`,
      onConfirm: () => {
        setExperienceData((prev) => ({
          ...prev,
          categories: prev.categories.map((c, i) =>
            i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c
          ),
        }));
      },
    });
  };

  const setItemField = (ci, ii, field, value) => {
    setExperienceData((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) =>
        i === ci
          ? {
              ...c,
              items: c.items.map((item, j) =>
                j === ii ? { ...item, [field]: value } : item
              ),
            }
          : c
      ),
    }));
  };

  const moveItem = (ci, ii, direction) => {
    const items = [...experienceData.categories[ci].items];
    const targetIdx = direction === 'up' ? ii - 1 : ii + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[ii];
    items[ii] = items[targetIdx];
    items[targetIdx] = temp;
    items.forEach((item, idx) => {
      item.order = idx + 1;
    });
    setExperienceData((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => (i === ci ? { ...c, items } : c)),
    }));
  };

  // Bullet actions
  const addBullet = (ci, ii) => {
    const item = experienceData.categories[ci]?.items[ii];
    const bullets = Array.isArray(item.bullets) ? [...item.bullets, ''] : [''];
    setItemField(ci, ii, 'bullets', bullets);
  };

  const updateBullet = (ci, ii, bi, text) => {
    const item = experienceData.categories[ci]?.items[ii];
    const bullets = [...(item.bullets || [])];
    bullets[bi] = text;
    setItemField(ci, ii, 'bullets', bullets);
  };

  const removeBullet = (ci, ii, bi) => {
    const item = experienceData.categories[ci]?.items[ii];
    const bullets = (item.bullets || []).filter((_, idx) => idx !== bi);
    setItemField(ci, ii, 'bullets', bullets);
  };

  // Skill tag actions for experience
  const addExperienceSkill = (ci, ii, skill) => {
    if (!skill.trim()) return;
    const item = experienceData.categories[ci]?.items[ii];
    const existing = item.skills || item.tags || [];
    if (!existing.includes(skill.trim())) {
      const updated = [...existing, skill.trim()];
      setItemField(ci, ii, 'skills', updated);
      setItemField(ci, ii, 'tags', updated);
    }
    setNewSkillInputs((prev) => ({ ...prev, [`${ci}-${ii}`]: '' }));
  };

  const removeExperienceSkill = (ci, ii, skillToRemove) => {
    const item = experienceData.categories[ci]?.items[ii];
    const existing = item.skills || item.tags || [];
    const updated = existing.filter((s) => s !== skillToRemove);
    setItemField(ci, ii, 'skills', updated);
    setItemField(ci, ii, 'tags', updated);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CERTIFICATE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const addCertificate = () => {
    const newCert = {
      ...emptyCertificate,
      id: `cert-${Date.now()}`,
      order: (certificatesData.length || 0) + 1,
      name: '',
      issuer: '',
      date: String(new Date().getFullYear()),
      published: true,
    };
    setCertificatesData((prev) => [...prev, newCert]);
    setActiveTab('certificates');
  };

  const removeCertificate = (certIdx) => {
    const cert = certificatesData[certIdx];
    setConfirmModal({
      isOpen: true,
      title: 'Delete Certificate',
      message: `Are you sure you want to delete certificate "${cert.name || 'Untitled'}" issued by "${cert.issuer || 'Unknown'}"?`,
      onConfirm: () => {
        setCertificatesData((prev) => prev.filter((_, idx) => idx !== certIdx));
      },
    });
  };

  const setCertField = (certIdx, field, value) => {
    setCertificatesData((prev) =>
      prev.map((c, idx) => (idx === certIdx ? { ...c, [field]: value } : c))
    );
  };

  const moveCert = (certIdx, direction) => {
    const certs = [...certificatesData];
    const targetIdx = direction === 'up' ? certIdx - 1 : certIdx + 1;
    if (targetIdx < 0 || targetIdx >= certs.length) return;
    const temp = certs[certIdx];
    certs[certIdx] = certs[targetIdx];
    certs[targetIdx] = temp;
    certs.forEach((c, idx) => {
      c.order = idx + 1;
    });
    setCertificatesData(certs);
  };

  const addCertSkill = (certIdx, skill) => {
    if (!skill.trim()) return;
    const cert = certificatesData[certIdx];
    const existing = cert.skills || [];
    if (!existing.includes(skill.trim())) {
      setCertField(certIdx, 'skills', [...existing, skill.trim()]);
    }
    setNewCertSkillInput('');
  };

  const removeCertSkill = (certIdx, skillToRemove) => {
    const cert = certificatesData[certIdx];
    const existing = cert.skills || [];
    setCertField(certIdx, 'skills', existing.filter((s) => s !== skillToRemove));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading Experience & Certifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="font-bold text-lg text-red-500">Failed to load experience section</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans">
      <SectionHeader
        title="Experience & Credentials CMS"
        subtitle="Manage 3D Observatory career stations, company logos, responsibilities, and verified certificates."
        onSave={handleSave}
        saving={saving}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'experience'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Experience Entries ({experienceData.categories?.reduce((acc, c) => acc + (c.items?.length || 0), 0) || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certifications ({certificatesData.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Section Settings</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: EXPERIENCE ENTRIES & CATEGORIES
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Career Categories & Entries</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Each published entry is transformed deterministically into a 3D Observatory Station.
              </p>
            </div>
            <button
              type="button"
              onClick={addCategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {experienceData.categories?.length === 0 ? (
            <Card className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No Experience Categories</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                Create a category like "Engineering Experience" or "Education" to add your stations.
              </p>
              <button
                type="button"
                onClick={addCategory}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                + Add First Category
              </button>
            </Card>
          ) : (
            experienceData.categories.map((cat, ci) => (
              <Card key={cat.id || ci} padding={false} className="border border-gray-200 dark:border-gray-800 shadow-sm">
                {/* Category Header */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-mono text-xs flex items-center justify-center font-bold">
                      {ci + 1}
                    </span>
                    <input
                      type="text"
                      value={cat.name}
                      placeholder="Category Name (e.g. Engineering Experience)"
                      onChange={(e) => setCategoryField(ci, 'name', e.target.value)}
                      className="font-bold text-lg text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-blue-500 focus:outline-none transition-all px-1"
                    />
                    <span className="text-xs text-gray-400 font-mono">
                      ({cat.items?.length || 0} {cat.items?.length === 1 ? 'station' : 'stations'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move Category Up/Down */}
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                      <button
                        type="button"
                        disabled={ci === 0}
                        onClick={() => moveCategory(ci, 'up')}
                        title="Move Category Up"
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={ci === experienceData.categories.length - 1}
                        onClick={() => moveCategory(ci, 'down')}
                        title="Move Category Down"
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Publish / Unpublish Toggle */}
                    <button
                      type="button"
                      onClick={() => setCategoryField(ci, 'published', cat.published === false ? true : false)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        cat.published !== false
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                      }`}
                    >
                      {cat.published !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{cat.published !== false ? 'Published' : 'Hidden'}</span>
                    </button>

                    {/* Delete Category */}
                    <button
                      type="button"
                      onClick={() => removeCategory(ci)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items in Category */}
                <div className="p-6 space-y-6">
                  {cat.items?.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                      <p className="text-xs text-gray-400">No experience stations in this category yet.</p>
                      <button
                        type="button"
                        onClick={() => addItem(ci)}
                        className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        + Add First Station
                      </button>
                    </div>
                  ) : (
                    cat.items.map((item, ii) => (
                      <div
                        key={item.id || ii}
                        className={`p-5 rounded-2xl border transition-all space-y-4 ${
                          item.published === false
                            ? 'bg-gray-100/70 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-700 opacity-80'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xs'
                        }`}
                      >
                        {/* Item Control Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-orange-500">
                              STATION {String(ii + 1).padStart(2, '0')}
                            </span>
                            {item.current && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Current
                              </span>
                            )}
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {item.role || item.title ? `${item.role || item.title} ${item.company ? `at ${item.company}` : ''}` : 'Untitled Station'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Move Item */}
                            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                              <button
                                type="button"
                                disabled={ii === 0}
                                onClick={() => moveItem(ci, ii, 'up')}
                                title="Move Item Up"
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={ii === cat.items.length - 1}
                                onClick={() => moveItem(ci, ii, 'down')}
                                title="Move Item Down"
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 border-l border-gray-200 dark:border-gray-700"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Visibility Toggle */}
                            <button
                              type="button"
                              onClick={() => setItemField(ci, ii, 'published', item.published === false ? true : false)}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                item.published !== false
                                  ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                              }`}
                              title={item.published !== false ? 'Published to 3D Observatory' : 'Hidden from public'}
                            >
                              {item.published !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            {/* Delete Item */}
                            <button
                              type="button"
                              onClick={() => removeItem(ci, ii)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Core Role, Company, Location */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FormInput
                            label="Role / Title"
                            placeholder="e.g. Full Stack Developer Intern"
                            value={item.role || item.title || ''}
                            onChange={(e) => {
                              setItemField(ci, ii, 'role', e.target.value);
                              setItemField(ci, ii, 'title', e.target.value);
                            }}
                          />
                          <FormInput
                            label="Company / Organization"
                            placeholder="e.g. Askuala Link"
                            value={item.company || ''}
                            onChange={(e) => setItemField(ci, ii, 'company', e.target.value)}
                          />
                          <FormInput
                            label="Location"
                            placeholder="e.g. Bahir Dar, Ethiopia"
                            value={item.location || ''}
                            onChange={(e) => setItemField(ci, ii, 'location', e.target.value)}
                          />
                        </div>

                        {/* Dates & Current Position */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <FormInput
                            label="Start Date / Year"
                            placeholder="e.g. June 2026 or 2024"
                            value={item.startDate || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const end = item.current ? 'Present' : (item.endDate || '');
                              setItemField(ci, ii, 'startDate', val);
                              setItemField(ci, ii, 'duration', `${val} — ${end}`);
                            }}
                          />
                          <FormInput
                            label="End Date / Year"
                            placeholder="e.g. September 2026 or 2025"
                            disabled={Boolean(item.current)}
                            value={item.current ? 'Present' : (item.endDate || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItemField(ci, ii, 'endDate', val);
                              setItemField(ci, ii, 'duration', `${item.startDate || ''} — ${val}`);
                            }}
                          />

                          <div className="pb-2.5">
                            <label className="flex items-center gap-2.5 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(item.current)}
                                onChange={(e) => {
                                  const isCur = e.target.checked;
                                  setItemField(ci, ii, 'current', isCur);
                                  if (isCur) {
                                    setItemField(ci, ii, 'endDate', 'Present');
                                    setItemField(ci, ii, 'duration', `${item.startDate || ''} — Present`);
                                  }
                                }}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                              />
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Current Role (Present)
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Company Logo Upload & Preview */}
                        <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                                Company Logo (Optional)
                              </span>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Rendered at 52–68px in the 3D Observatory card & detail drawer. Clean SVG, PNG, or WebP.
                              </p>
                            </div>
                            {item.logo && (
                              <div className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <img
                                  src={item.logo}
                                  alt="Logo preview"
                                  className="w-7 h-7 object-contain rounded"
                                />
                                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">Logo Attached</span>
                              </div>
                            )}
                          </div>

                          <ImageUploader
                            label=""
                            value={item.logo || ''}
                            onChange={(url) => setItemField(ci, ii, 'logo', url)}
                          />
                        </div>

                        {/* Description */}
                        <FormInput
                          label="Timeline Summary / Overview"
                          textarea
                          rows={2}
                          placeholder="Brief summary of your responsibilities, team impact, or systems architected..."
                          value={item.description || ''}
                          onChange={(e) => setItemField(ci, ii, 'description', e.target.value)}
                        />

                        {/* Responsibilities Bullets */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Key Responsibilities & Impact (Detail Drawer)
                            </label>
                            <button
                              type="button"
                              onClick={() => addBullet(ci, ii)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Bullet</span>
                            </button>
                          </div>

                          {(!item.bullets || item.bullets.length === 0) ? (
                            <p className="text-xs text-gray-400 italic">No bullets added. Click "+ Add Bullet" to add achievement lines.</p>
                          ) : (
                            <div className="space-y-2">
                              {item.bullets.map((bullet, bi) => (
                                <div key={bi} className="flex items-center gap-2">
                                  <span className="text-orange-500 font-mono text-xs">→</span>
                                  <input
                                    type="text"
                                    value={bullet}
                                    placeholder="e.g. Architected real-time WebSocket state synchronization..."
                                    onChange={(e) => updateBullet(ci, ii, bi, e.target.value)}
                                    className="flex-1 px-3 py-1.5 text-xs border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeBullet(ci, ii, bi)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove bullet"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Skills / Tech Tags */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Technologies & Stack Chips
                          </label>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {(item.skills?.length ? item.skills : item.tags || []).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                              >
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => removeExperienceSkill(ci, ii, skill)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}

                            <div className="inline-flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Add skill (Enter)..."
                                value={newSkillInputs[`${ci}-${ii}`] || ''}
                                onChange={(e) =>
                                  setNewSkillInputs((prev) => ({
                                    ...prev,
                                    [`${ci}-${ii}`]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addExperienceSkill(ci, ii, newSkillInputs[`${ci}-${ii}`] || '');
                                  }
                                }}
                                className="w-36 px-2.5 py-1 text-xs border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => addExperienceSkill(ci, ii, newSkillInputs[`${ci}-${ii}`] || '')}
                                className="p-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add Station Button */}
                  <button
                    type="button"
                    onClick={() => addItem(ci)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Experience Station</span>
                  </button>
                </div>
              </Card>
            ))
          )}

          <button
            type="button"
            onClick={addCategory}
            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2 cursor-pointer bg-gray-50/50 dark:bg-gray-800/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Experience Category</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: CERTIFICATIONS CMS
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-orange-50/40 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Credentials & Verified Certifications</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Certificates appear in the 3D Observatory Credentials Station with high-resolution image preview & click-to-enlarge lightbox.
              </p>
            </div>
            <button
              type="button"
              onClick={addCertificate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certificate</span>
            </button>
          </div>

          {certificatesData.length === 0 ? (
            <Card className="text-center py-12">
              <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No Certifications in Database</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                Add your verified professional certificates and course credentials.
              </p>
              <button
                type="button"
                onClick={addCertificate}
                className="mt-4 px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl hover:bg-orange-700 transition-colors"
              >
                + Add First Certificate
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {certificatesData.map((cert, certIdx) => (
                <Card
                  key={cert.id || certIdx}
                  className={`border transition-all ${
                    cert.published === false
                      ? 'bg-gray-50/80 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-700 opacity-80'
                      : 'border-gray-200 dark:border-gray-800 shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-mono text-xs flex items-center justify-center font-bold">
                          {certIdx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-gray-900 dark:text-white">
                            {cert.name || 'Untitled Certificate'}
                          </h3>
                          <span
                            className="text-xs font-mono font-semibold"
                            style={{ color: cert.issuerColor || '#FF4D00' }}
                          >
                            {cert.issuer || 'Issuer Name'} · {cert.date || 'Year'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Reorder Buttons */}
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                          <button
                            type="button"
                            disabled={certIdx === 0}
                            onClick={() => moveCert(certIdx, 'up')}
                            title="Move Certificate Up"
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={certIdx === certificatesData.length - 1}
                            onClick={() => moveCert(certIdx, 'down')}
                            title="Move Certificate Down"
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 border-l border-gray-200 dark:border-gray-700"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => setCertField(certIdx, 'published', cert.published === false ? true : false)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            cert.published !== false
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                          }`}
                        >
                          {cert.published !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{cert.published !== false ? 'Published' : 'Hidden'}</span>
                        </button>

                        {/* Delete Certificate */}
                        <button
                          type="button"
                          onClick={() => removeCertificate(certIdx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete Certificate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormInput
                        label="Certificate Name"
                        placeholder="e.g. Meta Front-End Developer"
                        value={cert.name || ''}
                        onChange={(e) => setCertField(certIdx, 'name', e.target.value)}
                      />
                      <FormInput
                        label="Issuer Organization"
                        placeholder="e.g. Meta, MongoDB University, freeCodeCamp"
                        value={cert.issuer || ''}
                        onChange={(e) => setCertField(certIdx, 'issuer', e.target.value)}
                      />
                      <FormInput
                        label="Issue Date / Year"
                        placeholder="e.g. 2024"
                        value={cert.date || ''}
                        onChange={(e) => setCertField(certIdx, 'date', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormInput
                        label="Credential Verification URL"
                        placeholder="https://coursera.org/verify/... or https://freecodecamp.org/..."
                        value={cert.credentialUrl || cert.url || ''}
                        onChange={(e) => {
                          setCertField(certIdx, 'credentialUrl', e.target.value);
                          setCertField(certIdx, 'url', e.target.value);
                        }}
                      />

                      {/* Brand Color Selector */}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Brand Accent Color ({cert.issuerColor || '#FF4D00'})
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={cert.issuerColor || '#FF4D00'}
                            onChange={(e) => setCertField(certIdx, 'issuerColor', e.target.value)}
                            className="w-10 h-10 p-0.5 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-transparent"
                          />
                          <div className="flex flex-wrap items-center gap-1.5">
                            {BRAND_COLORS.map((b) => (
                              <button
                                key={b.color}
                                type="button"
                                onClick={() => setCertField(certIdx, 'issuerColor', b.color)}
                                className={`w-6 h-6 rounded-full border transition-transform ${
                                  cert.issuerColor === b.color ? 'scale-110 ring-2 ring-blue-500' : ''
                                }`}
                                style={{ backgroundColor: b.color }}
                                title={b.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Image Upload & Preview */}
                    <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                            Certificate Official Image / Badge
                          </span>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Displayed in the 2x2 grid in 3D and enlarged in the lightbox. High-res PNG/JPG/WebP/SVG.
                          </p>
                        </div>
                        {cert.image && (
                          <a
                            href={cert.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <span>Inspect Asset</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <ImageUploader
                        label=""
                        value={cert.image || ''}
                        onChange={(url) => setCertField(certIdx, 'image', url)}
                      />
                    </div>

                    {/* Skills Covered in Certificate */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Skills & Competencies Certified
                      </label>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {(cert.skills || []).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeCertSkill(certIdx, skill)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}

                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Add skill (Enter)..."
                            value={newCertSkillInput}
                            onChange={(e) => setNewCertSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCertSkill(certIdx, newCertSkillInput);
                              }
                            }}
                            className="w-36 px-2.5 py-1 text-xs border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => addCertSkill(certIdx, newCertSkillInput)}
                            className="p-1 rounded bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 text-xs font-semibold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <button
                type="button"
                onClick={addCertificate}
                className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 transition-all flex items-center justify-center gap-2 cursor-pointer bg-gray-50/50 dark:bg-gray-800/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Certificate</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: SECTION SETTINGS
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <Card className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Observatory Section Copy & Links</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Control the top heading, category eyebrow, and resume button URL that appear over the 3D scene.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Eyebrow Tag"
              placeholder="e.g. Career Record"
              value={experienceData.eyebrow || ''}
              onChange={(e) => setExperienceData((prev) => ({ ...prev, eyebrow: e.target.value }))}
            />
            <FormInput
              label="Resume Action Link"
              placeholder="e.g. /resume.pdf or https://drive.google.com/..."
              value={experienceData.resumeUrl || ''}
              onChange={(e) => setExperienceData((prev) => ({ ...prev, resumeUrl: e.target.value }))}
            />
          </div>

          <FormInput
            label="Section Main Title"
            textarea
            rows={2}
            placeholder="e.g. Where I've built&#10;real systems."
            value={experienceData.title || ''}
            onChange={(e) => setExperienceData((prev) => ({ ...prev, title: e.target.value }))}
          />

          <FormInput
            label="Section Subtitle / Description"
            textarea
            rows={2}
            placeholder="A timeline of production systems, software engineering internships, and academic excellence."
            value={experienceData.subtitle || ''}
            onChange={(e) => setExperienceData((prev) => ({ ...prev, subtitle: e.target.value }))}
          />
        </Card>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        confirmText="Confirm Delete"
      />
    </div>
  );
};

export default ExperienceEditor;
