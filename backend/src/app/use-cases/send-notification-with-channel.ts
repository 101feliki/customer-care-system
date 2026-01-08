import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications-repository';
import { Notification } from '../entities/notification';
import { Content } from '../entities/content';
import { EmailService } from '../../infra/services/email.service';
import { SmsService } from '../../infra/services/sms.service';

interface SendNotificationWithChannelRequest {
  recipientId: string;
  content: string;
  category: string;
  channel: 'email' | 'sms' | 'push';
  subject?: string;
  recipientEmail?: string;
  recipientPhone?: string;
}

interface SendNotificationWithChannelResponse {
  notification: Notification;
  deliveryResult?: any;
}

@Injectable()
export class SendNotificationWithChannel {
  constructor(
    private notificationsRepository: NotificationsRepository,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async execute(
    request: SendNotificationWithChannelRequest,
  ): Promise<SendNotificationWithChannelResponse> {
    const { recipientId, content, category, channel, subject, recipientEmail, recipientPhone } = request;

    // Create notification in database
    const notificationContent = new Content(content);
    const notification = new Notification({
      recipientId,
      content: notificationContent,
      category,
      channel,
    });

    await this.notificationsRepository.create(notification);

    // Send via appropriate channel
    let deliveryResult;
    
    if (channel === 'email' && recipientEmail) {
      deliveryResult = await this.emailService.sendEmail(
        recipientEmail,
        subject || 'Notification',
        content,
        content, // Plain text version
      );
    } else if (channel === 'sms' && recipientPhone) {
      deliveryResult = await this.smsService.sendSMS(recipientPhone, content);
    } else if (channel === 'push') {
      // Push notification logic here
      deliveryResult = { success: true, message: 'Push notification queued' };
    }

    // Update notification status if needed
    if (deliveryResult?.success) {
      // Mark as sent
    } else {
      // Mark as failed
    }

    await this.notificationsRepository.save(notification);

    return {
      notification,
      deliveryResult,
    };
  }
}