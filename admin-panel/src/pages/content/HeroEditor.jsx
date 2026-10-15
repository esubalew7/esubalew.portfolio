import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { useContentSection } from '../../hooks/useContentSection';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import FormInput from '../../components/ui/FormInput';
import ImageUploader from '../../components/ui/ImageUploader';

const HeroEditor = () => {
  const { data, loading, saving, error, update, save, refetch } = useContentSection('hero');

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
        <p className="font-bold mb-2">Failed to load hero section</p>
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

  const hero = data || {};

  const handleAddTitle = () => {
    const titles = [...(hero.titles || []), ''];
    update({ ...hero, titles });
  };

  const handleRemoveTitle = (index) => {
    const titles = hero.titles.filter((_, i) => i !== index);
    update({ ...hero, titles });
  };

  const handleTitleChange = (index, value) => {
    const titles = hero.titles.map((t, i) => (i === index ? value : t));
    update({ ...hero, titles });
  };

  const handleCtaChange = (key, field, value) => {
    const cta = {
      primary: { text: '', link: '' },
      secondary: { text: '', link: '' },
      ...hero.cta,
      [key]: { ...(hero.cta?.[key] || {}), [field]: value },
    };
    update({ ...hero, cta });
  };

  const handleAddMetric = () => {
    const metrics = [
      ...(hero.metrics || []),
      { id: `metric-${Date.now()}`, value: '', label: '', suffix: '', order: (hero.metrics?.length || 0) + 1, visible: true },
    ];
    update({ ...hero, metrics });
  };

  const handleRemoveMetric = (index) => {
    const metrics = (hero.metrics || []).filter((_, i) => i !== index);
    update({ ...hero, metrics });
  };

  const handleMetricChange = (index, field, value) => {
    const metrics = (hero.metrics || []).map((m, i) => (i === index ? { ...m, [field]: value } : m));
    update({ ...hero, metrics });
  };

  const handleBannerChange = (field, value) => {
    const availabilityBanner = {
      badgeText: 'Available for freelance',
      subText: 'Response time < 24h',
      buttonText: 'Book a Call',
      buttonLink: '#contact',
      bookedBadgeText: 'Currently booked',
      bookedSubText: 'Accepting inquiries for next quarter',
      bookedButtonText: 'Inquire',
      visible: true,
      ...(hero.availabilityBanner || {}),
      [field]: value,
    };
    update({ ...hero, availabilityBanner });
  };

  return (
    <div className="max-w-4xl">
      <SectionHeader
        title="Hero Section"
        subtitle="Edit your hero/landing section content"
        onSave={save}
        saving={saving}
      />

      <Card className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Freelance Availability</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle live availability status badge across portfolio</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hero.available !== false}
              onChange={(e) => update({ ...hero, available: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        <FormInput
          label="Greeting"
          value={hero.greeting || ''}
          onChange={(e) => update({ ...hero, greeting: e.target.value })}
        />
        <FormInput
          label="Name"
          value={hero.name || ''}
          onChange={(e) => update({ ...hero, name: e.target.value })}
        />
        <ImageUploader
          label="Profile Image"
          value={hero.image || ''}
          onChange={(url) => update({ ...hero, image: url })}
        />
        <FormInput
          label="Description"
          textarea
          rows={3}
          value={hero.description || ''}
          onChange={(e) => update({ ...hero, description: e.target.value })}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Typewriter Titles
            </label>
            <button
              type="button"
              onClick={handleAddTitle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Title
            </button>
          </div>
          {(hero.titles || []).length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-4">
              No titles yet. Click "Add Title" to create one.
            </p>
          )}
          {(hero.titles || []).map((title, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-1">
                <FormInput
                  label={`Title ${index + 1}`}
                  value={title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveTitle(index)}
                className="mt-7 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* ── Metric Chips ── */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Hero Metric Chips</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Key highlight counters displayed under hero CTAs</p>
            </div>
            <button
              type="button"
              onClick={handleAddMetric}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Metric
            </button>
          </div>
          {(hero.metrics || []).map((metric, index) => (
            <div
              key={metric.id || index}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Metric {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metric.visible !== false}
                      onChange={(e) => handleMetricChange(index, 'visible', e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveMetric(index)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  label="Display Value (e.g. 3+, 15+, 2FA)"
                  value={metric.value || ''}
                  onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                />
                <FormInput
                  label="Label (e.g. Years building, Systems shipped)"
                  value={metric.label || ''}
                  onChange={(e) => handleMetricChange(index, 'label', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Availability Ticker Configuration ── */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Availability Ticker</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Top notification bar with pulse indicator and quick CTA</p>
            </div>
            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={hero.availabilityBanner?.visible !== false}
                onChange={(e) => handleBannerChange('visible', e.target.checked)}
                className="rounded text-blue-600"
              />
              Show Ticker
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Available Badge Text"
              value={hero.availabilityBanner?.badgeText || ''}
              placeholder="Available for freelance"
              onChange={(e) => handleBannerChange('badgeText', e.target.value)}
            />
            <FormInput
              label="Available Subtext"
              value={hero.availabilityBanner?.subText || ''}
              placeholder="Response time < 24h"
              onChange={(e) => handleBannerChange('subText', e.target.value)}
            />
            <FormInput
              label="Available Button Text"
              value={hero.availabilityBanner?.buttonText || ''}
              placeholder="Book a Call"
              onChange={(e) => handleBannerChange('buttonText', e.target.value)}
            />
            <FormInput
              label="Button Target Link"
              value={hero.availabilityBanner?.buttonLink || ''}
              placeholder="#contact"
              onChange={(e) => handleBannerChange('buttonLink', e.target.value)}
            />
            <FormInput
              label="Booked Badge Text"
              value={hero.availabilityBanner?.bookedBadgeText || ''}
              placeholder="Currently booked"
              onChange={(e) => handleBannerChange('bookedBadgeText', e.target.value)}
            />
            <FormInput
              label="Booked Subtext"
              value={hero.availabilityBanner?.bookedSubText || ''}
              placeholder="Accepting inquiries for next quarter"
              onChange={(e) => handleBannerChange('bookedSubText', e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Primary CTA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Text"
              value={hero.cta?.primary?.text || ''}
              onChange={(e) => handleCtaChange('primary', 'text', e.target.value)}
            />
            <FormInput
              label="Link"
              value={hero.cta?.primary?.link || ''}
              onChange={(e) => handleCtaChange('primary', 'link', e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Secondary CTA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Text"
              value={hero.cta?.secondary?.text || ''}
              onChange={(e) => handleCtaChange('secondary', 'text', e.target.value)}
            />
            <FormInput
              label="Link"
              value={hero.cta?.secondary?.link || ''}
              onChange={(e) => handleCtaChange('secondary', 'link', e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HeroEditor;
