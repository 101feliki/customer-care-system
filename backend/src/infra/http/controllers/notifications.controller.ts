/* eslint-disable prettier/prettier */
import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post,
  NotFoundException,
  InternalServerErrorException
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
import { MailerService } from '../../mail/mailer.service'; // Ensure this path is correct

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
    private mailer: MailerService, // Injecting the MailerService
  ) {}

  /**
   * DYNAMIC EMAIL SENDING
   * This endpoint takes a templateId, a target email, and a data object.
   * It swaps {{keys}} in the template with values from the data object.
   */
  @Post('send-template')
  async sendDynamicEmail(
    @Body() body: { 
      templateId: string; 
      email: string; 
      variables: Record<string, any> 
    }
  ) {
    const { templateId, email, variables } = body;

    // 1. Fetch the dynamic template from the database
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    try {
      // 2. Use the MailerService to parse and send
      await this.mailer.send(
        email,
        template.subject,
        template.htmlBody,
        variables
      );

      // 3. Optional: Log this as a notification in your DB
      await this.sendNotification.execute({
        recipientId: 'SYSTEM', // or find real recipient ID
        content: `Email Sent: ${template.name}`,
        category: 'EMAIL_NOTIFICATION',
      });

      return { success: true, message: 'Dynamic email sent successfully' };
    } catch (error) {
      console.error('Failed to send dynamic email:', error);
      throw new InternalServerErrorException('Mail delivery failed');
    }
  }

  // --- EXISTING ENDPOINTS ---

  @Get()
  async getAll() {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: { recipient: true },
    });
    
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
    
    return { notifications: formattedNotifications };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: { recipient: true },
    });
    
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    
    return {
      notification: {
        ...notification,
        recipient: notification.recipient
      }
    };
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    await this.cancelNotification.execute({ notificationId: id });
  }

  @Get('count/from/:recipientId')
  async countFromRecipient(@Param('recipientId') recipientId: string) {
    const { count } = await this.countRecipientNotifications.execute({ recipientId });
    return { count };
  }

  @Get('from/:recipientId')
  async getFromRecipient(@Param('recipientId') recipientId: string) {
    const { notifications } = await this.getRecipientNotifications.execute({ recipientId });
    return { notifications: notifications.map(NotificationViewModel.toHTTP) };
  }

  @Patch(':id/read')
  async read(@Param('id') id: string) {
    await this.readNotification.execute({ notificationId: id });
  }

  @Patch(':id/unread')
  async unread(@Param('id') id: string) {
    await this.unreadNotification.execute({ notificationId: id });
  }

  @Post()
  async create(@Body() body: CreateNotificationBody) {
    const { recipientId, content, category } = body;
    const { notification } = await this.sendNotification.execute({
      recipientId,
      content,
      category,
    });
    return { notification: NotificationViewModel.toHTTP(notification) };
  }
}