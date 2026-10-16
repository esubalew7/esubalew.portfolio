import { useContentSection } from '../../hooks/useContentSection';
import { RefreshCw } from 'lucide-react';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import FormInput from '../../components/ui/FormInput';

const ContactEditor = () => {
  const { data, loading, saving, error, update, save, refetch } = useContentSection('contactInfo');

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
        <p className="font-bold">Failed to load contact info.</p>
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

  const d = data || {
    email: '', phone: '', location: '',
    formTitle: '', formDescription: '', formButtonText: '', successMessage: ''
  };

  const setField = (field, value) => {
    update({ ...d, [field]: value });
  };

  const wizard = d.wizard || {
    steps: [
      { stepNumber: 1, title: 'What are we building?', description: 'Select your project type' },
      { stepNumber: 2, title: 'Tell me who you are.', description: 'Your contact information' },
      { stepNumber: 3, title: 'When do you need this?', description: 'Select your timeline' },
    ],
    projectTypes: [
      { value: 'web-app', title: 'Web App', desc: 'React · Next.js · Full Stack' },
      { value: 'mobile-app', title: 'Mobile App', desc: 'Flutter · Cross Platform' },
      { value: 'api-backend', title: 'API / Backend', desc: 'Node · Express · NestJS' },
      { value: 'full-system', title: 'Full System', desc: 'End-to-End Architecture' },
    ],
    timelines: [
      { value: 'asap', number: '01', title: 'As Soon As Possible', desc: 'Ready to start immediately' },
      { value: '1-3-months', number: '02', title: '1–3 Months', desc: 'Planning phase, flexible start' },
      { value: '3-plus-months', number: '03', title: '3+ Months', desc: 'Long-term planning' },
    ],
    submitButtonText: 'Send Brief',
    submittingButtonText: 'Sending...',
    responseTimeText: 'Response within 4 hours',
    privacyText: 'Your data is never shared',
  };

  const setWizardField = (field, value) => {
    update({
      ...d,
      wizard: {
        ...wizard,
        [field]: value,
      },
    });
  };

  const handleProjectTypeChange = (index, field, value) => {
    const projectTypes = (wizard.projectTypes || []).map((pt, i) =>
      i === index ? { ...pt, [field]: value } : pt
    );
    setWizardField('projectTypes', projectTypes);
  };

  const handleTimelineChange = (index, field, value) => {
    const timelines = (wizard.timelines || []).map((tl, i) =>
      i === index ? { ...tl, [field]: value } : tl
    );
    setWizardField('timelines', timelines);
  };

  return (
    <div>
      <SectionHeader
        title="Contact & Briefing Room Editor"
        subtitle="Manage contact details and the 3-step project briefing room wizard"
        onSave={save}
        saving={saving}
      />

      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Details</h3>
            <FormInput
              label="Email"
              type="email"
              value={d.email}
              onChange={(e) => setField('email', e.target.value)}
            />
            <FormInput
              label="Phone"
              value={d.phone}
              onChange={(e) => setField('phone', e.target.value)}
            />
            <FormInput
              label="Location"
              value={d.location}
              onChange={(e) => setField('location', e.target.value)}
            />
          </div>
        </Card>

        {/* ── 3-Step Wizard Settings ── */}
        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Briefing Room Wizard (3-Step Form)
          </h3>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Step 1 — Project Scope Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(wizard.projectTypes || []).map((pt, index) => (
                <div key={pt.value || index} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/60 space-y-2">
                  <span className="font-mono text-xs text-blue-500 uppercase">{pt.value}</span>
                  <FormInput
                    label="Option Title"
                    value={pt.title || ''}
                    onChange={(e) => handleProjectTypeChange(index, 'title', e.target.value)}
                  />
                  <FormInput
                    label="Option Description"
                    value={pt.desc || ''}
                    onChange={(e) => handleProjectTypeChange(index, 'desc', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Step 3 — Timeline Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(wizard.timelines || []).map((tl, index) => (
                <div key={tl.value || index} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/60 space-y-2">
                  <span className="font-mono text-xs text-amber-500 uppercase">{tl.number || `0${index + 1}`} · {tl.value}</span>
                  <FormInput
                    label="Timeline Title"
                    value={tl.title || ''}
                    onChange={(e) => handleTimelineChange(index, 'title', e.target.value)}
                  />
                  <FormInput
                    label="Timeline Description"
                    value={tl.desc || ''}
                    onChange={(e) => handleTimelineChange(index, 'desc', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Submit Button Text"
              value={wizard.submitButtonText || 'Send Brief'}
              onChange={(e) => setWizardField('submitButtonText', e.target.value)}
            />
            <FormInput
              label="Submitting Button Text"
              value={wizard.submittingButtonText || 'Sending...'}
              onChange={(e) => setWizardField('submittingButtonText', e.target.value)}
            />
            <FormInput
              label="Response Time Text"
              value={wizard.responseTimeText || 'Response within 4 hours'}
              onChange={(e) => setWizardField('responseTimeText', e.target.value)}
            />
            <FormInput
              label="Success Screen Message"
              value={d.successMessage || "I'll review your project and respond within 4 hours."}
              onChange={(e) => setField('successMessage', e.target.value)}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContactEditor;
