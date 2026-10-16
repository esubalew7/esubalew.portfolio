import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Terminal as TerminalIcon,
  Plus,
  Trash2,
  RotateCcw,
  Search,
  Command,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Save,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { useContentSection } from '../../hooks/useContentSection';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import FormInput from '../../components/ui/FormInput';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import api from '../../utils/api';

const DEFAULT_WELCOME_MESSAGE = `        WELCOME TO MY INTERACTIVE DEVELOPER TERMINAL        

Hi, I'm an interactive terminal that lets you explore my portfolio,
projects, and professional journey.

Getting Started:
   • Type 'help' to see all available commands
   • Use Arrow Keys ↑↓ to navigate command history
   • Click links to open external profiles

Quick Commands:
   • about        → Learn about me
   • experience   → View my work history
   • projects     → Browse portfolio projects
   • skills       → See my technical skills
   • contact      → Get in touch

Ready to explore? Let's go!`;

const DEFAULT_COMMANDS = [
  { id: 'help', name: 'help', description: 'Show all available commands', category: 'System', aliases: ['h', '?'], enabled: true, order: 1, customResponse: '' },
  { id: 'about', name: 'about', description: 'Information about me and background', category: 'Information', aliases: ['whoami', 'info'], enabled: true, order: 2, customResponse: '' },
  { id: 'skills', name: 'skills', description: 'View technical skills and stack', category: 'Information', aliases: ['tech', 'techstack'], enabled: true, order: 3, customResponse: '' },
  { id: 'projects', name: 'projects', description: 'View portfolio projects', category: 'Portfolio', aliases: ['proj'], enabled: true, order: 4, customResponse: '' },
  { id: 'experience', name: 'experience', description: 'My professional experience and roles', category: 'Information', aliases: ['exp'], enabled: true, order: 5, customResponse: '' },
  { id: 'education', name: 'education', description: 'Educational background and certifications', category: 'Information', aliases: ['edu'], enabled: true, order: 6, customResponse: '' },
  { id: 'resume', name: 'resume', description: 'Download my CV/Resume', category: 'Portfolio', aliases: ['cv'], enabled: true, order: 7, customResponse: '' },
  { id: 'contact', name: 'contact', description: 'Get direct contact details', category: 'Links', aliases: ['mail', 'email'], enabled: true, order: 8, customResponse: '' },
  { id: 'github', name: 'github', description: 'Open GitHub profile', category: 'Links', aliases: ['gh'], enabled: true, order: 9, customResponse: '' },
  { id: 'linkedin', name: 'linkedin', description: 'Open LinkedIn profile', category: 'Links', aliases: ['in'], enabled: true, order: 10, customResponse: '' },
  { id: 'clear', name: 'clear', description: 'Clear terminal history', category: 'System', aliases: ['cls', 'rm'], enabled: true, order: 11, customResponse: '' },
];

const CATEGORIES = ['All', 'System', 'Information', 'Portfolio', 'Links', 'Custom'];

