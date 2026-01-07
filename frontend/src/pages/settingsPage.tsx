import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { 
  CogIcon, 
  BellIcon, 
  EnvelopeIcon,
  ShieldCheckIcon,
  UserIcon,
  KeyIcon,
  BellAlertIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  desktopAlerts: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  loginNotifications: boolean;
}

interface ApiSettings {
  apiKey: string;
  webhookUrl: string;
  rateLimit: number; // requests per minute
  enabled: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  timezone: string;
  language: string;
}

const SettingsPage: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    desktopAlerts: true,
    notificationFrequency: 'immediate'
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 60,
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
    loginNotifications: true
  });
  const [newIp, setNewIp] = useState('');

  // API Settings
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    apiKey: 'sk_live_1234567890abcdef',
    webhookUrl: 'https://webhook.yoursite.com/notifications',
    rateLimit: 100,
    enabled: true
  });

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    email: 'admin@notifyhub.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
    timezone: 'America/New_York',
    language: 'English'
  });

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.notification) setNotificationSettings(settings.notification);
      if (settings.security) setSecuritySettings(settings.security);
      if (settings.api) setApiSettings(settings.api);
      if (settings.profile) setUserProfile(settings.profile);
    }
  }, []);

  const handleSaveSettings = () => {
    setSaving(true);
    setSaveMessage(null);

    // Simulate API call
    setTimeout(() => {
      const allSettings = {
        notification: notificationSettings,
        security: securitySettings,
        api: apiSettings,
        profile: userProfile
      };

      localStorage.setItem('appSettings', JSON.stringify(allSettings));
      
      setSaving(false);
      setSaveMessage({
        type: 'success',
        text: 'Settings saved successfully!'
      });

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }, 1000);
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setNotificationSettings({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        soundEnabled: true,
        desktopAlerts: true,
        notificationFrequency: 'immediate'
      });
      
      setSecuritySettings({
        twoFactorAuth: false,
        sessionTimeout: 60,
        ipWhitelist: ['192.168.1.1', '10.0.0.1'],
        loginNotifications: true
      });
      
      setApiSettings({
        apiKey: 'sk_live_1234567890abcdef',
        webhookUrl: 'https://webhook.yoursite.com/notifications',
        rateLimit: 100,
        enabled: true
      });
      
      setUserProfile({
        name: 'Admin User',
        email: 'admin@notifyhub.com',
        phone: '+1 (555) 123-4567',
        role: 'Administrator',
        timezone: 'America/New_York',
        language: 'English'
      });

      localStorage.removeItem('appSettings');
      setSaveMessage({
        type: 'success',
        text: 'Settings reset to default!'
      });
      
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const addIpAddress = () => {
    if (newIp && !securitySettings.ipWhitelist.includes(newIp)) {
      setSecuritySettings(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIp]
      }));
      setNewIp('');
    }
  };

  const removeIpAddress = (ip: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(i => i !== ip)
    }));
  };

  const generateApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    setApiSettings(prev => ({ ...prev, apiKey: newKey }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'api', label: 'API', icon: KeyIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  return (
    <div className="min-h-screen bg-primary flex">
      <Sidebar />
      
      <div className="flex-1 min-h-screen overflow-x-hidden">
        <header className="bg-secondary border-b border-color sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Settings</h1>
                <p className="text-secondary">Configure your notification service preferences</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {saveMessage.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <XCircleIcon className="h-5 w-5 mr-2" />
              )}
              {saveMessage.text}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Tabs */}
            <div className="lg:w-64">
              <div className="bg-card rounded-xl shadow-sm border border-color overflow-hidden">
                <nav className="space-y-1 p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white' 
                          : `${
                            theme === 'dark' 
                              ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Save/Reset Buttons */}
                <div className="p-4 border-t border-color">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                  <button
                    onClick={handleResetSettings}
                    className="w-full px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="bg-card rounded-xl shadow-sm border border-color p-6">
                  <h2 className="text-xl font-semibold text-primary mb-6 flex items-center">
                    <CogIcon className="h-5 w-5 mr-2" />
                    General Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Application Preferences */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">Application Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Default Timezone
                          </label>
                          <select
                            value={userProfile.timezone}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, timezone: e.target.value }))}
                            className={`w-full p-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Berlin">Berlin (CET)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Language
                          </label>
                          <select
                            value={userProfile.language}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, language: e.target.value }))}
                            className={`w-full p-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Japanese">Japanese</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Data Management */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">Data Management</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div>
                            <div className="font-medium text-primary">Export Data</div>
                            <div className="text-sm text-secondary">Download all notifications and settings</div>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                            <CloudArrowDownIcon className="h-4 w-4 mr-1" />
                            Export
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div>
                            <div className="font-medium text-primary">Import Data</div>
                            <div className="text-sm text-secondary">Upload notification data from file</div>
                          </div>
                          <button className="px-3 py-1 border border-color rounded hover:bg-hover text-primary flex items-center">
                            <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                            Import
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* System Information */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">System Information</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-secondary">App Version</div>
                            <div className="font-medium text-primary">v2.1.0</div>
                          </div>
                          <div>
                            <div className="text-secondary">Last Updated</div>
                            <div className="font-medium text-primary">January 15, 2024</div>
                          </div>
                          <div>
                            <div className="text-secondary">Database</div>
                            <div className="font-medium text-primary">PostgreSQL 14</div>
                          </div>
                          <div>
                            <div className="text-secondary">Uptime</div>
                            <div className="font-medium text-primary">99.8%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="bg-card rounded-xl shadow-sm border border-color p-6">
                  <h2 className="text-xl font-semibold text-primary mb-6 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    {/* Notification Channels */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">Notification Channels</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'email', label: 'Email Notifications', description: 'Receive notifications via email', icon: EnvelopeIcon },
                          { id: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS', icon: BellIcon },
                          { id: 'push', label: 'Push Notifications', description: 'Receive push notifications', icon: BellAlertIcon }
                        ].map((channel) => (
                          <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg border border-color">
                            <div className="flex items-center space-x-3">
                              <channel.icon className="h-5 w-5 text-primary" />
                              <div>
                                <div className="font-medium text-primary">{channel.label}</div>
                                <div className="text-sm text-secondary">{channel.description}</div>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationSettings[`${channel.id}Notifications` as keyof NotificationSettings] as boolean}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  [`${channel.id}Notifications`]: e.target.checked
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notification Behavior */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">Notification Behavior</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-primary">Enable Sound</div>
                            <div className="text-sm text-secondary">Play sound for new notifications</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.soundEnabled}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-primary">Desktop Alerts</div>
                            <div className="text-sm text-secondary">Show desktop notifications</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.desktopAlerts}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, desktopAlerts: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Notification Frequency */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">Notification Frequency</h3>
                      <div className="space-y-2">
                        {['immediate', 'hourly', 'daily'].map((frequency) => (
                          <label key={frequency} className="flex items-center p-3 rounded-lg border border-color cursor-pointer hover:bg-hover">
                            <input
                              type="radio"
                              name="frequency"
                              value={frequency}
                              checked={notificationSettings.notificationFrequency === frequency}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, notificationFrequency: e.target.value as any }))}
                              className="h-4 w-4 text-blue-600"
                            />
                            <div className="ml-3">
                              <div className="font-medium text-primary capitalize">{frequency}</div>
                              <div className="text-sm text-secondary">
                                {frequency === 'immediate' && 'Receive notifications as they happen'}
                                {frequency === 'hourly' && 'Receive notifications in hourly digest'}
                                {frequency === 'daily' && 'Receive notifications in daily digest'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="bg-card rounded-xl shadow-sm border border-color p-6">
                  <h2 className="text-xl font-semibold text-primary mb-6 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-color">
                      <div>
                        <div className="font-medium text-primary">Two-Factor Authentication</div>
                        <div className="text-sm text-secondary">Add an extra layer of security to your account</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorAuth}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Session Timeout */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="240"
                        step="5"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-secondary mt-1">
                        <span>5 min</span>
                        <span className="font-medium text-primary">{securitySettings.sessionTimeout} min</span>
                        <span>240 min</span>
                      </div>
                    </div>

                    {/* Login Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-color">
                      <div>
                        <div className="font-medium text-primary">Login Notifications</div>
                        <div className="text-sm text-secondary">Get notified about new logins to your account</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.loginNotifications}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginNotifications: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* IP Whitelist */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">IP Whitelist</h3>
                      <div className="mb-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newIp}
                            onChange={(e) => setNewIp(e.target.value)}
                            placeholder="Enter IP address (e.g., 192.168.1.1)"
                            className={`flex-1 p-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          />
                          <button
                            onClick={addIpAddress}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Add IP
                          </button>
                        </div>
                        <p className="text-sm text-secondary mt-1">Only allow access from these IP addresses</p>
                      </div>
                      
                      <div className="space-y-2">
                        {securitySettings.ipWhitelist.map((ip) => (
                          <div key={ip} className="flex items-center justify-between p-3 rounded-lg border border-color">
                            <div className="font-mono text-primary">{ip}</div>
                            <button
                              onClick={() => removeIpAddress(ip)}
                              className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Settings */}
              {activeTab === 'api' && (
                <div className="bg-card rounded-xl shadow-sm border border-color p-6">
                  <h2 className="text-xl font-semibold text-primary mb-6 flex items-center">
                    <KeyIcon className="h-5 w-5 mr-2" />
                    API Configuration
                  </h2>

                  <div className="space-y-6">
                    {/* API Status */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-color">
                      <div>
                        <div className="font-medium text-primary">API Status</div>
                        <div className="text-sm text-secondary">Enable or disable API access</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={apiSettings.enabled}
                          onChange={(e) => setApiSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={apiSettings.apiKey}
                          readOnly
                          className={`w-full p-2 pr-10 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showApiKey ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-secondary">Keep your API key secure and don't share it</p>
                        <button
                          onClick={generateApiKey}
                          className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Regenerate Key
                        </button>
                      </div>
                    </div>

                    {/* Webhook URL */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="text"
                        value={apiSettings.webhookUrl}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        className={`w-full p-2 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <p className="text-sm text-secondary mt-1">URL to send webhook notifications to</p>
                    </div>

                    {/* Rate Limit */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Rate Limit (requests per minute)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={apiSettings.rateLimit}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-secondary mt-1">
                        <span>10 RPM</span>
                        <span className="font-medium text-primary">{apiSettings.rateLimit} RPM</span>
                        <span>1000 RPM</span>
                      </div>
                    </div>

                    {/* API Documentation */}
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <h3 className="font-medium text-primary mb-2">API Documentation</h3>
                      <p className="text-sm text-secondary mb-3">
                        View our comprehensive API documentation for integration guides and examples.
                      </p>
                      <a
                        href="#"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('API documentation would open here in a real application');
                        }}
                      >
                        View API Documentation →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="bg-card rounded-xl shadow-sm border border-color p-6">
                  <h2 className="text-xl font-semibold text-primary mb-6 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Profile Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-4">
                      <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">A</span>
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2">
                          Change Avatar
                        </button>
                        <p className="text-sm text-secondary">JPG, GIF or PNG. Max size 2MB</p>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={userProfile.name}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full p-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={userProfile.email}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                            className={`w-full p-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={userProfile.phone}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                            className={`w-full p-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Role
                          </label>
                          <select
                            value={userProfile.role}
                            onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
                            className={`w-full p-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="Administrator">Administrator</option>
                            <option value="Manager">Manager</option>
                            <option value="Editor">Editor</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h3 className="font-medium text-primary mb-3">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-secondary">Account ID</div>
                          <div className="font-medium text-primary">ACC-789123</div>
                        </div>
                        <div>
                          <div className="text-secondary">Member Since</div>
                          <div className="font-medium text-primary">January 1, 2023</div>
                        </div>
                        <div>
                          <div className="text-secondary">Last Login</div>
                          <div className="font-medium text-primary">Today, 10:30 AM</div>
                        </div>
                        <div>
                          <div className="text-secondary">Account Status</div>
                          <div className="font-medium text-green-600">Active</div>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-4 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                      <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                        These actions are irreversible. Please proceed with caution.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900">
                          Deactivate Account
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;