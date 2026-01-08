/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications-repository';
import { Notification as AppNotification } from '../entities/notification'; // Add alias

interface GetAllNotificationsResponse {
  notifications: AppNotification[]; // Use alias
}

@Injectable()
export class GetAllNotifications {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute(): Promise<GetAllNotificationsResponse> {
    const notifications = await this.notificationsRepository.findAll();
    
    return { notifications };
  }
}