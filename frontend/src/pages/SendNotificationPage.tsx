import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import notificationService, { Template, SendNotificationDto } from '../services/notificationService';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon, 
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const SendNotificationPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const templateIdFromUrl = new URLSearchParams(location.search).get('templateId');
  
  const [step, setStep] = useState(1); // 1: Select Template, 2: Configure, 3: Send
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  // Form state
  const [recipientIds, setRecipientIds] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [scheduleFor, setScheduleFor] = useState<string>('');
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (templateIdFromUrl) {
      const template = templates.find(t => t.id === templateIdFromUrl);
      if (template) {
        handleTemplateSelect(template);
      }
    }
  }, [templates, templateIdFromUrl]);

  useEffect(() => {
    if (selectedTemplate) {
      updatePreview();
    }
  }, [selectedTemplate, variables]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // Initialize variables
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialVariables[variable] = '';
    });
    setVariables(initialVariables);
    setStep(2);
  };

  const updatePreview = () => {
    if (!selectedTemplate) return;
    
    let previewContent = selectedTemplate.content;
    Object.entries(variables).forEach(([key, value]) => {
      previewContent = previewContent.replace(new RegExp(`{${key}}`, 'g'), value || `{${key}}`);
    });
    setPreview(previewContent);
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleSend = async () => {
    if (!selectedTemplate) return;
    
    const recipientIdsArray = recipientIds.split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    if (recipientIdsArray.length === 0) {
      alert('Please enter at least one recipient ID');
      return;
    }

    // Check if all required variables are filled
    const missingVariables = selectedTemplate.variables.filter(v => !variables[v]?.trim());
    if (missingVariables.length > 0) {
      alert(`Please fill in all required variables: ${missingVariables.join(', ')}`);
      return;
    }

    const sendData: SendNotificationDto = {
      templateId: selectedTemplate.id,
      recipientIds: recipientIdsArray,
      variables,
      scheduleFor: scheduleFor ? new Date(scheduleFor) : undefined
    };

    try {
      setSending(true);
      await notificationService.sendNotification(sendData);
      setSent(true);
      setStep(3);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'sms': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'push': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const sendAnother = () => {
    setSelectedTemplate(null);
    setRecipientIds('');
    setVariables({});
    setScheduleFor('');
    setSent(false);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-primary flex">
      <Sidebar />
      
      <div className="flex-1 min-h-screen overflow-x-hidden">
        <header className="bg-secondary border-b border-color sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg hover:bg-hover"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-primary" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-primary">Send Notification</h1>
                  <p className="text-secondary">Create and send notifications using templates</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex flex-col items-center ${stepNumber <= step ? 'text-blue-600' : 'text-secondary'}`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                      stepNumber < step 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : stepNumber === step 
                        ? 'border-blue-600 bg-white dark:bg-gray-800 text-blue-600' 
                        : 'border-gray-300 dark:border-gray-700 text-gray-400'
                    }`}>
                      {stepNumber < step ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      {stepNumber === 1 && 'Select Template'}
                      {stepNumber === 2 && 'Configure'}
                      {stepNumber === 3 && 'Send'}
                    </div>
                  </div>
                  {stepNumber < 3 && (
                    <div className={`h-1 w-16 mx-2 ${stepNumber < step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">Select a Template</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-secondary">Loading templates...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className={`bg-card rounded-xl shadow-sm border border-color p-6 hover:shadow-md transition-shadow cursor-pointer ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                            <DocumentTextIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-primary">{template.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                              {template.category.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-secondary">
                          Used {template.usageCount} times
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
                      
                      <div className="text-xs text-secondary">
                        Last used: {template.lastUsed}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedTemplate && (
            <div className="bg-card rounded-xl shadow-sm border border-color p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Configure Notification</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Configuration */}
                <div>
                  {/* Recipients */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-primary mb-2">
                      <UserGroupIcon className="h-4 w-4 inline mr-1" />
                      Recipient IDs (comma-separated)
                    </label>
                    <textarea
                      value={recipientIds}
                      onChange={(e) => setRecipientIds(e.target.value)}
                      placeholder="user-123, user-456, user-789"
                      className={`w-full h-24 p-3 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <p className="text-xs text-secondary mt-1">Enter recipient IDs separated by commas</p>
                  </div>

                  {/* Variables */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-primary mb-3">Template Variables</h3>
                    <div className="space-y-4">
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-sm font-medium text-primary mb-1">
                            {variable}
                          </label>
                          <input
                            type="text"
                            value={variables[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            placeholder={`Enter value for {${variable}}`}
                            className={`w-full p-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-primary mb-2">
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      Schedule (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleFor}
                      onChange={(e) => setScheduleFor(e.target.value)}
                      className={`w-full p-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <p className="text-xs text-secondary mt-1">Leave empty to send immediately</p>
                  </div>
                </div>

                {/* Right Column: Preview */}
                <div>
                  <div className="sticky top-24">
                    <h3 className="text-lg font-medium text-primary mb-3">Preview</h3>
                    <div className={`p-4 rounded-lg border mb-6 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-sm text-secondary mb-2">Template: {selectedTemplate.name}</div>
                      <div className="text-sm text-secondary mb-2">Category: {selectedTemplate.category}</div>
                      <div className={`text-sm p-3 rounded ${
                        theme === 'dark' 
                          ? 'bg-gray-900 text-gray-300' 
                          : 'bg-white text-gray-800'
                      }`}>
                        {preview || selectedTemplate.content}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setStep(1)}
                        className={`px-4 py-2 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Back to Templates
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={sending}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                      >
                        {sending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                            Send Notification
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-card rounded-xl shadow-sm border border-color p-12 text-center">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                sent ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {sent ? (
                  <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                ) : (
                  <PaperAirplaneIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-primary mb-2">
                {sent ? 'Notification Sent Successfully!' : 'Sending Notification...'}
              </h2>
              
              <p className="text-secondary mb-8 max-w-md mx-auto">
                {sent 
                  ? 'Your notification has been sent to all recipients. You can track delivery status in the notifications page.'
                  : 'Your notification is being processed and will be sent shortly.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={sendAnother}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Another Notification
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="px-6 py-3 border border-color rounded-lg hover:bg-hover text-primary"
                >
                  View All Notifications
                </button>
                <button
                  onClick={() => navigate('/templates')}
                  className="px-6 py-3 border border-color rounded-lg hover:bg-hover text-primary"
                >
                  Manage Templates
                </button>
              </div>
              
              {sent && selectedTemplate && (
                <div className="mt-8 p-4 rounded-lg bg-hover max-w-md mx-auto text-left">
                  <h3 className="font-medium text-primary mb-2">Notification Details:</h3>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Template: {selectedTemplate.name}</li>
                    <li>• Category: {selectedTemplate.category}</li>
                    <li>• Recipients: {recipientIds.split(',').filter(id => id.trim()).length}</li>
                    {scheduleFor && <li>• Scheduled for: {new Date(scheduleFor).toLocaleString()}</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SendNotificationPage;