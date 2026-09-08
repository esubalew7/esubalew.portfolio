import { useContentSection } from '../../hooks/useContentSection';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import FormInput from '../../components/ui/FormInput';
import ImageUploader from '../../components/ui/ImageUploader';

const emptyItem = {
  role: '', title: '', company: '', duration: '', location: '',
  startDate: '', endDate: '', current: false, description: '',
  tags: [], skills: [], bullets: [], logo: ''
};

const ExperienceEditor = () => {
  const { data, loading, saving, error, update, save, refetch } = useContentSection('experience');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="font-bold">Failed to load experience section.</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const d = data || { title: '', subtitle: '', categories: [] };

  const setField = (field, value) => {
    update({ ...d, [field]: value });
  };

  const addCategory = () => {
    setField('categories', [...d.categories, { name: '', items: [] }]);
  };

  const removeCategory = (ci) => {
    setField('categories', d.categories.filter((_, i) => i !== ci));
  };

  const setCategoryField = (ci, field, value) => {
    const updated = d.categories.map((c, i) => (i === ci ? { ...c, [field]: value } : c));
    setField('categories', updated);
  };

  const addItem = (ci) => {
    const updated = d.categories.map((c, i) =>
      i === ci ? { ...c, items: [...c.items, { ...emptyItem }] } : c
    );
    setField('categories', updated);
  };

  const removeItem = (ci, ii) => {
    const updated = d.categories.map((c, i) =>
      i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c
    );
    setField('categories', updated);
  };

  const setItemField = (ci, ii, field, value) => {
    const updated = d.categories.map((c, i) =>
      i === ci
        ? {
            ...c,
            items: c.items.map((item, j) =>
              j === ii ? { ...item, [field]: value } : item
            ),
          }
        : c
    );
    setField('categories', updated);
  };

  return (
    <div>
      <SectionHeader
        title="Experience Editor"
        subtitle="Manage your work experience, education, and timeline entries."
        onSave={save}
        saving={saving}
      />

      <div className="space-y-4">
        <Card>
          <div className="space-y-4">
            <FormInput
              label="Section Title"
              value={d.title}
              onChange={(e) => setField('title', e.target.value)}
            />
            <FormInput
              label="Section Subtitle"
              textarea
              rows={2}
              value={d.subtitle}
              onChange={(e) => setField('subtitle', e.target.value)}
            />
          </div>
        </Card>

        {d.categories.map((cat, ci) => (
          <Card key={ci} padding={false}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {cat.name || `Category ${ci + 1}`}
              </h3>
              <button
                type="button"
                onClick={() => removeCategory(ci)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <FormInput
                label="Category Name"
                value={cat.name}
                onChange={(e) => setCategoryField(ci, 'name', e.target.value)}
              />

              {cat.items.map((item, ii) => (
                <div
                  key={ii}
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {item.role || `Item ${ii + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(ci, ii)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput
                      label="Role / Title"
                      value={item.title || item.role || ''}
                      onChange={(e) => {
                        setItemField(ci, ii, 'role', e.target.value);
                        setItemField(ci, ii, 'title', e.target.value);
                      }}
                    />
                    <FormInput
                      label="Company / Organization"
                      value={item.company || ''}
                      onChange={(e) => setItemField(ci, ii, 'company', e.target.value)}
                    />
                    <FormInput
                      label="Location"
                      value={item.location || ''}
                      onChange={(e) => setItemField(ci, ii, 'location', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Start Date / Year"
                      placeholder="e.g. 2024"
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
                      placeholder="e.g. 2025"
                      disabled={Boolean(item.current)}
                      value={item.current ? 'Present' : (item.endDate || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItemField(ci, ii, 'endDate', val);
                        setItemField(ci, ii, 'duration', `${item.startDate || ''} — ${val}`);
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${ci}-${ii}`}
                      checked={Boolean(item.current)}
                      onChange={(e) => {
                        const isCur = e.target.checked;
                        setItemField(ci, ii, 'current', isCur);
                        if (isCur) {
                          setItemField(ci, ii, 'endDate', 'Present');
                          setItemField(ci, ii, 'duration', `${item.startDate || ''} — Present`);
                        }
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <label
                      htmlFor={`current-${ci}-${ii}`}
                      className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                    >
                      Currently working or studying here (Present)
                    </label>
                  </div>

                  <FormInput
                    label="Description (Timeline Summary)"
                    textarea
                    rows={3}
                    placeholder="Describe what you architected, shipped, or learned..."
                    value={item.description || (Array.isArray(item.bullets) ? item.bullets.join(' ') : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItemField(ci, ii, 'description', val);
                      setItemField(ci, ii, 'bullets', val.split('\n').map((s) => s.trim()).filter(Boolean));
                    }}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Skills & Technologies (comma separated)
                    </label>
                    <input
                      className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="React, Node.js, MongoDB, Socket.IO"
                      value={(item.skills?.length ? item.skills : item.tags || []).join(', ')}
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                        setItemField(ci, ii, 'skills', arr);
                        setItemField(ci, ii, 'tags', arr);
                      }}
                    />
                  </div>

                  <ImageUploader
                    label="Logo"
                    value={item.logo || ''}
                    onChange={(url) => setItemField(ci, ii, 'logo', url)}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => addItem(ci)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </Card>
        ))}

        <button
          type="button"
          onClick={addCategory}
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-all w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>
    </div>
  );
};

export default ExperienceEditor;
