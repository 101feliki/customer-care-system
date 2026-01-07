/* eslint-disable prettier/prettier */
import { Content } from '@app/entities/content';
import { Notification } from '@app/entities/notification';
import { Notification as RawNotification } from '@prisma/client';

export class PrismaNotificationsMapper {
  static toPrisma(notification: Notification) {
    return {
      id: notification.id,
      category: notification.category,
      content: notification.content.value,
      recipientId: notification.recipientId,
      channel: notification.channel || 'email',
      status: notification.status || 'pending',
      readAt: notification.readAt,
      canceledAt: notification.canceledAt,
      bulkNotificationId: notification.bulkNotificationId,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt || new Date(),
    };
  }

  static toDomain(raw: RawNotification) {
    return new Notification({
      category: raw.category,
      content: new Content(raw.content),
      recipientId: raw.recipientId,
      channel: raw.channel,
      status: raw.status,
      readAt: raw.readAt,
      canceledAt: raw.canceledAt,
      bulkNotificationId: raw.bulkNotificationId ||undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }, raw.id);
  }
}
