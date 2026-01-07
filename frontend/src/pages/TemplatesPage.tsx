import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon, ClipboardIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon, BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
interface Template {
  id: string;
  name: string;
  category: 'email' | 'sms' | 'push';
  content: string;
  variables: string[];
  lastUsed: string;
  usageCount: number;
}

const TemplatesPage: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  // Mock templates data
  const templates: Template[] = [
    { id: '1', name: 'Welcome Email', category: 'email', content: 'Welcome {name}! Thank you for joining our service.', variables: ['name'], lastUsed: 'Today', usageCount: 45 },
    { id: '2', name: 'Password Reset', category: 'email', content: 'Click here to reset your password: {resetLink}', variables: ['resetLink'], lastUsed: '2 days ago', usageCount: 23 },
    { id: '3', name: 'Order Confirmation', category: 'sms', content: 'Your order #{orderId} has been confirmed. Delivery: {deliveryDate}', variables: ['orderId', 'deliveryDate'], lastUsed: 'Yesterday', usageCount: 67 },
    { id: '4', name: 'Appointment Reminder', category: 'sms', content: 'Reminder: Your appointment is tomorrow at {time}.', variables: ['time'], lastUsed: '1 week ago', usageCount: 18 },
    { id: '5', name: 'System Alert', category: 'push', content: 'System maintenance scheduled for {date}.', variables: ['date'], lastUsed: '3 days ago', usageCount: 12 },
    { id: '6', name: 'Promotional Offer', category: 'email', content: 'Special offer for you: {offerDetails}. Valid until {expiryDate}', variables: ['offerDetails', 'expiryDate'], lastUsed: 'Today', usageCount: 89 },
  ];

  const filteredTemplates = templates.filter(template => {
    if (search && !template.name.toLowerCase().includes(search.toLowerCase()) && 
        !template.content.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && template.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return <EnvelopeIcon className="h-5 w-5 text-blue-500" />;
      case 'sms': return <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-500" />;
      case 'push': return <BellIcon className="h-5 w-5 text-purple-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'sms': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'push': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
      default: return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">
      <Sidebar />
      
      <div className="flex-1 min-h-screen overflow-x-hidden">
        <header className="bg-secondary border-b border-color sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Templates</h1>
                <p className="text-secondary">Manage notification templates for different categories</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Template
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter Bar */}
          <div className="px-6 py-4 border-t border-color bg-secondary">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search templates by name or content..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <DocumentTextIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Categories</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-secondary">Total Templates</div>
                  <div className="text-2xl font-bold text-primary">{templates.length}</div>
                </div>
                <DocumentTextIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Most Used Template</div>
              <div className="text-lg font-bold text-primary">Promotional Offer</div>
              <div className="text-sm text-secondary">89 uses</div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-4 border border-color">
              <div className="text-sm text-secondary">Available Variables</div>
              <div className="text-lg font-bold text-primary">12</div>
              <div className="text-sm text-secondary">custom variables</div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-card rounded-xl shadow-sm border border-color p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                      {getCategoryIcon(template.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">{template.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <ClipboardIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:text-red-800 dark:hover:text-red-400">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-secondary line-clamp-3">{template.content}</p>
                </div>
                
                <div className="mb-4">
                  <div className="text-xs text-secondary mb-1">Variables:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-secondary">
                  <div>
                    <span className="font-medium">Used {template.usageCount} times</span>
                    <div className="text-xs">Last: {template.lastUsed}</div>
                  </div>
                 // In the TemplatesPage component, update the Use Template button:
<button 
  onClick={() => navigate(`/send-notification?templateId=${template.id}`)}
  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
>
  Use Template
</button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-primary">No templates found</h3>
              <p className="text-secondary">Try adjusting your filters or create a new template</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TemplatesPage;