import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  DocumentTextIcon, PlusIcon, PencilIcon, TrashIcon, 
  ClipboardIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon, 
  BellIcon, XMarkIcon, EyeIcon 
} from '@heroicons/react/24/outline';

interface Template {
  id: number;
  name: string;
  type: string;
  subject: string; // Added to match Prisma
  content: string; 
  createdAt?: string;
}

const TemplatesPage: React.FC = () => {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    type: 'EMAIL',
    subject: '', // Added
    content: ''
  });

  const fetchTemplates = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError('Could not load templates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, [token]);

  const handleSubmit = async () => {
    // Validation: Now checking for subject too
    if (!formData.name || !formData.content || !formData.subject) {
      return alert('Name, Subject, and Content are required');
    }

    try {
      const url = isEditMode 
        ? `http://localhost:3001/templates/${formData.id}`
        : 'http://localhost:3001/templates';
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          subject: formData.subject, // Sending to backend
          content: formData.content
        })
      });

      if (!response.ok) throw new Error('Server error');

      setShowModal(false);
      fetchTemplates();
      alert(isEditMode ? 'Updated!' : 'Created!');
    } catch (err) {
      alert('Failed to save template. Check backend console.');
    }
  };

  const openModal = (template?: Template) => {
    if (template) {
      setFormData({
        id: template.id,
        name: template.name,
        type: template.type,
        subject: template.subject || '',
        content: template.content
      });
      setIsEditMode(true);
    } else {
      setFormData({ id: 0, name: '', type: 'EMAIL', subject: '', content: '' });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  return (
    <div className="h-screen flex bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-color px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Templates</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" /> Create Template
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map(t => (
              <div key={t.id} className="bg-card p-5 rounded-xl border border-color group relative">
                <div className="flex justify-between">
                   <h3 className="font-bold">{t.name}</h3>
                   <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                     <button onClick={() => openModal(t)}><PencilIcon className="h-4 w-4 text-blue-500"/></button>
                   </div>
                </div>
                <p className="text-xs text-secondary mt-1 italic">{t.subject}</p>
                <p className="text-sm text-secondary mt-2 line-clamp-2">{t.content}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-color flex justify-between">
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit' : 'New'} Template</h2>
              <button onClick={() => setShowModal(false)}><XMarkIcon className="h-6 w-6"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">NAME</label>
                  <input className="w-full bg-primary border border-color rounded p-2" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">CHANNEL</label>
                  <select className="w-full bg-primary border border-color rounded p-2" 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">SUBJECT</label>
                <input className="w-full bg-primary border border-color rounded p-2" 
                  value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="The email subject line..." />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">CONTENT (HTML)</label>
                <textarea className="w-full h-40 bg-primary border border-color rounded p-2 font-mono text-sm" 
                  value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
            </div>

            <div className="p-6 border-t border-color flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;