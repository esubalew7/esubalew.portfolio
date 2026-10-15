import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { useContentSection } from '../../hooks/useContentSection';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import FormInput from '../../components/ui/FormInput';
import ImageUploader from '../../components/ui/ImageUploader';

const AboutEditor = () => {
  const { data, loading, saving, error, update, save, refetch } = useContentSection('about');

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
        <p className="font-bold mb-2">Failed to load about section</p>
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

  const about = data || {};

  const handleAddStat = () => {
    const stats = [...(about.stats || []), { label: '', value: '', suffix: '' }];
    update({ ...about, stats });
  };

  const handleRemoveStat = (index) => {
    const stats = about.stats.filter((_, i) => i !== index);
    update({ ...about, stats });
  };

  const handleStatChange = (index, field, value) => {
    const stats = about.stats.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    update({ ...about, stats });
  };

  const handleAddCompetency = () => {
    const competencies = [...(about.competencies || []), ''];
    update({ ...about, competencies });
  };

  const handleRemoveCompetency = (index) => {
    const competencies = (about.competencies || []).filter((_, i) => i !== index);
    update({ ...about, competencies });
  };

  const handleCompetencyChange = (index, value) => {
    const competencies = (about.competencies || []).map((c, i) => (i === index ? value : c));
    update({ ...about, competencies });
  };

  const handleAddAssignment = () => {
    const assignments = [
      ...(about.assignments || []),
      {
        id: `asg-${Date.now()}`,
        organization: '',
        role: '',
        period: '',
        status: 'active',
        current: true,
        order: (about.assignments?.length || 0) + 1,
        visible: true,
      },
    ];
    update({ ...about, assignments });
  };

  const handleRemoveAssignment = (index) => {
    const assignments = (about.assignments || []).filter((_, i) => i !== index);
    update({ ...about, assignments });
  };

  const handleAssignmentChange = (index, field, value) => {
    const assignments = (about.assignments || []).map((a, i) =>
      i === index ? { ...a, [field]: value } : a
    );
    update({ ...about, assignments });
  };

  return (
    <div className="max-w-4xl">
      <SectionHeader
        title="About Section"
        subtitle="Edit your about/bio section, dossier badges, competencies ticker, and current assignments"
        onSave={save}
        saving={saving}
      />

      <Card className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <FormInput
            label="Dossier Reference"
            value={about.dossierRef || ''}
            placeholder="Ref: ESU-2024"
            onChange={(e) => update({ ...about, dossierRef: e.target.value })}
          />
          <FormInput
            label="Clearance / Title"
            value={about.clearanceLevel || ''}
            placeholder="Clearance: Senior Engineer"
            onChange={(e) => update({ ...about, clearanceLevel: e.target.value })}
          />
          <FormInput
            label="Personnel ID"
            value={about.personnelId || ''}
            placeholder="ESU-001"
            onChange={(e) => update({ ...about, personnelId: e.target.value })}
          />
        </div>

        <FormInput
          label="Title"
          value={about.title || ''}
          onChange={(e) => update({ ...about, title: e.target.value })}
        />
        <FormInput
          label="Subtitle"
          value={about.subtitle || ''}
          onChange={(e) => update({ ...about, subtitle: e.target.value })}
        />
        <FormInput
          label="Description"
          textarea
          rows={4}
          value={about.description || ''}
          onChange={(e) => update({ ...about, description: e.target.value })}
        />
        <ImageUploader
          label="Profile Image"
          value={about.image || ''}
          onChange={(url) => update({ ...about, image: url })}
        />

        {/* ── Competencies Ticker ── */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Competencies Ticker</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Continuous marquee competencies ticker displayed in the About dossier</p>
            </div>
            <button
              type="button"
              onClick={handleAddCompetency}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Competency
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {(about.competencies || []).map((comp, index) => {
              const compText = typeof comp === 'string' ? comp : comp.text || comp.name || '';
              return (
                <div key={index} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-lg p-1.5">
                  <input
                    type="text"
                    value={compText}
                    onChange={(e) => handleCompetencyChange(index, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-gray-800 dark:text-gray-200 outline-none px-1"
                    placeholder="e.g. MERN Stack"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetency(index)}
                    className="p-1 text-red-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Current Assignments & Education ── */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Current Assignment & Education</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Section 02 block in About dossier</p>
            </div>
            <button
              type="button"
              onClick={handleAddAssignment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Assignment
            </button>
          </div>
          {(about.assignments || []).map((asg, index) => (
            <div
              key={asg.id || index}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Assignment {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={asg.status === 'active' || asg.current}
                      onChange={(e) => handleAssignmentChange(index, 'status', e.target.checked ? 'active' : 'completed')}
                      className="rounded text-emerald-600"
                    />
                    Active (Green Pulse)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveAssignment(index)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInput
                  label="Organization / University"
                  value={asg.organization || ''}
                  placeholder="e.g. Askuala Link Software Co."
                  onChange={(e) => handleAssignmentChange(index, 'organization', e.target.value)}
                />
                <FormInput
                  label="Role / Degree"
                  value={asg.role || ''}
                  placeholder="e.g. Frontend Developer Intern"
                  onChange={(e) => handleAssignmentChange(index, 'role', e.target.value)}
                />
                <FormInput
                  label="Period"
                  value={asg.period || ''}
                  placeholder="e.g. 2024 — Present"
                  onChange={(e) => handleAssignmentChange(index, 'period', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Stats
            </label>
            <button
              type="button"
              onClick={handleAddStat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stat
            </button>
          </div>
          {(about.stats || []).length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-4">
              No stats yet. Click "Add Stat" to create one.
            </p>
          )}
          {(about.stats || []).map((stat, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Stat {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveStat(index)}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInput
                  label="Label"
                  value={stat.label || ''}
                  onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                />
                <FormInput
                  label="Value"
                  value={stat.value || ''}
                  onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                />
                <FormInput
                  label="Suffix"
                  value={stat.suffix || ''}
                  onChange={(e) => handleStatChange(index, 'suffix', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Call to Action
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="CTA Text"
              value={about.cta?.text || ''}
              onChange={(e) =>
                update({ ...about, cta: { ...about.cta, text: e.target.value } })
              }
            />
            <FormInput
              label="CTA Link"
              value={about.cta?.link || ''}
              onChange={(e) =>
                update({ ...about, cta: { ...about.cta, link: e.target.value } })
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AboutEditor;
