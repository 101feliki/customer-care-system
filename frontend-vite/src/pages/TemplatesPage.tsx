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
  EyeIcon,
  PaperAirplaneIcon,
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  UsersIcon
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
  });

  // --- Send Modal State ---
  const [selectedTemplateForSend, setSelectedTemplateForSend] = useState<Template | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // --- Recipients Section State ---
  const [showRecipientsSection, setShowRecipientsSection] = useState(false);
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
      // Optionally fetch recipients on mount
      // fetchRecipients();
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-lg transition-all"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
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

          {/* Recipients Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">Uploaded Recipients</h2>
                  <p className="text-secondary text-sm">Manage recipients for sending notifications</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (!showRecipientsSection) {
                      fetchRecipients();
                    }
                    setShowRecipientsSection(!showRecipientsSection);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-primary rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  {showRecipientsSection ? 'Hide Recipients' : 'Show Recipients'}
                </button>
                <button
                  onClick={fetchRecipients}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={recipientsLoading}
                >
                  {recipientsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </button>
              </div>
            </div>

            {showRecipientsSection && (
              <>
                {/* Recipient Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-card rounded-xl p-4 border border-color hover:shadow-md transition-shadow">
                    <div className="text-sm text-secondary">Total Recipients</div>
                    <div className="text-2xl font-bold text-primary">{recipientStats.total}</div>
                    <div className="text-xs text-secondary mt-1">Uploaded via CSV</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-color hover:shadow-md transition-shadow">
                    <div className="text-sm text-secondary">Active</div>
                    <div className="text-2xl font-bold text-green-600">{recipientStats.active}</div>
                    <div className="text-xs text-secondary mt-1">Ready to receive</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-color hover:shadow-md transition-shadow">
                    <div className="text-sm text-secondary">Inactive</div>
                    <div className="text-2xl font-bold text-yellow-600">{recipientStats.inactive}</div>
                    <div className="text-xs text-secondary mt-1">Temporarily disabled</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-color hover:shadow-md transition-shadow">
                    <div className="text-sm text-secondary">Blocked</div>
                    <div className="text-2xl font-bold text-red-600">{recipientStats.blocked}</div>
                    <div className="text-xs text-secondary mt-1">Not receiving</div>
                  </div>
                </div>

                {/* Recipients List */}
                <div className="bg-card rounded-xl border border-color overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-color">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-color">
                        {recipientsLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center">
                              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                              <p className="mt-2 text-secondary">Loading recipients...</p>
                            </td>
                          </tr>
                        ) : recipients.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center">
                              <div className="text-gray-400 text-3xl mb-2">👤</div>
                              <p className="text-secondary">No recipients found. Upload a CSV or add recipients manually.</p>
                              <div className="mt-3">
                                <a 
                                  href="/recipients" 
                                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Go to Recipients Page
                                </a>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          recipients.slice(0, 5).map((recipient) => (
                            <tr key={recipient.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-primary">{recipient.name}</div>
                                    <div className="text-xs text-secondary">ID: {recipient.id?.substring(0, 8)}...</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-primary">{recipient.email}</td>
                              <td className="px-6 py-4 text-sm text-secondary">
                                {recipient.phone ? (
                                  <div className="flex items-center">
                                    <PhoneIcon className="h-3 w-3 mr-1" />
                                    {recipient.phone}
                                  </div>
                                ) : (
                                  'No phone'
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRecipientStatusColor(recipient.status || 'active')}`}>
                                  {(recipient.status || 'active').charAt(0).toUpperCase() + (recipient.status || 'active').slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => {
                                    // Add recipient to selected recipients for sending
                                    if (selectedTemplateForSend) {
                                      setSelectedRecipients(prev => 
                                        prev.includes(recipient.id) 
                                          ? prev.filter(id => id !== recipient.id)
                                          : [...prev, recipient.id]
                                      );
                                    }
                                  }}
                                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                    selectedRecipients.includes(recipient.id)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {selectedRecipients.includes(recipient.id) ? 'Selected ✓' : 'Select'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {recipients.length > 5 && (
                    <div className="px-6 py-4 border-t border-color bg-gray-50 dark:bg-gray-800/50 text-center">
                      <p className="text-sm text-secondary">
                        Showing 5 of {recipients.length} recipients. 
                        <a
                          href="/recipients"
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View all recipients →
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
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

      {/* --- CREATE/EDIT TEMPLATE MODAL --- */}
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
                      className="w-full h-64 bg-gray-50 dark:bg-gray-600 border border-color rounded-lg p-4 font-mono text-sm text-primary focus:ring-2 focus:ring-blue-500 outline-none resize-none"
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
                        className="w-full h-32 bg-gray-50 dark:bg-gray-700 border border-color rounded-lg p-4 font-mono text-sm text-primary focus:ring-2 focus:ring-blue-500 outline-none resize-none"
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
                
                <div className="flex-1 bg-white dark:bg-gray-600 rounded-2xl shadow-xl border border-color overflow-hidden flex flex-col">
                  <div className="bg-gray-100 dark:bg-gray-500 px-4 py-3 border-b border-color flex space-x-2">
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