'use client';

import React, { useState } from 'react';
import {
  Save, Key, Bell, Shield, Cpu, Eye, EyeOff, RefreshCw,
  User, HelpCircle, Volume2, Mic, Globe, Lock, Mail, Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface UserSettings {
  // Profile
  email: string;
  name: string;
  company: string;

  // API Keys
  geminiApiKey: string;
  samGovApiKey: string;
  elevenLabsApiKey: string;

  // Notifications
  notifications: {
    newOpportunities: boolean;
    proposalUpdates: boolean;
    deadlineReminders: boolean;
    emailDigest: boolean;
  };

  // Voice AI
  voiceSettings: {
    voiceModel: string;
    autoListen: boolean;
  };
}

const INITIAL_SETTINGS: UserSettings = {
  email: 'user@company.com',
  name: 'Operator',
  company: 'Your Company LLC',
  geminiApiKey: '••••••••••••••••',
  samGovApiKey: '••••••••••••••••',
  elevenLabsApiKey: '••••••••••••••••',
  notifications: {
    newOpportunities: true,
    proposalUpdates: true,
    deadlineReminders: true,
    emailDigest: false,
  },
  voiceSettings: {
    voiceModel: 'ElevenLabs',
    autoListen: false,
  },
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({
    gemini: false,
    samGov: false,
    elevenLabs: false,
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'notifications' | 'voice'>('profile');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'voice', label: 'Voice AI', icon: Mic },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-500" />
            Settings
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account, API connections, and preferences</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Section title="Your Profile" description="Basic account information">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {settings.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{settings.name}</h3>
                <p className="text-slate-500 text-sm">{settings.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                value={settings.name}
                onChange={(v) => setSettings({ ...settings, name: v })}
              />
              <InputField
                label="Email"
                value={settings.email}
                onChange={(v) => setSettings({ ...settings, email: v })}
                type="email"
              />
              <InputField
                label="Company Name"
                value={settings.company}
                onChange={(v) => setSettings({ ...settings, company: v })}
                className="md:col-span-2"
              />
            </div>
          </div>
        </Section>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <Section title="API Connections" description="Connect external services to power GrantHunter's features">
          <div className="space-y-6">
            {/* SAM.gov */}
            <ApiKeyField
              label="SAM.gov API Key"
              description="Required to search government contract opportunities"
              value={settings.samGovApiKey}
              show={showApiKeys.samGov}
              onToggleShow={() => setShowApiKeys({ ...showApiKeys, samGov: !showApiKeys.samGov })}
              onChange={(v) => setSettings({ ...settings, samGovApiKey: v })}
              helpLink="https://api.sam.gov"
            />

            {/* Gemini */}
            <ApiKeyField
              label="Google Gemini API Key"
              description="Powers AI analysis and proposal generation"
              value={settings.geminiApiKey}
              show={showApiKeys.gemini}
              onToggleShow={() => setShowApiKeys({ ...showApiKeys, gemini: !showApiKeys.gemini })}
              onChange={(v) => setSettings({ ...settings, geminiApiKey: v })}
              helpLink="https://aistudio.google.com/app/apikey"
            />

            {/* ElevenLabs */}
            <ApiKeyField
              label="ElevenLabs API Key"
              description="Powers the voice assistant (optional)"
              value={settings.elevenLabsApiKey}
              show={showApiKeys.elevenLabs}
              onToggleShow={() => setShowApiKeys({ ...showApiKeys, elevenLabs: !showApiKeys.elevenLabs })}
              onChange={(v) => setSettings({ ...settings, elevenLabsApiKey: v })}
              helpLink="https://elevenlabs.io"
            />

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-300">
                    <strong>Need help getting API keys?</strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click the "Get Key" links next to each field to visit the provider's website and create your API keys.
                    API keys are stored securely and never shared.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Section title="Notification Preferences" description="Choose how you want to be notified">
          <div className="space-y-4">
            <Toggle
              label="New Opportunity Alerts"
              description="Get notified when search agents find matching opportunities"
              active={settings.notifications.newOpportunities}
              onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, newOpportunities: v } })}
            />
            <Toggle
              label="Proposal Updates"
              description="Get notified when AI finishes generating proposals"
              active={settings.notifications.proposalUpdates}
              onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, proposalUpdates: v } })}
            />
            <Toggle
              label="Deadline Reminders"
              description="Get reminded about upcoming submission deadlines"
              active={settings.notifications.deadlineReminders}
              onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, deadlineReminders: v } })}
            />
            <Toggle
              label="Daily Email Digest"
              description="Receive a daily summary of opportunities and updates"
              active={settings.notifications.emailDigest}
              onChange={(v) => setSettings({ ...settings, notifications: { ...settings.notifications, emailDigest: v } })}
            />
          </div>
        </Section>
      )}

      {/* Voice AI Tab */}
      {activeTab === 'voice' && (
        <Section title="Voice Assistant Settings" description="Configure The Navigator voice AI">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Voice Provider</label>
              <select
                value={settings.voiceSettings.voiceModel}
                onChange={(e) => setSettings({ ...settings, voiceSettings: { ...settings.voiceSettings, voiceModel: e.target.value } })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="ElevenLabs">ElevenLabs (Recommended)</option>
                <option value="Gemini">Google Gemini Live</option>
              </select>
              <p className="text-xs text-slate-500">ElevenLabs provides higher quality voice responses</p>
            </div>

            <Toggle
              label="Auto-Listen Mode"
              description="Voice assistant automatically listens for follow-up questions"
              active={settings.voiceSettings.autoListen}
              onChange={(v) => setSettings({ ...settings, voiceSettings: { ...settings.voiceSettings, autoListen: v } })}
            />

            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">Test Voice</span>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold">
                Play Test Audio
              </button>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
};

// Components
const Section: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}> = ({ label, value, onChange, type = 'text', className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-semibold text-slate-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none"
    />
  </div>
);

const ApiKeyField: React.FC<{
  label: string;
  description: string;
  value: string;
  show: boolean;
  onToggleShow: () => void;
  onChange: (v: string) => void;
  helpLink: string;
}> = ({ label, description, value, show, onToggleShow, onChange, helpLink }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-semibold text-slate-300">{label}</label>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <a
        href={helpLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-400 hover:text-blue-300"
      >
        Get Key →
      </a>
    </div>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white pr-12 font-mono text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

const Toggle: React.FC<{
  label: string;
  description: string;
  active: boolean;
  onChange: (v: boolean) => void
}> = ({ label, description, active, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-colors">
    <div>
      <div className="text-sm font-semibold text-white">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{description}</div>
    </div>
    <button
      onClick={() => onChange(!active)}
      className={`w-12 h-6 rounded-full transition-colors ${active ? 'bg-blue-600' : 'bg-slate-700'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export default Settings;
