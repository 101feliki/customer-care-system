import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3001'; // Nest.js backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export interface Notification {
  id: string;
  recipientId: string;
  content: string;
  category: string;
  readAt: Date | null;
  createdAt: Date;
  canceledAt: Date | null;
}

// ... (CreateNotificationDto, Template, SendNotificationDto interfaces remain same)

class NotificationService {
  // Mock data preserved for fallback
  private mockNotifications: Notification[] = [
    { id: '1', recipientId: 'user-123', content: 'Welcome to our customer care service!', category: 'email', readAt: null, createdAt: new Date('2024-01-15T10:30:00'), canceledAt: null },
    // ... other mock items
  ];

  private mockTemplates: Template[] = [
    { id: '1', name: 'Welcome Email', category: 'email', content: 'Welcome {name}!', variables: ['name'], lastUsed: 'Today', usageCount: 45 },
    // ... other mock templates
  ];

  // Helper to safely handle API responses and ensure they are arrays
  private handleResponse(response: any) {
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  }

  async getTemplates(): Promise<Template[]> {
    try {
      const response = await api.get('/templates');
      return this.handleResponse(response);
    } catch (error) {
      console.log('API not available, using mock templates');
      return this.mockTemplates;
    }
  }

  async sendNotification(data: SendNotificationDto): Promise<Notification[]> {
    try {
      const response = await api.post('/notifications/send', data);
      return this.handleResponse(response);
    } catch (error) {
      // Mock logic remains same
      return []; 
    }
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications');
      return this.handleResponse(response);
    } catch (error) {
      console.log('API not available, using mock data');
      return this.mockNotifications;
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      const notification = this.mockNotifications.find(n => n.id === id);
      if (notification) notification.readAt = new Date();
      return notification as Notification;
    }
  }

  async cancelNotification(id: string): Promise<Notification> {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      const notification = this.mockNotifications.find(n => n.id === id);
      if (notification) notification.canceledAt = new Date();
      return notification as Notification;
    }
  }
}

export default new NotificationService();