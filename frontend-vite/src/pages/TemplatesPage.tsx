import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ClipboardIcon, 
  EnvelopeIcon, 
  ChatBubbleBottomCenterTextIcon, 
  BellIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// --- Types matching your NestJS Backend ---
interface Template {
  id: string ;
  name: string;
  type: string; // EMAIL, SMS, PUSH
  content: string; // For SMS/PUSH
  subject?: string; // For email only
  htmlBody?: string; // For email only
  textBody?: string; // For email only
  variables?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const TemplatesPage: React.FC = () => {
  const { theme } = useTheme();
  // Ensure your AuthContext defines 'token' in its interface!
  const { token } = useAuth(); 
  
  // --- Real Data State ---
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- UI State ---
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- Form State ---
  // Explicitly typing name as string to avoid global 'window.name' conflicts
  const [formData, setFormData] = useState({
    id: '',
    name: '' as string,
    type: 'EMAIL',
    content: ''
  });

  // 1. FETCH TEMPLATES FROM BACKEND
  const fetchTemplates = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError('Could not load templates.?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [token]);

  // 2. CREATE OR UPDATE TEMPLATE
  const handleSubmit = async () => {
    if (!formData.name || !formData.content) return alert('Name and Content are required');

    try {
      const url = isEditMode 
        ? `http://localhost:3001/templates/${formData.id}`
        : 'http://localhost:3001/templates';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          content: formData.content
        })
      });

      if (!response.ok) throw new Error('Operation failed');

      setShowModal(false);
      fetchTemplates(); 
      alert(isEditMode ? 'Template Updated!' : 'Template Created!');
    } catch (err) {
      alert('Error saving template.');
      console.error(err);
    }
  };

  // 3. DELETE TEMPLATE
  const handleDelete = async (id: number) => {
    if(!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`http://localhost:3001/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const openModal = (template?: Template) => {
    if (template) {
      setFormData({
        id: template.id,
        name: template.name,
        type: template.type,
        content: template.content
      });
      setIsEditMode(true);
    } else {
      setFormData({ id: 0, name: '', type: 'EMAIL', content: '' });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const insertVariable = (varName: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + ` {{${varName}}} `
    }));
  };

  const getIcon = (type: string) => {
    if(type === 'SMS') return <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-500"/>;
    if(type === 'PUSH') return <BellIcon className="h-5 w-5 text-purple-500"/>;
    return <EnvelopeIcon className="h-5 w-5 text-blue-500"/>;
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex overflow-hidden bg-primary transition-colors duration-200">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-card border-b border-color z-20">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Templates</h1>
              <p className="text-secondary text-sm"></p>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeSwitcher />
              <button 
                onClick={() => openModal()}
                className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-800 flex items-center shadow-lg transition-all"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Template
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 relative max-w-md">
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-color bg-card text-primary outline-none focus:ring-2 focus:ring-blue-500"
            />
            <DocumentTextIcon className="absolute left-3 top-3.5 h-5 w-5 text-secondary" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-900 rounded-lg border border-red-200 mb-6">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-card rounded-xl border border-color p-5 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getIcon(template.type)}
                      </div>
                      <div>
                        {/* Fix: Accessing template.name clearly */}
                        <h3 className="font-bold text-primary">{template.name}</h3>
                        <span className="text-xs font-mono text-secondary bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {template.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(template)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(template.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mb-3 h-24 overflow-hidden relative">
                    <p className="text-secondary font-mono text-xs leading-relaxed">
                      {template.content}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-secondary mt-2">
                     <span>ID: #{template.id}</span>
                     <button 
                       onClick={() => navigator.clipboard.writeText(template.content)}
                       className="flex items-center hover:text-primary"
                     >
                       <ClipboardIcon className="h-3 w-3 mr-1" /> Copy
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="px-6 py-4 border-b border-color flex justify-between items-center bg-gray-500 dark:bg-blue-800/50">
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {isEditMode ? 'Edit Template' : 'Create New Template'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-400 rounded-full">
                <XMarkIcon className="h-6 w-6 text-secondary" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Editor */}
              <div className="flex-1 p-6 overflow-y-auto border-r border-color">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">NAME</label>
                      <input 
                        className="w-full bg-card border border-color rounded-lg px-4 py-1 text-primary focus:ring-2 focus:ring-blue-300 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Template Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">CHANNEL</label>
                      <select 
                        className="w-full bg-card border border-color rounded-lg px-4 py-1 text-primary focus:ring-2 focus:ring-blue-300 outline-none"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="PUSH">Push Notification</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">QUICK VARIABLES</label>
                    <div className="flex gap-2 flex-wrap">
                      {/* Fix: Renamed variable in map to 'vKey' to avoid 'name' conflict */}
                      {['name', 'email', 'company', 'date'].map(vKey => (
                        <button 
                          key={vKey}
                          onClick={() => insertVariable(vKey)}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full hover:scale-105 transition-transform"
                        >
                          {`{{${vKey}}}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">CONTENT</label>
                    <textarea 
                      className="w-full h-64 bg-gray-50 dark:bg-gray-500 border border-color rounded-lg p-4 font-mono text-sm text-primary focus:ring-2 focus:ring-blue-300 outline-none resize-none"
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      placeholder="Message content..."
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="hidden md:flex flex-col w-1/3 bg-gray-100 dark:bg-black/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-secondary uppercase">Live Preview</h3>
                  <EyeIcon className="h-4 w-4 text-secondary" />
                </div>
                
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-color overflow-hidden flex flex-col">
                  <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b border-color flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto">
                    {formData.type === 'EMAIL' ? (
                      <div className="space-y-4">
                         <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                         <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                         <div className="text-sm text-primary whitespace-pre-wrap">
                           {formData.content || "Your email content will appear here..."}
                         </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-xl max-w-[90%]">
                        <p className="text-sm text-primary whitespace-pre-wrap">{formData.content || "Message preview..."}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-color bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-14">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg font-medium shadow-md transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-transform active:scale-95"
              >
                {isEditMode ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;