import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { EmailService } from '../../infra/services/email.service';
import { SmsService } from '../../infra/services/sms.service';

interface BulkNotificationRecipient {
  recipientId: string;
  email?: string;
  phone?: string;
  variables?: Record<string, string>;
}

interface SendBulkNotificationsRequest {
  templateId?: string;
  templateContent?: string;
  templateSubject?: string;
  channel: 'email' | 'sms';
  recipients: BulkNotificationRecipient[];
  variables?: Record<string, string>;
}



export interface SendBulkNotificationsResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  results: Array<{
    recipientId: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}


@Injectable()
export class SendBulkNotifications {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async execute(
    request: SendBulkNotificationsRequest,
  ): Promise<SendBulkNotificationsResponse> {
    const { templateId, templateContent, templateSubject, channel, recipients, variables } = request;

    let content = templateContent || '';
    let subject = templateSubject || 'Notification';

    // If templateId is provided, fetch template
    if (templateId) {
      const template = await this.prisma.emailTemplate.findUnique({
        where: { id: templateId },
      });

      if (template) {
        content = template.htmlBody || '';
        subject = template.subject || 'Notification';
      }
    }

    const results: Array<{
      recipientId: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];
    let sentCount = 0;
    let failedCount = 0;

    // Process each recipient
    for (const recipient of recipients) {
      try {
        // Replace variables in content
        let personalizedContent = content;
        let personalizedSubject = subject;
        
        const allVariables = { ...variables, ...recipient.variables };
        
        for (const [key, value] of Object.entries(allVariables)) {
          const placeholder = `{${key}}`;
          personalizedContent = personalizedContent.replace(
            new RegExp(placeholder, 'g'),
            value,
          );
          personalizedSubject = personalizedSubject.replace(
            new RegExp(placeholder, 'g'),
            value,
          );
        }

        // Send based on channel
        let result;
        
        if (channel === 'email' && recipient.email) {
          result = await this.emailService.sendEmail(
            recipient.email,
            personalizedSubject,
            personalizedContent,
          );
        } else if (channel === 'sms' && recipient.phone) {
          result = await this.smsService.sendSMS(
            recipient.phone,
            personalizedContent.replace(/<[^>]*>/g, ''), // Remove HTML tags for SMS
          );
        } else {
          // Skip if no contact info for the channel
          failedCount++;
          results.push({
            recipientId: recipient.recipientId,
            success: false,
            error: `No ${channel} contact information`,
          });
          continue;
        }

        // Record result
        if (result?.success) {
          sentCount++;
          results.push({
            recipientId: recipient.recipientId,
            success: true,
            messageId: result.messageId,
          });

          // Create notification record in database
          await this.prisma.notification.create({
            data: {
              recipientId: recipient.recipientId,
              content: personalizedContent,
              category: channel,
              channel,
              status: 'sent',
            },
          });
        } else {
          failedCount++;
          results.push({
            recipientId: recipient.recipientId,
            success: false,
            error: result?.error || 'Failed to send',
          });
        }
      } catch (error: any) {
        failedCount++;
        results.push({
          recipientId: recipient.recipientId,
          success: false,
          error: error.message || 'Unknown error',
        });
      }
    }

    return {
      success: sentCount > 0,
      sentCount,
      failedCount,
      results,
    };
  }
}