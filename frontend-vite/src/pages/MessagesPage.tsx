import React from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';

const MessagesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary flex">
      <Sidebar />
      
      <div className="flex-1 min-h-screen overflow-x-hidden">
        <header className="bg-secondary border-b border-color sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary">Messages</h1>
                <p className="text-secondary">Customer messages and conversations</p>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="bg-card rounded-xl shadow-sm border border-color p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-primary mb-2">Messages Feature</h2>
            <p className="text-secondary mb-6">This feature is currently under development.</p>
            <div className="max-w-md mx-auto text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-primary mb-2">Planned Features:</h3>
              <ul className="text-secondary space-y-1">
                <li>• Real-time chat with customers</li>
                <li>• Message history and search</li>
                <li>• Automated responses</li>
                <li>• Conversation tagging</li>
                <li>• Team collaboration</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;