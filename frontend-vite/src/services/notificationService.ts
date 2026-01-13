import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// interceptor to attach token from localStorage (managed by your AuthContext)
api.interceptors.request.use((config) => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
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

// ... (Template, SendNotificationDto interfaces remain the same)

class NotificationService {
  private mockNotifications: Notification[] = [
    { id: '1', recipientId: 'user-123', content: 'Welcome!', category: 'email', readAt: null, createdAt: new Date(), canceledAt: null },
  ];

  /**
   * THE FIX: This handles the "notifications.filter is not a function" error
   */
  private handleResponse(response: any): any[] {
    // 1. Check if response exists
    if (!response || !response.data) return [];

    // 2. Check if data is directly an array
    if (Array.isArray(response.data)) return response.data;

    // 3. Check if data is nested (common in NestJS/Pagination)
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