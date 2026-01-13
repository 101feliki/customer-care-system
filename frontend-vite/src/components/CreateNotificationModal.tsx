import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateNotificationDto } from '../services/notificationService';

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateNotificationDto) => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState<CreateNotificationDto>({
    recipientId: '',
    content: '',
    category: 'email',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({ recipientId: '', content: '', category: 'email' });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Create New Notification</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recipient ID
            </label>
            <input
              type="text"
              required
              value={formData.recipientId}
              onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Enter recipient identifier"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
  value={formData.category}
  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'email' | 'sms' | 'urgent' | 'info' })}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
>
  <option value="email">Email</option>
  <option value="sms">SMS</option>
  <option value="urgent">Urgent</option>
  <option value="info">Info</option>
</select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="Enter notification message"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