const Switch = ({ checked, onChange, id, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-2">
    <div>
      {label && <label htmlFor={id} className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">{label}</label>}
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
    </label>
  </div>
);

const TerminalEditor = () => {
  const { showToast } = useToast();
  const { data, allContent, loading, error, update, refetch } = useContentSection('terminal');

  // Form states
  const [formData, setFormData] = useState({
    enabled: true,
    title: 'Command Prompt',
    subtitle: 'Interactive Developer Console',
    promptPrefix: 'E C:\\esubalew\\portfolio>',
    shortcut: 'Ctrl+`',
    showEntryPoint: true,
    welcomeMessage: DEFAULT_WELCOME_MESSAGE,
    commands: DEFAULT_COMMANDS,
  });

  const [showAsSection, setShowAsSection] = useState(false);
  const [saving, setSaving] = useState(false);

  // Command filtering & management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedCommandId, setExpandedCommandId] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newCommandModalOpen, setNewCommandModalOpen] = useState(false);
  const [newCmd, setNewCmd] = useState({
    name: '',
    description: '',
    category: 'Custom',
    aliases: '',
    customResponse: '',
  });

  // Sync data from content API
  useEffect(() => {
    if (data) {
      setFormData({
        enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
        title: data.title || 'Command Prompt',
        subtitle: data.subtitle || 'Interactive Developer Console',
        promptPrefix: data.promptPrefix || 'E C:\\esubalew\\portfolio>',
        shortcut: data.shortcut || 'Ctrl+`',
        showEntryPoint: data.showEntryPoint !== undefined ? Boolean(data.showEntryPoint) : true,
        welcomeMessage: data.welcomeMessage !== undefined ? data.welcomeMessage : DEFAULT_WELCOME_MESSAGE,
        commands: Array.isArray(data.commands) && data.commands.length > 0 ? data.commands : DEFAULT_COMMANDS,
      });
    }
  }, [data]);

  useEffect(() => {
    if (allContent?.sections) {
      setShowAsSection(Boolean(allContent.sections.terminal));
    }
  }, [allContent]);

  const setField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      update(next);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        terminal: formData,
        sections: {
          ...(allContent?.sections || {}),
          terminal: showAsSection,
        },
      };

      await api.put('/api/content', payload);
      update(formData);
      showToast('Terminal configuration saved successfully!');
    } catch (err) {
      showToast('Failed to save terminal settings: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const resetConfig = {
      enabled: true,
      title: 'Command Prompt',
      subtitle: 'Interactive Developer Console',
      promptPrefix: 'E C:\\esubalew\\portfolio>',
      shortcut: 'Ctrl+`',
      showEntryPoint: true,
      welcomeMessage: DEFAULT_WELCOME_MESSAGE,
      commands: DEFAULT_COMMANDS,
    };
    setFormData(resetConfig);
    update(resetConfig);
    setShowAsSection(false);
    setIsResetModalOpen(false);
    showToast('Terminal reset to defaults (click Save to persist).', 'info');
  };

  const handleToggleCommand = (cmdId) => {
    setFormData((prev) => {
      const nextCommands = prev.commands.map((cmd) =>
        cmd.id === cmdId ? { ...cmd, enabled: !cmd.enabled } : cmd
      );
      const next = { ...prev, commands: nextCommands };
      update(next);
      return next;
    });
  };

  const handleUpdateCommand = (cmdId, field, value) => {
    setFormData((prev) => {
      const nextCommands = prev.commands.map((cmd) => {
        if (cmd.id !== cmdId) return cmd;
        if (field === 'aliases') {
          const aliasesArray = typeof value === 'string'
            ? value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
            : value;
          return { ...cmd, aliases: aliasesArray };
        }
        return { ...cmd, [field]: value };
      });
      const next = { ...prev, commands: nextCommands };
      update(next);
      return next;
    });
  };

  const handleDeleteCommand = (cmdId) => {
    setFormData((prev) => {
      const nextCommands = prev.commands.filter((cmd) => cmd.id !== cmdId);
      const next = { ...prev, commands: nextCommands };
      update(next);
      return next;
    });
    showToast('Command removed.');
  };

  const handleMoveCommand = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.commands.length) return;

    setFormData((prev) => {
      const nextCommands = [...prev.commands];
      const temp = nextCommands[index];
      nextCommands[index] = nextCommands[targetIndex];
      nextCommands[targetIndex] = temp;
      // Re-assign order numbers
      nextCommands.forEach((c, idx) => {
        c.order = idx + 1;
      });
      const next = { ...prev, commands: nextCommands };
      update(next);
      return next;
    });
  };

  const handleAddCommand = (e) => {
    e.preventDefault();
    const cleanName = newCmd.name.trim().toLowerCase();
    if (!cleanName) {
      showToast('Command name is required', 'error');
      return;
    }

    if (formData.commands.some((c) => c.name.toLowerCase() === cleanName || c.id === cleanName)) {
      showToast('A command with this name already exists', 'error');
      return;
    }

    const aliasesArray = newCmd.aliases
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const newCommandItem = {
      id: cleanName,
      name: cleanName,
      description: newCmd.description.trim() || 'Custom command',
      category: newCmd.category || 'Custom',
      aliases: aliasesArray,
      enabled: true,
      order: formData.commands.length + 1,
      customResponse: newCmd.customResponse.trim(),
    };

    setFormData((prev) => {
      const next = { ...prev, commands: [...prev.commands, newCommandItem] };
      update(next);
      return next;
    });

    setNewCmd({
      name: '',
      description: '',
      category: 'Custom',
      aliases: '',
      customResponse: '',
    });
    setNewCommandModalOpen(false);
    showToast(`Command '${cleanName}' added!`);
  };

  // Filter commands
  const filteredCommands = useMemo(() => {
    return formData.commands.filter((cmd) => {
      const matchesSearch =
        cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.aliases?.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' ||
        cmd.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [formData.commands, searchQuery, selectedCategory]);

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
        <p className="font-bold">Failed to load terminal section.</p>
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

  return (
    <div className="space-y-6 pb-12 font-sans">
      <SectionHeader
        title="Terminal & Shell Editor"
        subtitle="Full CMS control over the developer command prompt, keyboard shortcuts, entry points, and live command registry."
        onSave={handleSave}
        saving={saving}
        actions={
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => setIsResetModalOpen(true)}
            className="text-sm"
          >
            Reset Defaults
          </Button>
        }
      />

      {/* Live Terminal Header & Prompt Preview */}
      <Card className="bg-gradient-to-br from-gray-900 to-[#0c0c0c] text-white border-gray-800 shadow-xl overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 py-3 bg-[#181818] border-b border-[#2d2d2d]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="text-xs font-mono font-medium text-gray-300 ml-2">
              {formData.title || 'Command Prompt'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2a2a2a] text-blue-400 border border-blue-500/30">
              Shortcut: {formData.shortcut || 'Ctrl+`'}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${formData.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
              {formData.enabled ? 'ONLINE' : 'DISABLED'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm space-y-2 text-[#cccccc] bg-[#0c0c0c]/90">
          <div className="text-[#858585] text-xs">
            {formData.subtitle || 'Interactive Developer Console'} — Live Architecture
          </div>
          <div className="flex items-center gap-2 text-white pt-2">
            <span className="text-[#569cd6] font-semibold select-none">
              {formData.promptPrefix || 'E C:\\esubalew\\portfolio>'}
            </span>
            <span className="text-[#ce9178]">help</span>
            <span className="inline-block w-2.5 h-4 bg-[#569cd6] animate-pulse" />
          </div>
        </div>
      </Card>

      {/* Global Terminal Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              General Terminal Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Terminal Window Title"
              value={formData.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Command Prompt"
            />
            <FormInput
              label="Terminal Subtitle / Header Tagline"
              value={formData.subtitle}
              onChange={(e) => setField('subtitle', e.target.value)}
              placeholder="Interactive Developer Console"
            />
            <FormInput
              label="Shell Prompt Prefix"
              value={formData.promptPrefix}
              onChange={(e) => setField('promptPrefix', e.target.value)}
              placeholder="E C:\esubalew\portfolio>"
            />
            <FormInput
              label="Keyboard Shortcut Label"
              value={formData.shortcut}
              onChange={(e) => setField('shortcut', e.target.value)}
              placeholder="Ctrl+`"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Welcome ASCII / Text Banner
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Displayed when user opens the terminal or executes the clear command.
            </p>
            <textarea
              rows={8}
              value={formData.welcomeMessage}
              onChange={(e) => setField('welcomeMessage', e.target.value)}
              className="w-full px-4 py-3 font-mono text-xs sm:text-sm border rounded-xl bg-gray-900 text-gray-100 border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="Enter ASCII or greeting banner..."
            />
          </div>
        </Card>

        {/* Visibility & Entry Points */}
        <Card className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Entry Points & Access
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <Switch
              id="terminal-master-enabled"
              label="Enable Terminal Feature"
              description="Master switch. When OFF, the terminal modal and shortcuts are deactivated."
              checked={formData.enabled}
              onChange={(e) => setField('enabled', e.target.checked)}
            />

            <Switch
              id="terminal-show-entrypoint"
              label="Show Header Navbar Button (>_)"
              description="Displays the interactive terminal launcher button on the right navbar."
              checked={formData.showEntryPoint}
              onChange={(e) => setField('showEntryPoint', e.target.checked)}
            />

            <Switch
              id="terminal-show-section"
              label="Embed as Page Section"
              description="Renders the full embedded terminal container as an inline section on the homepage."
              checked={showAsSection}
              onChange={(e) => setShowAsSection(e.target.checked)}
            />
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Command size={14} /> Quick Tip:
            </p>
            <p>
              Visitors can open the modal terminal from anywhere using <kbd className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 font-mono font-bold text-[11px]">{formData.shortcut || 'Ctrl+`'}</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 font-mono font-bold text-[11px]">Ctrl+K</kbd>.
            </p>
          </div>
        </Card>
      </div>

      {/* Command Management Registry */}
      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Command Registry & Live Overrides
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Manage supported shell commands, aliases, help descriptions, and custom output overrides.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setNewCommandModalOpen(true)}
              className="text-sm w-full sm:w-auto"
            >
              Add Command
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search commands, descriptions, aliases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Commands List */}
        <div className="space-y-3">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="font-semibold text-sm">No commands match your search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-2 text-xs text-blue-500 hover:underline"
              >
                Clear search filters
              </button>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isExpanded = expandedCommandId === cmd.id;
              const hasCustomResponse = Boolean(cmd.customResponse?.trim());

              return (
                <div
                  key={cmd.id}
                  className={`border rounded-xl transition-all ${
                    cmd.enabled
                      ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                      : 'border-gray-200 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/40 opacity-75'
                  }`}
                >
                  <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Command Name & Meta */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveCommand(index, -1)}
                          disabled={index === 0}
                          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCommand(index, 1)}
                          disabled={index === formData.commands.length - 1}
                          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {cmd.name}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {cmd.category || 'General'}
                          </span>
                          {hasCustomResponse && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                              Custom Response
                            </span>
                          )}
                        </div>

                        {/* Aliases */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium text-[11px]">Aliases:</span>
                          {cmd.aliases && cmd.aliases.length > 0 ? (
                            cmd.aliases.map((a, i) => (
                              <span key={i} className="font-mono text-[10px] px-1 py-0.2 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] italic">none</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description input */}
                    <div className="flex-1 w-full md:w-auto">
                      <input
                        type="text"
                        value={cmd.description || ''}
                        onChange={(e) => handleUpdateCommand(cmd.id, 'description', e.target.value)}
                        placeholder="Command description shown in help..."
                        className="w-full px-3 py-1.5 text-sm border rounded-lg bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Actions: Enable Toggle, Expand Override, Delete */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <Switch
                        id={`cmd-toggle-${cmd.id}`}
                        checked={cmd.enabled}
                        onChange={() => handleToggleCommand(cmd.id)}
                      />

                      <button
                        type="button"
                        onClick={() => setExpandedCommandId(isExpanded ? null : cmd.id)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isExpanded
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title="Configure custom output override & aliases"
                      >
                        <span>Edit</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {cmd.category === 'Custom' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCommand(cmd.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete custom command"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Custom Output Override Drawer */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 rounded-b-xl space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Command Aliases (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={(cmd.aliases || []).join(', ')}
                            onChange={(e) => handleUpdateCommand(cmd.id, 'aliases', e.target.value)}
                            placeholder="e.g. info, who, bio"
                            className="w-full px-3 py-1.5 text-xs font-mono border rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Category Tag
                          </label>
                          <select
                            value={cmd.category || 'General'}
                            onChange={(e) => handleUpdateCommand(cmd.id, 'category', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="System">System</option>
                            <option value="Information">Information</option>
                            <option value="Portfolio">Portfolio</option>
                            <option value="Links">Links</option>
                            <option value="Custom">Custom</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Custom Output Override (Optional)
                          </label>
                          <span className="text-[11px] text-gray-400">
                            Leave blank to stream live CMS portfolio data
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={cmd.customResponse || ''}
                          onChange={(e) => handleUpdateCommand(cmd.id, 'customResponse', e.target.value)}
                          placeholder="If filled, terminal prints this static text instead of live dynamic database data..."
                          className="w-full px-3 py-2 text-xs font-mono border rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetDefaults}
        title="Reset Terminal to Factory Defaults?"
        message="This will restore all default commands, titles, shortcuts, and greetings. You will need to click 'Save' afterwards to persist to MongoDB."
        confirmText="Reset Defaults"
        type="primary"
      />

      {/* Add Custom Command Modal */}
      {newCommandModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
            onClick={() => setNewCommandModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden font-sans p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> Add Custom Terminal Command
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create a custom terminal command that outputs your custom message or easter egg.
            </p>

            <form onSubmit={handleAddCommand} className="space-y-4">
              <FormInput
                label="Command Name"
                placeholder="e.g. quote, secret, stack"
                value={newCmd.name}
                onChange={(e) => setNewCmd((prev) => ({ ...prev, name: e.target.value }))}
                required
              />

              <FormInput
                label="Help Description"
                placeholder="e.g. Display my favorite engineering quote"
                value={newCmd.description}
                onChange={(e) => setNewCmd((prev) => ({ ...prev, description: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Aliases (comma-separated)"
                  placeholder="e.g. q, phrase"
                  value={newCmd.aliases}
                  onChange={(e) => setNewCmd((prev) => ({ ...prev, aliases: e.target.value }))}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={newCmd.category}
                    onChange={(e) => setNewCmd((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 outline-none text-sm"
                  >
                    <option value="Custom">Custom</option>
                    <option value="System">System</option>
                    <option value="Information">Information</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="Links">Links</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Custom Output Response
                </label>
                <textarea
                  rows={4}
                  value={newCmd.customResponse}
                  onChange={(e) => setNewCmd((prev) => ({ ...prev, customResponse: e.target.value }))}
                  placeholder="Enter the message displayed when users run this command..."
                  className="w-full px-4 py-2.5 font-mono text-xs border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  variant="secondary"
                  onClick={() => setNewCommandModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                >
                  Add Command
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalEditor;
