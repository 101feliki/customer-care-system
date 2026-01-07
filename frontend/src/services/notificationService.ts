import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Your Nest.js backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

export interface CreateNotificationDto {
  recipientId: string;
  content: string;
  category: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'email' | 'sms' | 'push';
  content: string;
  variables: string[];
  lastUsed: string;
  usageCount: number;
}

export interface SendNotificationDto {
  templateId: string;
  recipientIds: string[];
  variables: Record<string, string>;
  scheduleFor?: Date;
}

class NotificationService {
  // Mock data
  private mockNotifications: Notification[] = [
    {
      id: '1',
      recipientId: 'user-123',
      content: 'Welcome to our customer care service!',
      category: 'email',
      readAt: null,
      createdAt: new Date('2024-01-15T10:30:00'),
      canceledAt: null,
    },
    {
      id: '2',
      recipientId: 'user-456',
      content: 'Your support ticket #12345 has been resolved',
      category: 'sms',
      readAt: new Date('2024-01-15T11:45:00'),
      createdAt: new Date('2024-01-14T09:15:00'),
      canceledAt: null,
    },
    {
      id: '3',
      recipientId: 'user-789',
      content: 'URGENT: System maintenance scheduled for tonight',
      category: 'urgent',
      readAt: null,
      createdAt: new Date('2024-01-16T14:20:00'),
      canceledAt: null,
    },
  ];

  private mockTemplates: Template[] = [
    { id: '1', name: 'Welcome Email', category: 'email', content: 'Welcome {name}! Thank you for joining our service. Your account is now active. Please verify your email at {verifyLink}.', variables: ['name', 'verifyLink'], lastUsed: 'Today', usageCount: 45 },
    { id: '2', name: 'Password Reset', category: 'email', content: 'Click here to reset your password: {resetLink}. This link expires in 1 hour.', variables: ['resetLink'], lastUsed: '2 days ago', usageCount: 23 },
    { id: '3', name: 'Order Confirmation', category: 'sms', content: 'Your order #{orderId} has been confirmed. Total: ${amount}. Delivery: {deliveryDate}', variables: ['orderId', 'amount', 'deliveryDate'], lastUsed: 'Yesterday', usageCount: 67 },
    { id: '4', name: 'Appointment Reminder', category: 'sms', content: 'Reminder: Your appointment with {doctorName} is tomorrow at {time} at {location}.', variables: ['doctorName', 'time', 'location'], lastUsed: '1 week ago', usageCount: 18 },
    { id: '5', name: 'Payment Due', category: 'email', content: 'Payment of ${amount} for invoice #{invoiceNumber} is due on {dueDate}. Pay now: {paymentLink}', variables: ['amount', 'invoiceNumber', 'dueDate', 'paymentLink'], lastUsed: 'Today', usageCount: 34 },
  ];

  // Templates API
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      console.log('API not available, using mock templates');
      return this.mockTemplates;
    }
  }

  async getTemplate(id: string): Promise<Template> {
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      const template = this.mockTemplates.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return template;
    }
  }

  async createTemplate(template: Omit<Template, 'id' | 'lastUsed' | 'usageCount'>): Promise<Template> {
    try {
      const response = await api.post('/templates', template);
      return response.data;
    } catch (error) {
      const newTemplate: Template = {
        ...template,
        id: Date.now().toString(),
        lastUsed: 'Never',
        usageCount: 0,
      };
      this.mockTemplates.push(newTemplate);
      return newTemplate;
    }
  }

  // Send notification using template
  async sendNotification(data: SendNotificationDto): Promise<Notification[]> {
    try {
      const response = await api.post('/notifications/send', data);
      return response.data;
    } catch (error) {
      console.log('Sending notification with mock data');
      
      // Get template
      const template = this.mockTemplates.find(t => t.id === data.templateId);
      if (!template) throw new Error('Template not found');
      
      // Update template usage
      template.usageCount++;
      template.lastUsed = new Date().toLocaleDateString();
      
      // Replace variables in content
      let content = template.content;
      Object.entries(data.variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{${key}}`, 'g'), value);
      });
      
      // Create notifications for each recipient
      const newNotifications: Notification[] = data.recipientIds.map(recipientId => ({
        id: `${Date.now()}-${recipientId}`,
        recipientId,
        content,
        category: template.category,
        readAt: null,
        createdAt: new Date(),
        canceledAt: null,
      }));
      
      // Add to mock data
      this.mockNotifications.push(...newNotifications);
      return newNotifications;
    }
  }

  // Original notification methods
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.log('API not available, using mock data');
      return this.mockNotifications;
    }
  }

  async getNotification(id: string): Promise<Notification> {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      const notification = this.mockNotifications.find(n => n.id === id);
      if (!notification) throw new Error('Notification not found');
      return notification;
    }
  }

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    try {
      const response = await api.post('/notifications', data);
      return response.data;
    } catch (error) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...data,
        readAt: null,
        createdAt: new Date(),
        canceledAt: null,
      };
      this.mockNotifications.push(newNotification);
      return newNotification;
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      const notification = this.mockNotifications.find(n => n.id === id);
      if (!notification) throw new Error('Notification not found');
      notification.readAt = new Date();
      return notification;
    }
  }

  async cancelNotification(id: string): Promise<Notification> {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      const notification = this.mockNotifications.find(n => n.id === id);
      if (!notification) throw new Error('Notification not found');
      notification.canceledAt = new Date();
      return notification;
    }
  }
}

export default new NotificationService();