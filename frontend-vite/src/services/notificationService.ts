import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// interceptor to attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- INTERFACES ---
export interface Notification {
  id: string;
  recipientId: string;
  content: string;
  category: string;
  readAt: Date | null;
  createdAt: Date;
  canceledAt: Date | null;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  usageCount: number;
  lastUsed: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendNotificationDto {
  templateId: string;
  recipientIds: string[];
  variables: Record<string, string>;
  scheduleFor?: Date;
}

class NotificationService {
  private mockNotifications: Notification[] = [
    { id: '1', recipientId: 'user-123', content: 'Welcome!', category: 'email', readAt: null, createdAt: new Date(), canceledAt: null },
  ];

  private handleResponse(response: any): any[] {
    if (!response || !response.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data.notifications && Array.isArray(response.data.notifications)) return response.data.notifications;
    return [];
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications');
      return this.handleResponse(response);
    } catch (error) {
      console.error('API Error, falling back to mocks:', error);
      return this.mockNotifications;
    }
  }

  // ADDED: Get templates method
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await api.get('/templates');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Return mock templates for testing
      return [
        {
          id: '1',
          name: 'Welcome Email',
          content: 'Hello {name}, welcome to our service! Your account has been created successfully.',
          category: 'email',
          variables: ['name'],
          usageCount: 10,
          lastUsed: '2024-01-15',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Order Confirmation',
          content: 'Hi {customerName}, your order #{orderId} has been confirmed. Total: ${amount}.',
          category: 'sms',
          variables: ['customerName', 'orderId', 'amount'],
          usageCount: 5,
          lastUsed: '2024-01-14',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Password Reset',
          content: 'Click here to reset your password: {resetLink}. This link expires in {hours} hours.',
          category: 'email',
          variables: ['resetLink', 'hours'],
          usageCount: 3,
          lastUsed: '2024-01-13',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }

  // ADDED: Send notification method
  async sendNotification(data: SendNotificationDto): Promise<any> {
    try {
      const response = await api.post('/notifications/send', data);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      const n = this.mockNotifications.find(m => m.id === id);
      if (n) n.readAt = new Date();
      return n as Notification;
    }
  }

  async cancelNotification(id: string): Promise<Notification> {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      const n = this.mockNotifications.find(m => m.id === id);
      if (n) n.canceledAt = new Date();
      return n as Notification;
    }
  }
}

export default new NotificationService();