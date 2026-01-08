import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { 
  CogIcon, 
  BellIcon, 
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  notificationFrequency: 'immediate' | 'daily';
}

interface UserProfile {
  name: string;
  email: string;
  timezone: string;
  language: string;
}

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationFrequency: 'immediate'
  });

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    email: 'admin@notifyhub.com',
    timezone: 'America/New_York',
    language: 'English'
  });

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.notification) setNotificationSettings(settings.notification);
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
    }, 500);
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setNotificationSettings({
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        notificationFrequency: 'immediate'
      });
      
      setUserProfile({
        name: 'Admin User',
        email: 'admin@notifyhub.com',
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

  const tabs = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />
      
      {/* Main content area - Fixed structure for scrolling */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Fixed header */}
        <header className="bg-card border-b border-color flex-shrink-0 sticky top-0 z-20">
          <div className="px-6 py-4 md:px-6 md:py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-primary">Settings</h1>
                <p className="text-secondary">Configure your application preferences</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-6 max-w-4xl mx-auto">
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
                    {/* Theme Settings */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">Appearance</h3>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-color">
                        <div>
                          <div className="font-medium text-primary">Theme</div>
                          <div className="text-sm text-secondary">Current: {theme === 'light' ? 'Light' : 'Dark'} mode</div>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Switch to {theme === 'light' ? 'Dark' : 'Light'}
                        </button>
                      </div>
                    </div>

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
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* System Information */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">System Information</h3>
                      <div className="p-4 rounded-lg bg-whitebg-gray-800 border border-gray-200border-gray-700">
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
                        <div className="flex items-center justify-between p-3 rounded-lg border border-color">
                          <div className="flex items-center space-x-3">
                            <div className="h-5 w-5 text-primary">📧</div>
                            <div>
                              <div className="font-medium text-primary">Email Notifications</div>
                              <div className="text-sm text-secondary">Receive notifications via email</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                emailNotifications: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg border border-color">
                          <div className="flex items-center space-x-3">
                            <div className="h-5 w-5 text-primary">📱</div>
                            <div>
                              <div className="font-medium text-primary">Push Notifications</div>
                              <div className="text-sm text-secondary">Receive push notifications</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.pushNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({
                                ...prev,
                                pushNotifications: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
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
                      </div>
                    </div>

                    {/* Notification Frequency */}
                    <div>
                      <h3 className="text-lg font-medium text-primary mb-4">Notification Frequency</h3>
                      <div className="space-y-2">
                        {['immediate', 'daily'].map((frequency) => (
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
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="p-4 rounded-lg bg-whitebg-gray-800 border border-gray-200border-gray-700">
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
                        <button 
                          onClick={() => window.confirm('Deactivate account?')}
                          className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900"
                        >
                          Deactivate Account
                        </button>
                        <button 
                          onClick={() => window.confirm('Delete account? This cannot be undone!')}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
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