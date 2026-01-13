import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'; // Added Sidebar import
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  CogIcon, BellIcon, UserIcon, CheckCircleIcon, 
  PaintBrushIcon, ShieldCheckIcon, ChevronRightIcon 
} from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    notificationFrequency: 'immediate'
  });

  const [userProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@notifyhub.com',
    timezone: 'America/New_York',
    language: 'English'
  });

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('appSettings', JSON.stringify({ notificationSettings, userProfile }));
      setSaving(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    }, 800);
  };

  const tabs = [
   
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      {/* 1. Added Sidebar here for navigation back to other pages */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-color flex-shrink-0 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb Navigation Style */}
                <div className="flex items-center text-sm text-secondary mb-1">
                
                  <ChevronRightIcon className="h-3 w-3 mx-2" />
                  <span className="text-blue-700 font-medium">Settings</span>
                </div>
                
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-xl flex items-center animate-in fade-in slide-in-from-top-4 duration-300 ${
              saveMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {saveMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tab Navigation */}
            <div className="lg:col-span-3">
              <nav className="space-y-2 lg:sticky lg:top-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                      activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-secondary hover:bg-hover'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                
                <div className="pt-4 mt-6 border-t border-color">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-all"
                  >
                    {saving ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : 'Save Changes'}
                  </button>
                </div>
              </nav>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-9 space-y-6 pb-12">
              

              {activeTab === 'notifications' && (
                <section className="bg-card border border-color rounded-2xl p-8 shadow-sm animate-in fade-in duration-500">
                  <h3 className="text-lg font-bold text-primary mb-6 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-blue-800" /> Communication Preferences
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Alerts', sub: 'Receive weekly summaries' },
                      { key: 'pushNotifications', label: 'Desktop Push', sub: 'Real-time browser notifications' },
                      { key: 'soundEnabled', label: 'Auditory Feedback', sub: 'Play sounds on new alerts' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-color hover:border-blue-500/50 transition-colors">
                        <div>
                          <p className="font-semibold text-primary">{item.label}</p>
                          <p className="text-xs text-secondary">{item.sub}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={(notificationSettings as any)[item.key]} 
                            onChange={(e) => setNotificationSettings(p => ({...p, [item.key]: e.target.checked}))} 
                          />
                          <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === 'profile' && (
                <section className="bg-card border border-color rounded-2xl p-8 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-800 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary">{userProfile.name}</h4>
                      <p className="text-secondary text-sm">{userProfile.email}</p>
                      <button className="mt-2 text-sm text-blue-800 font-semibold hover:underline">Change avatar</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">Display Name</label>
                      <input type="text" value={userProfile.name} className="w-full bg-primary border border-color rounded-xl p-3 text-primary" readOnly />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">Security Level</label>
                      <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm font-medium flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-2" /> Verified Administrator
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;