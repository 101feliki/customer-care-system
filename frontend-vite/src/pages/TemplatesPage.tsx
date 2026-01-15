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
  id: string; // Changed to string for UUID
  name: string;
  type: string; 
  content?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  variables?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const TemplatesPage: React.FC = () => {
  const { theme } = useTheme();
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
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'EMAIL' as 'EMAIL' | 'SMS' | 'PUSH',
    content: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    variables: ['name', 'email', 'company', 'date'] as string[],
  });

  // 1. FETCH TEMPLATES FROM BACKEND
  const fetchTemplates = async () => {
    if (!token) {
      console.log('No token available');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching templates with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:3001/templates', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch templates: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Process the response
      let templatesArray: Template[] = [];
      if (Array.isArray(data)) {
        templatesArray = data;
      } else if (data && Array.isArray(data.data)) {
        templatesArray = data.data;
      } else if (data && Array.isArray(data.templates)) {
        templatesArray = data.templates;
      }
      
      console.log('Processed templates:', templatesArray);
      setTemplates(templatesArray);
      setError('');
      
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(`Could not load templates: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTemplates();
    }
  }, [token]);

  // 2. CREATE OR UPDATE TEMPLATE
  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Name is required');
      return;
    }

    // Validate based on template type
    if (formData.type === 'EMAIL' && !formData.htmlBody && !formData.content) {
      alert('Content is required for email templates');
      return;
    }
    
    if ((formData.type === 'SMS' || formData.type === 'PUSH') && !formData.content) {
      alert('Content is required for SMS and Push templates');
      return;
    }

    try {
      const url = isEditMode 
        ? `http://localhost:3001/templates/${formData.id}`
        : 'http://localhost:3001/templates';
      
      const method = isEditMode ? 'PUT' : 'POST';

      // Prepare request based on template type
      const requestBody: any = {
        name: formData.name,
        type: formData.type,
      };

      // Add fields based on template type
      if (formData.type === 'EMAIL') {
        requestBody.subject = formData.subject || formData.name;
        requestBody.htmlBody = formData.htmlBody || formData.content;
        requestBody.textBody = formData.textBody || formData.htmlBody || formData.content;
        requestBody.variables = formData.variables;
      } else {
        // For SMS and PUSH
        requestBody.content = formData.content;
        requestBody.variables = formData.variables;
      }

      console.log('Sending request:', { url, method, body: requestBody });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('Response:', response.status, responseText);

      if (!response.ok) {
        throw new Error(`Failed: ${response.status} ${responseText}`);
      }

      setShowModal(false);
      fetchTemplates(); 
      alert(isEditMode ? 'Template Updated!' : 'Template Created!');
    } catch (err) {
      console.error('Error saving template:', err);
      alert(`Error saving template: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // 3. DELETE TEMPLATE
  const handleDelete = async (id: string) => {
    if(!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`http://localhost:3001/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        alert('Template deleted successfully');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to delete: ${errorText}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete template');
    }
  };

  const openModal = (template?: Template) => {
    if (template) {
      setFormData({
        id: template.id,
        name: template.name,
        type: (template.type as 'EMAIL' | 'SMS' | 'PUSH') || 'EMAIL',
        content: template.content || template.htmlBody || '',
        subject: template.subject || '',
        htmlBody: template.htmlBody || '',
        textBody: template.textBody || '',
        variables: template.variables || ['name', 'email', 'company', 'date'],
      });
      setIsEditMode(true);
    } else {
      setFormData({ 
        id: '', 
        name: '', 
        type: 'EMAIL',
        content: '',
        subject: '',
        htmlBody: '',
        textBody: '',
        variables: ['name', 'email', 'company', 'date'],
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const insertVariable = (varName: string) => {
    const variable = `{{${varName}}}`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + ` ${variable} `,
      htmlBody: prev.htmlBody + ` ${variable} `,
      textBody: prev.textBody + ` ${variable} `,
    }));
  };

  const getIcon = (type: string) => {
    if(type === 'SMS') return <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-500"/>;
    if(type === 'PUSH') return <BellIcon className="h-5 w-5 text-purple-500"/>;
    return <EnvelopeIcon className="h-5 w-5 text-blue-500"/>;
  };

  const getTemplateContent = (template: Template) => {
    if (template.type === 'EMAIL') {
      return template.subject || template.htmlBody?.substring(0, 100) || 'No content';
    }
    return template.content?.substring(0, 100) || 'No content';
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
              <p className="text-secondary text-sm">Create and manage notification templates</p>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeSwitcher />
              <button 
                onClick={() => openModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-lg transition-all"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-secondary">Loading templates...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 mb-6">
              {error}
            </div>
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
                      {getTemplateContent(template)}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-secondary mt-2">
                     <span>ID: #{template.id.substring(0, 8)}...</span>
                     <button 
                       onClick={() => navigator.clipboard.writeText(
                         template.type === 'EMAIL' 
                           ? template.htmlBody || template.content || '' 
                           : template.content || ''
                       )}
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
            
            <div className="px-6 py-4 border-b border-color flex justify-between items-center bg-blue-600 dark:bg-blue-800 text-white">
              <div>
                <h2 className="text-xl font-bold">
                  {isEditMode ? 'Edit Template' : 'Create New Template'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-blue-700 rounded-full">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Editor */}
              <div className="flex-1 p-6 overflow-y-auto border-r border-color">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">NAME *</label>
                      <input 
                        className="w-full bg-card border border-color rounded-lg px-4 py-2 text-primary focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Template Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">CHANNEL *</label>
                      <select 
                        className="w-full bg-card border border-color rounded-lg px-4 py-2 text-primary focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as 'EMAIL' | 'SMS' | 'PUSH'})}
                      >
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="PUSH">Push Notification</option>
                      </select>
                    </div>
                  </div>

                  {formData.type === 'EMAIL' && (
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">SUBJECT</label>
                      <input 
                        className="w-full bg-card border border-color rounded-lg px-4 py-2 text-primary focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        placeholder="Email Subject"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">QUICK VARIABLES</label>
                    <div className="flex gap-2 flex-wrap">
                      {['name', 'email', 'company', 'date', 'amount', 'invoice_number'].map(vKey => (
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
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      CONTENT {formData.type !== 'EMAIL' && '*'}
                    </label>
                    <textarea 
                      className="w-full h-64 bg-gray-50 dark:bg-gray-900 border border-color rounded-lg p-4 font-mono text-sm text-primary focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      value={formData.type === 'EMAIL' ? formData.htmlBody : formData.content}
                      onChange={e => {
                        if (formData.type === 'EMAIL') {
                          setFormData({...formData, htmlBody: e.target.value});
                        } else {
                          setFormData({...formData, content: e.target.value});
                        }
                      }}
                      placeholder={formData.type === 'EMAIL' ? "HTML email content..." : "Message content..."}
                    />
                  </div>

                  {formData.type === 'EMAIL' && (
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">TEXT VERSION (Optional)</label>
                      <textarea 
                        className="w-full h-32 bg-gray-50 dark:bg-gray-900 border border-color rounded-lg p-4 font-mono text-sm text-primary focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        value={formData.textBody}
                        onChange={e => setFormData({...formData, textBody: e.target.value})}
                        placeholder="Plain text version for email clients..."
                      />
                    </div>
                  )}
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
                         <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                         <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                         <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                         <div className="text-sm text-primary whitespace-pre-wrap">
                           {formData.htmlBody || formData.content || "Your email content will appear here..."}
                         </div>
                      </div>
                    ) : formData.type === 'SMS' ? (
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl max-w-[80%] ml-auto">
                        <p className="text-sm text-primary whitespace-pre-wrap">{formData.content || "SMS message preview..."}</p>
                      </div>
                    ) : (
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                        <div className="flex items-start space-x-2">
                          <BellIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-primary">Notification</p>
                            <p className="text-sm text-primary whitespace-pre-wrap mt-1">{formData.content || "Push notification preview..."}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-color bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!formData.name || (formData.type !== 'EMAIL' && !formData.content)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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