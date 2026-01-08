import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ClipboardIcon, 
  EnvelopeIcon, 
  ChatBubbleBottomCenterTextIcon, 
  BellIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  ArrowUpTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Template creation functions
const formatEmailDate = () => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();
  
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  return `${dayName}, ${monthName} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
};

const cleanProductName = (product: string) => {
  if (!product) return "Insurance";
  
  let cleaned = product
      .replace(/Personl Accident/gi, "Personal Accident")
      .replace(/Evacuation\s*&\s*Repatriation/gi, "Evacuation and Repatriation")
      .trim();
  
  if (cleaned.toLowerCase().includes('medical') && !cleaned.toLowerCase().includes('cover')) {
      cleaned = cleaned + ' Cover';
  }
  
  return cleaned;
};

interface Template {
  id: string;
  name: string;
  category: 'email' | 'sms' | 'push';
  content: string;
  variables: string[];
  lastUsed: string;
  usageCount: number;
  createdDate: string;
  isActive: boolean;
}

interface TemplateFormData {
  id?: string;
  name: string;
  category: 'email' | 'sms' | 'push';
  content: string;
  variables: string[];
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

interface CSVRecipient {
  name: string;
  email: string;
  phone: string;
}

const TemplatesPage: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // State for modals
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [templateToSend, setTemplateToSend] = useState<Template | null>(null);
  
  // State for template editing
  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: '',
    category: 'email',
    content: '',
    variables: []
  });
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for sending
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendOption, setSendOption] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [sendingProgress, setSendingProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  
  // State for CSV upload
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVRecipient[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const [templates, setTemplates] = useState<Template[]>([
    { 
      id: '1', 
      name: 'Welcome Email', 
      category: 'email', 
      content: 'Dear {name}, Welcome to our service! We\'re excited to have you on board. Your account has been created successfully.', 
      variables: ['name', 'email'], 
      lastUsed: 'Today', 
      usageCount: 45,
      createdDate: '2024-01-15',
      isActive: true
    },
    { 
      id: '6', 
      name: 'Birdview Insurance Follow-up', 
      category: 'email', 
      content: `Dear {name},

Thank you for visiting the Birdview Insurance portal and showing interest in our {product} insurance solutions.

We noticed that you started the purchase process but were unable to complete it. We understand that sometimes challenges may arise.

Kindly let us know if you encountered any difficulty or if there's any way our team can assist you to complete your purchase.

Our team is ready to support you at +254 111 056 610.

