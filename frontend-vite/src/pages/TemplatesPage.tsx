import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
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
  
  PaperAirplaneIcon,
 
  SparklesIcon,
  LightBulbIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  
} from '@heroicons/react/24/outline';

// --- Types matching your NestJS Backend ---
interface Template {
  id: string;
  name: string;
  type?: string; 
  content?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  variables?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  createdAt?: string;
}

const TemplatesPage: React.FC = () => {
  
  const { token } = useAuth(); 
  
  // --- Real Data State ---
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- UI State ---
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
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
    customVariables: [] as string[], 
  });

  // --- Send Modal State ---
  const [selectedTemplateForSend, setSelectedTemplateForSend] = useState<Template | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // --- Recipients Section State ---
  //const [showRecipientsSection, setShowRecipientsSection] = useState(false);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientStats, setRecipientStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0
  });

  // 1. FETCH TEMPLATES FROM BACKEND
  const fetchTemplates = async () => {
    if (!token) {
      console.log('❌ No token available');
      setError('Please login first');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      console.log('🔍 Fetching templates...');
      
      const response = await fetch('http://localhost:3001/templates', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      // Extract templates array from response
      let templatesArray: any[] = [];
      
      if (data && data.templates && Array.isArray(data.templates)) {
        templatesArray = data.templates;
        console.log(`✅ Found ${templatesArray.length} templates in "templates" property`);
      } else if (Array.isArray(data)) {
        templatesArray = data;
        console.log(`✅ Found ${templatesArray.length} templates in direct array`);
      } else if (data && data.data && Array.isArray(data.data)) {
        templatesArray = data.data;
        console.log(`✅ Found ${templatesArray.length} templates in "data" property`);
      } else {
        console.warn('⚠️ Unexpected response format:', data);
        templatesArray = [];
      }
      
      // Map to your Template interface
      const mappedTemplates: Template[] = templatesArray.map(item => ({
        id: item.id || '',
        name: item.name || 'Unnamed Template',
        type: item.type || 'EMAIL',
        content: item.content || item.htmlBody || '',
        subject: item.subject || '',
        htmlBody: item.htmlBody || '',
        textBody: item.textBody || '',
        variables: item.variables || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
      
      console.log('✅ Mapped templates:', mappedTemplates);
      setTemplates(mappedTemplates);
      
      if (mappedTemplates.length === 0) {
        console.log('ℹ️ No templates found in database');
      }
      
    } catch (err) {
      console.error('❌ Error fetching templates:', err);
      setError(`Could not load templates: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTemplates([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading completed');
    }
  };

  // 2. FETCH RECIPIENTS FOR SENDING AND DISPLAY
  const fetchRecipients = async () => {
    if (!token) {
      console.log('❌ No token for fetching recipients');
      return;
    }
    
    try {
      setRecipientsLoading(true);
      console.log('🔍 Fetching recipients...');
      
      const response = await fetch('http://localhost:3001/recipients', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Recipients status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error fetching recipients:', errorText);
        return;
      }
      
      const data = await response.json();
      console.log('✅ Recipients response:', data);
      
      // Handle different response formats
      let recipientsArray: any[] = [];
      
      if (Array.isArray(data)) {
        recipientsArray = data;
      } else if (data && data.recipients && Array.isArray(data.recipients)) {
        recipientsArray = data.recipients;
      } else if (data && data.data && Array.isArray(data.data)) {
        recipientsArray = data.data;
      }
      
      console.log(`✅ Found ${recipientsArray.length} recipients`);
      const mappedRecipients: Recipient[] = recipientsArray.map(recipient => ({
        id: recipient.id || '',
        name: recipient.name || 'Unknown',
        email: recipient.email || '',
        phone: recipient.phone || '',
        status: recipient.status || 'active',
        createdAt: recipient.createdAt
      }));
      
      setRecipients(mappedRecipients);
      
      // Calculate stats
      const stats = {
        total: mappedRecipients.length,
        active: mappedRecipients.filter(r => r.status === 'active').length,
        inactive: mappedRecipients.filter(r => r.status === 'inactive').length,
        blocked: mappedRecipients.filter(r => r.status === 'blocked').length,
      };
      setRecipientStats(stats);
      
    } catch (err) {
      console.error('❌ Error fetching recipients:', err);
    } finally {
      setRecipientsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTemplates();
    }
  }, [token]);

  // 3. CREATE OR UPDATE TEMPLATE
  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Name is required');
      return;
    }

    if (!token) {
      alert('Please login first');
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
          'Authorization': `Bearer ${token}`
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
      alert(isEditMode ? '✅ Template Updated!' : '✅ Template Created!');
    } catch (err) {
      console.error('Error saving template:', err);
      alert(`❌ Error saving template: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // 4. DELETE TEMPLATE
  const handleDelete = async (id: string) => {
    if (!token) {
      alert('Please login first');
      return;
    }
    
    if(!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`http://localhost:3001/templates/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        alert('✅ Template deleted successfully');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to delete: ${errorText}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Failed to delete template');
    }
  };

  // 5. SEND TEMPLATE TO RECIPIENTS - FIXED VERSION
  const handleSendTemplate = (template: Template) => {
    setSelectedTemplateForSend(template);
    setVariableValues({});
    setSelectedRecipients([]);
    setSendError('');
    fetchRecipients();
    setShowSendModal(true);
  };

  const sendNotification = async () => {
    if (!selectedTemplateForSend || !token) return;
    
    if (selectedRecipients.length === 0) {
      setSendError('Please select at least one recipient');
      return;
    }

    setIsSending(true);
    setSendError('');

    try {
      // Filter recipients to only include selected ones with their details
      const selectedRecipientDetails = recipients.filter(recipient => 
        selectedRecipients.includes(recipient.id)
      );

      // Prepare payload for bulk notifications endpoint
      const payload = {
        templateId: selectedTemplateForSend.id,
        channel: (selectedTemplateForSend.type || 'EMAIL').toLowerCase() as 'email' | 'sms',
        recipients: selectedRecipientDetails.map(recipient => ({
          recipientId: recipient.id,
          email: recipient.email,
          phone: recipient.phone,
          variables: {
            name: recipient.name,
            email: recipient.email,
            ...variableValues
          }
        })),
        variables: variableValues
      };

      console.log('📤 Sending notification with payload:', payload);

      // Use the bulk notifications endpoint
      const response = await fetch('http://localhost:3001/bulk-notifications/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📡 Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to send: ${response.status} - ${responseText}`);
      }

      // Parse response
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: 'Notification sent successfully!' };
      }

      alert(`✅ ${responseData.message || `Notifications sent to ${selectedRecipientDetails.length} recipient(s)!`}`);
      setShowSendModal(false);
      
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      
      // User-friendly error messages
      let errorMsg = 'Failed to send notification';
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMsg = 'Send endpoint not found. Please check backend routes.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMsg = 'Authentication failed. Please login again.';
        } else if (error.message.includes('Network')) {
          errorMsg = 'Network error. Check backend is running on localhost:3001.';
        } else if (error.message.includes('recipients is not iterable')) {
          errorMsg = 'Invalid recipients format. Please try again.';
        } else if (error.message.includes('Mail delivery failed')) {
          errorMsg = 'Email service is currently unavailable. Notifications were saved but not sent.';
        } else {
          errorMsg = error.message;
        }
      }
      
      setSendError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      type: 'EMAIL',
      content: '',
      subject: '',
      htmlBody: '',
      textBody: '',
      variables: ['name', 'email', 'company', 'date'],
      customVariables: [],
    });
    setIsEditMode(false);
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
        customVariables: [],
      });
      setIsEditMode(true);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const insertVariable = (varName: string) => {
    const variable = `{{${varName}}}`;
    const currentContent = formData.type === 'EMAIL' ? formData.htmlBody : formData.content;
    
    // Smart placement: Insert at cursor position if in textarea
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea && document.activeElement === textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = currentContent.substring(0, start) + variable + currentContent.substring(end);
      
      if (formData.type === 'EMAIL') {
        setFormData(prev => ({ ...prev, htmlBody: newContent }));
      } else {
        setFormData(prev => ({ ...prev, content: newContent }));
      }
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      // Append at end
      if (formData.type === 'EMAIL') {
        setFormData(prev => ({
          ...prev,
          htmlBody: prev.htmlBody + (prev.htmlBody ? ' ' : '') + variable
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          content: prev.content + (prev.content ? ' ' : '') + variable
        }));
      }
    }
  };

  const getIcon = (type: string = 'EMAIL') => {
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

  const getRecipientStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'inactive': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'blocked': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
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
                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-lg transition-all"
              >
                <PlusIcon className="h-5 w- mr-2" />
                Create Template
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Search Bar */}
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

          {/* Templates Section */}
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
                          {template.type || 'EMAIL'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleSendTemplate(template)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-green-500"
                        title="Send this template"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openModal(template)} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500"
                        title="Edit template"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(template.id)} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                        title="Delete template"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg mb-3 h-24 overflow-hidden relative">
                    <p className="text-secondary font-mono text-xs leading-relaxed">
                      {getTemplateContent(template)}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
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

      {/* --- ENHANCED CREATE/EDIT TEMPLATE MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-blue-600 text-white">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  {isEditMode ? 'Edit Template' : 'Create New Template'}
                </h2>
                <p className="text-sm opacity-90">Design and optimize your notification template</p>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} 
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                {['Setup', 'Content', 'Preview'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      index === 0 
                        ? 'bg-blue-600 text-white'
                        : formData.name 
                          ? 'bg-green-100 dark:bg-blue-900/30 text-blue-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      {index === 0 ? index + 1 : <CheckCircleIcon className="h-5 w-5" />}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      index === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                    {index < 2 && (
                      <div className={`h-0.5 w-12 mx-2 ${
                        formData.name ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Main Editor */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Template Name & Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Welcome Email, Order Confirmation"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Choose a descriptive name that helps identify this template
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Channel Type *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, type: 'EMAIL'})}
                          className={`p-3 border-2 rounded-lg flex flex-col items-center transition-all ${
                            formData.type === 'EMAIL'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <EnvelopeIcon className={`h-6 w-6 mb-1 ${
                            formData.type === 'EMAIL' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                          }`} />
                          <span className="text-sm font-medium">Email</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, type: 'SMS'})}
                          className={`p-3 border-2 rounded-lg flex flex-col items-center transition-all ${
                            formData.type === 'SMS'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <ChatBubbleBottomCenterTextIcon className={`h-6 w-6 mb-1 ${
                            formData.type === 'SMS' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                          }`} />
                          <span className="text-sm font-medium">SMS</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, type: 'PUSH'})}
                          className={`p-3 border-2 rounded-lg flex flex-col items-center transition-all ${
                            formData.type === 'PUSH'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <BellIcon className={`h-6 w-6 mb-1 ${
                            formData.type === 'PUSH' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'
                          }`} />
                          <span className="text-sm font-medium">Push</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Variables */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white">
                        Quick Variables
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Click to insert
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {[
                        { name: 'name', label: 'Name' },
                        { name: 'email', label: 'Email' },
                        { name: 'company', label: 'Company' },
                        { name: 'date', label: 'Date' },
                        { name: 'amount', label: 'Amount' },
                        { name: 'invoice_number', label: 'Invoice #' },
                      ].map((variable) => (
                        <button
                          key={variable.name}
                          type="button"
                          onClick={() => insertVariable(variable.name)}
                          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex flex-col items-center"
                          title={`Insert {{${variable.name}}}`}
                        >
                          <span className="text-xs font-mono mb-1">{`{{${variable.name}}}`}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{variable.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Line (Email only) */}
                  {formData.type === 'EMAIL' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Subject Line *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          placeholder="Enter email subject..."
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none pr-20"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                          {formData.subject.length}/60
                        </div>
                      </div>
                      {formData.subject.length > 60 && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                          <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                          Subject line may be truncated on mobile devices
                        </p>
                      )}
                    </div>
                  )}

                  {/* Content Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white">
                        {formData.type === 'EMAIL' ? 'HTML Content *' : 'Message Content *'}
                      </label>
                      <div className="flex items-center space-x-2">
                        {formData.type === 'SMS' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formData.content.length}/160 characters
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const content = formData.type === 'EMAIL' ? formData.htmlBody : formData.content;
                            const wordCount = content ? content.split(/\s+/).filter(w => w.length > 0).length : 0;
                            alert(`Content Analysis:\nWords: ${wordCount}\nCharacters: ${content?.length || 0}\nVariables: ${formData.variables.length}`);
                          }}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Analyze
                        </button>
                      </div>
                    </div>
                    
                    {formData.type === 'EMAIL' ? (
                      <textarea
                        id="template-content"
                        value={formData.htmlBody}
                        onChange={(e) => setFormData({...formData, htmlBody: e.target.value})}
                        placeholder="Enter your HTML content here. Use {{variables}} for personalization."
                        rows={12}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    ) : (
                      <textarea
                        id="template-content"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder={`Enter your ${formData.type.toLowerCase()} message...`}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    )}
                    
                    {/* Text version for Email */}
                    {formData.type === 'EMAIL' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Plain Text Version (Optional)
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">For email clients without HTML support</span>
                        </label>
                        <textarea
                          value={formData.textBody}
                          onChange={(e) => setFormData({...formData, textBody: e.target.value})}
                          placeholder="Plain text version of your email..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Preview Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      {formData.type === 'EMAIL' ? (
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subject:</div>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                              {formData.subject || 'No subject set'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Content Preview:</div>
                            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-60 overflow-y-auto p-3 bg-white dark:bg-gray-800 rounded border">
                              {formData.htmlBody 
                                ? (formData.htmlBody.length > 500 
                                    ? formData.htmlBody.substring(0, 500) + '...' 
                                    : formData.htmlBody)
                                : 'No content yet'
                              }
                            </div>
                          </div>
                        </div>
                      ) : formData.type === 'SMS' ? (
                        <div className="flex justify-end">
                          <div className="max-w-xs">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl rounded-br-none">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {formData.content || 'SMS message preview...'}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                              {formData.content ? `${formData.content.length} characters` : 'Empty'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-md">
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <BellIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">App Notification</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Now</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {formData.content || 'Push notification preview...'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Tips & Stats WITH ACTION BUTTONS */}
              <div className="lg:w-80 border-l border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col">
                <div className="flex-1 space-y-6">
                  {/* Tips Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <LightBulbIcon className="h-4 w-4 mr-2 text-yellow-500" />
                      Quick Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
                        Use <code className="mx-1 px-1 bg-gray-200 dark:bg-gray-800 rounded">{"{{name}}"}</code> for personalization
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
                        Keep {formData.type === 'EMAIL' ? 'subject lines' : 'messages'} concise
                      </li>
                      <li className="flex items-start">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2 mt-1.5"></div>
                        Test with a small group before sending to all recipients
                      </li>
                    </ul>
                  </div>

                  {/* Stats Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Template Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Variables Used</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {formData.variables.length}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Content Length</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {formData.type === 'EMAIL' 
                            ? formData.htmlBody?.length || 0
                            : formData.content?.length || 0
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Best Practices</h4>
                    <div className="space-y-2">
                      {formData.type === 'EMAIL' ? (
                        <>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Subject under 60 characters</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Clear call-to-action</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Mobile responsive design</div>
                        </>
                      ) : formData.type === 'SMS' ? (
                        <>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Keep under 160 characters</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Clear, concise language</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Include opt-out instructions</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Title under 30 characters</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Body under 100 characters</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">✓ Clear action button text</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      <button
                        onClick={handleSubmit}
                        disabled={!formData.name || (formData.type === 'EMAIL' ? !formData.htmlBody : !formData.content)}
                        className="w-full py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        {isEditMode ? 'Update Template' : 'Create Template'}
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                        className="w-full py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      {isEditMode ? 'Save your changes' : 'Create and save this template'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Action Bar - Only shows on mobile */}
            <div className="lg:hidden px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name || (formData.type === 'EMAIL' ? !formData.htmlBody : !formData.content)}
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isEditMode ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SEND TEMPLATE MODAL --- */}
      {showSendModal && selectedTemplateForSend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-blue-600 dark:bg-blue-800 text-white">
              <div>
                <h2 className="text-xl font-bold">Send Template</h2>
                <p className="text-sm opacity-90">{selectedTemplateForSend.name}</p>
              </div>
              <button 
                onClick={() => setShowSendModal(false)}
                className="p-2 hover:bg-blue-700 rounded-full transition-colors"
                disabled={isSending}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {sendError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
                  {sendError}
                </div>
              )}

              {/* Recipients Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Recipients</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50">
                  {recipients.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No recipients available. Please create recipients first.
                    </p>
                  ) : (
                    recipients.map(recipient => (
                      <div key={recipient.id} className="flex items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <input
                          type="checkbox"
                          id={`recipient-${recipient.id}`}
                          checked={selectedRecipients.includes(recipient.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipients(prev => [...prev, recipient.id]);
                            } else {
                              setSelectedRecipients(prev => prev.filter(id => id !== recipient.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          disabled={isSending}
                        />
                        <label htmlFor={`recipient-${recipient.id}`} className="ml-3 flex-1 cursor-pointer">
                          <div className="font-medium text-gray-900 dark:text-white">{recipient.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{recipient.email}</div>
                          {recipient.phone && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{recipient.phone}</div>
                          )}
                        </label>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          recipient.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {recipient.status || 'active'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Selected: <span className="font-bold text-blue-600 dark:text-blue-400">{selectedRecipients.length}</span> recipient(s)
                </p>
              </div>

              {/* Variable Values */}
              {selectedTemplateForSend.variables && selectedTemplateForSend.variables.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Template Variables</h3>
                  <div className="space-y-3">
                    {selectedTemplateForSend.variables.map(variable => (
                      <div key={variable} className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-900 dark:text-white">
                          {variable}:
                        </label>
                        <input
                          type="text"
                          value={variableValues[variable] || ''}
                          onChange={(e) => setVariableValues(prev => ({
                            ...prev,
                            [variable]: e.target.value
                          }))}
                          placeholder={`Enter value for ${variable}`}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          disabled={isSending}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preview</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Subject: {selectedTemplateForSend.subject || 'No subject'}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedTemplateForSend.htmlBody 
                      ? (selectedTemplateForSend.htmlBody.substring(0, 300) + (selectedTemplateForSend.htmlBody.length > 300 ? '...' : ''))
                      : selectedTemplateForSend.content?.substring(0, 300) + (selectedTemplateForSend.content && selectedTemplateForSend.content.length > 300 ? '...' : '') || 'No content'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowSendModal(false)}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSending}
              >
                Cancel
              </button>
              <button 
                onClick={sendNotification}
                disabled={isSending || selectedRecipients.length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-50"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                    Send to {selectedRecipients.length} Recipient(s)
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