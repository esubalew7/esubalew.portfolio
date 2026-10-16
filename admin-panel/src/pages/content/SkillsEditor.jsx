import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { useContentSection } from '../../hooks/useContentSection';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import FormInput from '../../components/ui/FormInput';

const SkillsEditor = () => {
  const { data, loading, saving, error, update, save, refetch } = useContentSection('skills');

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
        <p className="font-bold mb-2">Failed to load skills section</p>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const skills = data || {};

  const handleAddCategory = () => {
    const orbitIds = ['orbit-1', 'orbit-2', 'orbit-3', 'orbit-4'];
    const nextOrbit = orbitIds[skills.categories?.length % 4] || 'orbit-1';
    const categories = [...(skills.categories || []), { name: '', orbit: nextOrbit, items: [] }];
    update({ ...skills, categories });
  };

  const handleRemoveCategory = (index) => {
    const categories = skills.categories.filter((_, i) => i !== index);
    update({ ...skills, categories });
  };

  const handleCategoryFieldChange = (index, field, value) => {
    const categories = skills.categories.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    update({ ...skills, categories });
  };

  const handleAddSkill = (catIndex) => {
    const defaultOrbit = skills.categories?.[catIndex]?.orbit || 'orbit-1';
    const categories = skills.categories.map((c, i) =>
      i === catIndex
        ? {
            ...c,
            items: [
              ...(c.items || []),
              {
                id: `sk-${Date.now()}`,
                name: '',
                level: 'Advanced',
                exp: '2+ yrs',
                orbit: defaultOrbit,
                category: c.name || 'Core',
                description: '',
                tags: [],
                iconSlug: '',
                order: (c.items?.length || 0) + 1,
                visible: true,
              },
            ],
          }
        : c
    );
    update({ ...skills, categories });
  };

  const handleRemoveSkill = (catIndex, skillIndex) => {
    const categories = skills.categories.map((c, i) =>
      i === catIndex
        ? { ...c, items: c.items.filter((_, si) => si !== skillIndex) }
        : c
    );
    update({ ...skills, categories });
  };

  const handleSkillChange = (catIndex, skillIndex, field, value) => {
    const categories = skills.categories.map((c, i) =>
      i === catIndex
        ? {
            ...c,
            items: c.items.map((s, si) =>
              si === skillIndex ? { ...s, [field]: value } : s
            ),
          }
        : c
    );
    update({ ...skills, categories });
  };

  return (
    <div className="max-w-4xl">
      <SectionHeader
        title="Skills Section & 3D Orbits"
        subtitle="Manage orbital skills, ring assignments, technical descriptions, and SimpleIcons brand slugs"
        onSave={save}
        saving={saving}
      />

      <Card className="space-y-6">
        <FormInput
          label="Title"
          value={skills.title || ''}
          onChange={(e) => update({ ...skills, title: e.target.value })}
        />
        <FormInput
          label="Subtitle"
          value={skills.subtitle || ''}
          onChange={(e) => update({ ...skills, subtitle: e.target.value })}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Orbital Categories & Skill Rings
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Skills map to the 4 Three.js perspective rings: Ring 1 (Frontend, 135px), Ring 2 (Backend, 215px), Ring 3 (Data & Infra, 295px), Ring 4 (Mobile & Tools, 375px)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCategory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          </div>
          {(skills.categories || []).length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-4">
              No categories yet. Click "Add Category" to create one.
            </p>
          )}
          {(skills.categories || []).map((category, catIndex) => (
            <div
              key={catIndex}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Category {catIndex + 1}: {category.name || 'Untitled'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(catIndex)}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  label="Category Name"
                  value={category.name || ''}
                  onChange={(e) => handleCategoryFieldChange(catIndex, 'name', e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Default Orbital Ring
                  </label>
                  <select
                    value={category.orbit || 'orbit-1'}
                    onChange={(e) => handleCategoryFieldChange(catIndex, 'orbit', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="orbit-1">Orbit 1 — Frontend (Inner Ring · 135px)</option>
                    <option value="orbit-2">Orbit 2 — Backend (Mid-Inner Ring · 215px)</option>
                    <option value="orbit-3">Orbit 3 — Data & Infrastructure (Mid-Outer Ring · 295px)</option>
                    <option value="orbit-4">Orbit 4 — Mobile & Tools (Outer Ring · 375px)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Skills in {category.name || 'this category'}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddSkill(catIndex)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Skill
                  </button>
                </div>
                {(category.items || []).length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-2">
                    No skills yet.
                  </p>
                )}
                {(category.items || []).map((skill, skillIndex) => (
                  <div
                    key={skillIndex}
                    className="p-3 bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-gray-700/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {skill.name || `Skill ${skillIndex + 1}`}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-mono">
                          {skill.orbit || category.orbit || 'orbit-1'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={skill.visible !== false}
                            onChange={(e) => handleSkillChange(catIndex, skillIndex, 'visible', e.target.checked)}
                            className="rounded text-blue-600"
                          />
                          Visible
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(catIndex, skillIndex)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <FormInput
                        label="Skill Name"
                        value={skill.name || ''}
                        onChange={(e) =>
                          handleSkillChange(catIndex, skillIndex, 'name', e.target.value)
                        }
                      />
                      <FormInput
                        label="Experience (e.g. 3+ yrs)"
                        value={skill.exp || ''}
                        onChange={(e) =>
                          handleSkillChange(catIndex, skillIndex, 'exp', e.target.value)
                        }
                      />
                      <FormInput
                        label="Icon Slug (SimpleIcons)"
                        placeholder="e.g. react, nodedotjs"
                        value={skill.iconSlug || ''}
                        onChange={(e) =>
                          handleSkillChange(catIndex, skillIndex, 'iconSlug', e.target.value)
                        }
                      />
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Assigned Orbit
                        </label>
                        <select
                          value={skill.orbit || category.orbit || 'orbit-1'}
                          onChange={(e) =>
                            handleSkillChange(catIndex, skillIndex, 'orbit', e.target.value)
                          }
                          className="w-full px-2.5 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none focus:border-blue-500"
                        >
                          <option value="orbit-1">Ring 1 (Frontend)</option>
                          <option value="orbit-2">Ring 2 (Backend)</option>
                          <option value="orbit-3">Ring 3 (Data & Infra)</option>
                          <option value="orbit-4">Ring 4 (Mobile & Tools)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormInput
                        label="Focus Card Description"
                        value={skill.description || ''}
                        placeholder="Short technical description for 3D hover focus card"
                        onChange={(e) =>
                          handleSkillChange(catIndex, skillIndex, 'description', e.target.value)
                        }
                      />
                      <FormInput
                        label="Technical Tags (comma-separated)"
                        value={Array.isArray(skill.tags) ? skill.tags.join(', ') : skill.tags || ''}
                        placeholder="e.g. React 19, Hooks, Vite"
                        onChange={(e) =>
                          handleSkillChange(
                            catIndex,
                            skillIndex,
                            'tags',
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SkillsEditor;
