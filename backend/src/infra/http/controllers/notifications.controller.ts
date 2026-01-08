/* eslint-disable prettier/prettier */
import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post,
  NotFoundException 
} from '@nestjs/common';
import { SendNotification } from '../../../app/use-cases/send-notification';
import { CreateNotificationBody } from '../dtos/create-notification-body';
import { NotificationViewModel } from '../view-models/notification-view-model';
import { CancelNotification } from '@app/use-cases/cancel-notification';
import { CountRecipientNotifications } from '@app/use-cases/count-recipient-notifications';
import { ReadNotification } from '@app/use-cases/read-notification';
import { UnreadNotification } from '@app/use-cases/unread-notification';
import { GetRecipientNotifications } from '@app/use-cases/get-recipient-notifications';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';
import { GetAllNotifications } from '@app/use-cases/get-all-notifications';
@Controller('notifications')
export class NotificationsController {
  constructor(
    private sendNotification: SendNotification,
    private cancelNotification: CancelNotification,
    private countRecipientNotifications: CountRecipientNotifications,
    private getRecipientNotifications: GetRecipientNotifications,
    private readNotification: ReadNotification,
    private unreadNotification: UnreadNotification,
    private prisma: PrismaService,
    private getAllNotifications: GetAllNotifications,
  ) {}

  @Get()
  async getAll() {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        recipient: true,
      },
    });
    
    // Convert Prisma models to HTTP response format
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      recipientId: notification.recipientId,
      content: notification.content,
      category: notification.category,
      channel: notification.channel,
      status: notification.status,
      readAt: notification.readAt,
      canceledAt: notification.canceledAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      recipient: notification.recipient ? {
        id: notification.recipient.id,
        name: notification.recipient.name,
        email: notification.recipient.email,
        phone: notification.recipient.phone,
      } : null,
    }));
    
    return {
      notifications: formattedNotifications,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        recipient: true,
      },
    });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    
    // Convert Prisma model to HTTP response format
    const formattedNotification = {
      id: notification.id,
      recipientId: notification.recipientId,
      content: notification.content,
      category: notification.category,
      channel: notification.channel,
      status: notification.status,
      readAt: notification.readAt,
      canceledAt: notification.canceledAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      recipient: notification.recipient ? {
        id: notification.recipient.id,
        name: notification.recipient.name,
        email: notification.recipient.email,
        phone: notification.recipient.phone,
      } : null,
    };
    
    return {
      notification: formattedNotification,
    };
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    await this.cancelNotification.execute({
      notificationId: id,
    });
  }

  @Get('count/from/:recipientId')
  async countFromRecipient(@Param('recipientId') recipientId: string) {
    const { count } = await this.countRecipientNotifications.execute({
      recipientId,
    });

    return {
      count,
    };
  }

  @Get('from/:recipientId')
  async getFromRecipient(@Param('recipientId') recipientId: string) {
    const { notifications } = await this.getRecipientNotifications.execute({
      recipientId,
    });

    return {
      notifications: notifications.map(NotificationViewModel.toHTTP),
    };
  }

  @Patch(':id/read')
  async read(@Param('id') id: string) {
    await this.readNotification.execute({
      notificationId: id,
    });
  }

  @Patch(':id/unread')
  async unread(@Param('id') id: string) {
    await this.unreadNotification.execute({
      notificationId: id,
    });
  }

  @Post()
  async create(@Body() body: CreateNotificationBody) {
    const { recipientId, content, category } = body;

    const { notification } = await this.sendNotification.execute({
      recipientId,
      content,
      category,
    });

    return {
      notification: NotificationViewModel.toHTTP(notification),
    };
  }
}