Best regards,
Birdview Insurance Team`, 
      variables: ['name', 'product', 'phone'], 
      lastUsed: 'Today', 
      usageCount: 89,
      createdDate: '2024-01-20',
      isActive: true
    },
  ]);

  // Mock recipients data
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+254 712 345 678', status: 'active' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+254 723 456 789', status: 'active' },
    { id: '3', name: 'Mike Wilson', email: 'mike@example.com', phone: '+254 734 567 890', status: 'active' },
    { id: '4', name: 'Emma Davis', email: 'emma@example.com', phone: '+254 745 678 901', status: 'active' },
    { id: '5', name: 'David Brown', email: 'david@example.com', phone: '+254 756 789 012', status: 'active' },
  ]);

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

  const activeRecipients = recipients.filter(r => r.status === 'active');

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
      case 'email': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'sms': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'push': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  };

  // Template CRUD operations
  const handleEditTemplate = (template: Template) => {
    setTemplateForm({
      id: template.id,
      name: template.name,
      category: template.category,
      content: template.content,
      variables: template.variables
    });
    setIsEditMode(true);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplateToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      setTemplates(templates.filter(t => t.id !== templateToDelete));
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    if (isEditMode && templateForm.id) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === templateForm.id 
          ? { 
              ...t, 
              name: templateForm.name,
              category: templateForm.category,
              content: templateForm.content,
              variables: templateForm.variables,
              lastUsed: 'Just now'
            }
          : t
      ));
    } else {
      // Create new template
      const newTemplate: Template = {
        id: String(templates.length + 1),
        name: templateForm.name,
        category: templateForm.category,
        content: templateForm.content,
        variables: templateForm.variables,
        lastUsed: 'Never',
        usageCount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        isActive: true
      };
      setTemplates([...templates, newTemplate]);
    }
    
    resetTemplateForm();
    setShowTemplateModal(false);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: 'email',
      content: '',
      variables: []
    });
    setIsEditMode(false);
  };

  // Template sending functions
  const handleUseTemplate = (template: Template) => {
    setTemplateToSend(template);
    setSelectedRecipients([]);
    setSendOption('immediate');
    setScheduledDate('');
    setShowSendModal(true);
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipients.length === activeRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(activeRecipients.map(r => r.id));
    }
  };

  const handleToggleRecipient = (id: string) => {
    setSelectedRecipients(prev => 
      prev.includes(id) 
        ? prev.filter(recipientId => recipientId !== id)
        : [...prev, id]
    );
  };

  const simulateSending = () => {
    setIsSending(true);
    setSendingProgress(0);
    
    const interval = setInterval(() => {
      setSendingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSending(false);
            setShowSendModal(false);
            
            // Update template usage
            if (templateToSend) {
              setTemplates(templates.map(t => 
                t.id === templateToSend.id 
                  ? { 
                      ...t, 
                      usageCount: t.usageCount + selectedRecipients.length,
                      lastUsed: 'Just now'
                    }
                  : t
              ));
            }
            
            alert(`✅ Successfully sent template to ${selectedRecipients.length} recipients!`);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleSendTemplate = () => {
    if (selectedRecipients.length === 0) {
      alert('⚠️ Please select at least one recipient');
      return;
    }
    
    if (sendOption === 'scheduled' && !scheduledDate) {
      alert('⚠️ Please select a date and time for scheduling');
      return;
    }
    
    simulateSending();
  };

  // Extract variables from content
  const extractVariables = (content: string) => {
    const variablePattern = /\{(\w+)\}/g;
    const matches = content.match(variablePattern);
    if (!matches) return [];
    
    const uniqueVariables: string[] = [];
    const seen = new Set<string>();
    
    matches.forEach(match => {
        const variable = match.slice(1, -1);
        if (!seen.has(variable)) {
            seen.add(variable);
            uniqueVariables.push(variable);
        }
    });
    
    return uniqueVariables;
  };

  const handleContentChange = (content: string) => {
    const variables = extractVariables(content);
    setTemplateForm({ ...templateForm, content, variables });
  };

  // Generate preview content
  const generatePreview = (template: Template) => {
    let preview = template.content;
    template.variables.forEach(variable => {
      preview = preview.replace(`{${variable}}`, `[${variable}]`);
    });
    return preview;
  };

  // CSV Upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    
    // Preview CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file must have at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Check for required columns
      const hasName = headers.includes('name');
      const hasEmail = headers.includes('email');
      const hasPhone = headers.includes('phone') || headers.includes('phonenumber') || headers.includes('mobile');
      
      if (!hasName || (!hasEmail && !hasPhone)) {
        alert('CSV must contain "name" column and either "email" or "phone" column');
        return;
      }

      const previewData: CSVRecipient[] = [];
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const recipient: CSVRecipient = {
          name: values[headers.indexOf('name')] || '',
          email: hasEmail ? values[headers.indexOf('email')] || '' : '',
          phone: hasPhone ? 
            (values[headers.indexOf('phone')] || values[headers.indexOf('phonenumber')] || values[headers.indexOf('mobile')] || '') 
            : ''
        };
        if (recipient.name) previewData.push(recipient);
      }
      
      setCsvPreview(previewData);
    };
    reader.readAsText(file);
  };

  const handleUploadRecipients = () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      setTimeout(() => {
        clearInterval(progressInterval);
        
        // Process CSV data
        const newRecipients: Recipient[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= headers.length) {
            const name = values[headers.indexOf('name')] || '';
            const email = headers.includes('email') ? values[headers.indexOf('email')] || '' : '';
            const phone = headers.includes('phone') ? values[headers.indexOf('phone')] || '' : 
                        headers.includes('phonenumber') ? values[headers.indexOf('phonenumber')] || '' :
                        headers.includes('mobile') ? values[headers.indexOf('mobile')] || '' : '';
            
            if (name && (email || phone)) {
              newRecipients.push({
                id: String(recipients.length + newRecipients.length + 1),
                name,
                email,
                phone,
                status: 'active'
              });
            }
          }
        }

        // Update recipients
        setRecipients(prev => [...prev, ...newRecipients]);
        setUploadProgress(100);

        setTimeout(() => {
          setIsUploading(false);
          setCsvFile(null);
          setCsvPreview([]);
          setShowUploadModal(false);
          alert(`✅ Successfully uploaded ${newRecipients.length} recipients!`);
        }, 500);

      }, 2000);
    };
    reader.readAsText(csvFile);
  };

  const resetUpload = () => {
    setCsvFile(null);
    setCsvPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-primary">
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-secondary border-b border-color flex-shrink-0 sticky top-0 z-20">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">Templates</h1>
                <p className="text-secondary">Create and manage notification templates</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <ThemeSwitcher />
                
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  Upload CSV
                </button>
                
                <button 
                  onClick={() => {
                    resetTemplateForm();
                    setShowTemplateModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Template
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter Bar */}
          <div className="px-6 py-3 border-t border-color bg-card">
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
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl shadow-sm p-6 border border-color">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-secondary">Total Templates</div>
                  <div className="text-3xl font-bold text-primary">{templates.length}</div>
                </div>
                <DocumentTextIcon className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-6 border border-color">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-secondary">Active Recipients</div>
                  <div className="text-3xl font-bold text-primary">{activeRecipients.length}</div>
                  <div className="text-sm text-secondary">available to send to</div>
                </div>
                <UserGroupIcon className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-sm p-6 border border-color">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-secondary">Total Sent</div>
                  <div className="text-3xl font-bold text-primary">
                    {templates.reduce((acc, t) => acc + t.usageCount, 0)}
                  </div>
                  <div className="text-sm text-secondary">notifications sent</div>
                </div>
                <PaperAirplaneIcon className="h-10 w-10 text-purple-500" />
              </div>
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
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditTemplate(template)}
                      className={`p-2 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-blue-900/30' : 'hover:bg-blue-50'
                      }`}
                      title="Edit template"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(template.content);
                        alert('Template content copied to clipboard!');
                      }}
                      className={`p-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                      title="Copy content"
                    >
                      <ClipboardIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(template.id)}
                      className={`p-2 text-red-600 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors ${
                        theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
                      }`}
                      title="Delete template"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-secondary line-clamp-3">
                    {generatePreview(template)}
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="text-xs text-secondary mb-2">Variables:</div>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, index) => (
                      <span key={index} className={`px-3 py-1 text-xs rounded-lg font-medium ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-color">
                  <div>
                    <div className="font-medium text-primary">Used {template.usageCount} times</div>
                    <div className="text-xs text-secondary">Last: {template.lastUsed}</div>
                  </div>
                  <button 
                    onClick={() => handleUseTemplate(template)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 text-5xl mb-4">📄</div>
              <h3 className="text-xl font-medium text-primary mb-2">No templates found</h3>
              <p className="text-secondary mb-6">Try adjusting your filters or create a new template</p>
              <button 
                onClick={() => {
                  resetTemplateForm();
                  setShowTemplateModal(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Template
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Template Creation/Edit Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-color flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">
                  {isEditMode ? 'Edit Template' : 'Create New Template'}
                </h2>
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    resetTemplateForm();
                  }}
                  className="text-secondary hover:text-primary"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                      placeholder="e.g., Welcome Email"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Category *
                    </label>
                    <select
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm({...templateForm, category: e.target.value as 'email' | 'sms' | 'push'})}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Template Content *
                  </label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Enter your template content. Use {variable} for dynamic content."
                    rows={8}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none`}
                  />
                  <p className="text-xs text-secondary mt-2">
                    Use curly braces for variables: {"{name}"}, {"{email}"}, {"{phone}"}, etc.
                  </p>
                </div>
                
                {templateForm.variables.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Detected Variables
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {templateForm.variables.map((variable, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-lg font-medium">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Quick Variables
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['name', 'email', 'phone', 'date', 'product', 'amount', 'orderId', 'company'].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => {
                          const newContent = templateForm.content + ` {${variable}}`;
                          handleContentChange(newContent);
                        }}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {`{${variable}}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-color flex-shrink-0 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  resetTemplateForm();
                }}
                className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateForm.name || !templateForm.content}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isEditMode ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-red-900' : 'bg-red-100'
              }`}>
                <TrashIcon className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-600'
                }`} />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Delete Template</h3>
              <p className="text-secondary text-center mb-6">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTemplateToDelete(null);
                  }}
                  className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Template Modal */}
      {showSendModal && templateToSend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-color flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-primary">Send Template</h2>
                  <p className="text-sm text-secondary">{templateToSend.name}</p>
                </div>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-secondary hover:text-primary"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {isSending ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-500 animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-primary mb-2">Sending in Progress</h3>
                  <p className="text-secondary mb-6">
                    Sending to {selectedRecipients.length} recipients...
                  </p>
                  <div className={`w-full rounded-full h-3 mb-2 overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${sendingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-secondary">{sendingProgress}% complete</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Send Options */}
                  <div>
                    <h3 className="text-lg font-medium text-primary mb-4">Send Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                        sendOption === 'immediate' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-color hover:bg-hover'
                      }`}>
                        <input
                          type="radio"
                          name="sendOption"
                          value="immediate"
                          checked={sendOption === 'immediate'}
                          onChange={(e) => setSendOption(e.target.value as 'immediate' | 'scheduled')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-primary">Send Immediately</div>
                          <div className="text-sm text-secondary">Send now to selected recipients</div>
                        </div>
                      </label>
                      
                      <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                        sendOption === 'scheduled' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-color hover:bg-hover'
                      }`}>
                        <input
                          type="radio"
                          name="sendOption"
                          value="scheduled"
                          checked={sendOption === 'scheduled'}
                          onChange={(e) => setSendOption(e.target.value as 'immediate' | 'scheduled')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-primary">Schedule Send</div>
                          <div className="text-sm text-secondary">Schedule for a later time</div>
                        </div>
                      </label>
                    </div>
                    
                    {sendOption === 'scheduled' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-primary mb-2">
                          Schedule Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Recipients Selection */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-primary">Select Recipients</h3>
                      <button
                        onClick={handleSelectAllRecipients}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                      >
                        {selectedRecipients.length === activeRecipients.length 
                          ? 'Deselect All' 
                          : 'Select All Active Recipients'}
                      </button>
                    </div>
                    
                    <div className={`rounded-lg p-4 max-h-64 overflow-y-auto ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      {activeRecipients.length === 0 ? (
                        <div className="text-center py-8 text-secondary">
                          <UserGroupIcon className={`h-12 w-12 mx-auto mb-3 ${
                            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                          }`} />
                          <p>No active recipients found.</p>
                          <p className="text-sm">Upload recipients using the CSV upload button above.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeRecipients.map((recipient) => (
                            <label key={recipient.id} className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700' 
                                : 'hover:bg-gray-100'
                            }`}>
                              <input
                                type="checkbox"
                                checked={selectedRecipients.includes(recipient.id)}
                                onChange={() => handleToggleRecipient(recipient.id)}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <div className="font-medium text-primary">{recipient.name}</div>
                                <div className="text-sm text-secondary">
                                  {templateToSend.category === 'email' 
                                    ? recipient.email 
                                    : recipient.phone}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-secondary">
                        Selected: <span className="font-semibold text-primary">{selectedRecipients.length}</span> of <span className="font-semibold text-primary">{activeRecipients.length}</span> active recipients
                      </p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-sm text-green-600 hover:text-green-800 dark:hover:text-green-400"
                      >
                        Upload More Recipients
                      </button>
                    </div>
                  </div>
                  
                  {/* Template Preview */}
                  <div>
                    <h3 className="text-lg font-medium text-primary mb-4">Template Preview</h3>
                    <div className={`rounded-lg p-4 border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-sm text-secondary whitespace-pre-wrap font-mono">
                        {generatePreview(templateToSend)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {!isSending && (
              <div className="px-6 py-4 border-t border-color flex-shrink-0 flex justify-between items-center">
                <div>
                  <p className="text-sm text-secondary">
                    <span className="font-semibold text-primary">{selectedRecipients.length}</span> recipients selected
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendTemplate}
                    disabled={selectedRecipients.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    {sendOption === 'immediate' ? 'Send Now' : 'Schedule Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-color flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Upload Recipients CSV</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-secondary hover:text-primary"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {isUploading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-500 animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-primary mb-2">Uploading Recipients</h3>
                  <p className="text-secondary mb-6">
                    Processing CSV file...
                  </p>
                  <div className={`w-full rounded-full h-3 mb-2 overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-secondary">{uploadProgress}% complete</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      csvFile 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                        : 'border-color hover:border-blue-500'
                    } cursor-pointer`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".csv"
                      className="hidden"
                    />
                    <ArrowUpTrayIcon className={`h-12 w-12 mx-auto mb-4 ${
                      csvFile ? 'text-green-500' : 'text-secondary'
                    }`} />
                    <h3 className="text-lg font-medium text-primary mb-2">
                      {csvFile ? csvFile.name : 'Click to upload CSV file'}
                    </h3>
                    <p className="text-secondary">
                      {csvFile ? 'File selected. Ready to upload.' : 'Upload a CSV file with recipient information'}
                    </p>
                    <p className="text-sm text-secondary mt-2">
                      Required columns: <span className="font-medium text-primary">name</span> and either <span className="font-medium text-primary">email</span> or <span className="font-medium text-primary">phone</span>
                    </p>
                  </div>
                  
                  {/* CSV Preview */}
                  {csvPreview.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-primary">Preview (First 5 rows)</h3>
                        <button
                          onClick={resetUpload}
                          className="text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400"
                        >
                          Clear
                        </button>
                      </div>
                      <div className={`rounded-lg overflow-hidden border ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <table className="w-full text-sm">
                          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                            <tr>
                              <th className="px-4 py-3 text-left text-primary">Name</th>
                              <th className="px-4 py-3 text-left text-primary">Email</th>
                              <th className="px-4 py-3 text-left text-primary">Phone</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.map((recipient, index) => (
                              <tr key={index} className={`border-t ${
                                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                              }`}>
                                <td className="px-4 py-3 text-primary">{recipient.name}</td>
                                <td className="px-4 py-3 text-secondary">{recipient.email || '-'}</td>
                                <td className="px-4 py-3 text-secondary">{recipient.phone || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* CSV Format Instructions */}
                  <div className={`rounded-lg p-4 border ${
                    theme === 'dark' 
                      ? 'bg-blue-900/20 border-blue-800 text-blue-300' 
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <h4 className="font-medium mb-2">CSV Format Instructions</h4>
                    <ul className="text-sm space-y-1">
                      <li>• First row must contain headers: <code className={`px-1 rounded ${
                        theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'
                      }`}>name, email, phone</code></li>
                      <li>• Email or phone column is required (you can have both)</li>
                      <li>• File must be UTF-8 encoded</li>
                      <li>• Maximum file size: 10MB</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-color flex-shrink-0 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-color rounded-lg hover:bg-hover text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadRecipients}
                disabled={!csvFile || isUploading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                    Upload Recipients
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;