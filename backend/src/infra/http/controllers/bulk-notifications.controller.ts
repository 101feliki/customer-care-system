import { Body, Controller, Post } from '@nestjs/common';
import { SendBulkNotifications } from '@app/use-cases/send-bulk-notifications';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SendBulkNotificationsResponse } from '@app/use-cases/send-bulk-notifications'; 
interface BulkRecipient {
  recipientId: string;
  email?: string;
  phone?: string;
  variables?: Record<string, string>;
}

@Controller('bulk-notifications')
export class BulkNotificationsController {
  constructor(
    private sendBulkNotifications: SendBulkNotifications,
    private prisma: PrismaService,
  ) {}

  @Post('send')
  async sendBulk(@Body() body: any): Promise<SendBulkNotificationsResponse> {
    const result = await this.sendBulkNotifications.execute({
      templateId: body.templateId,
      templateContent: body.templateContent,
      templateSubject: body.templateSubject,
      channel: body.channel,
      recipients: body.recipients as BulkRecipient[],
      variables: body.variables,
    });

    return result;
  }

  @Post('send-to-all')
  async sendToAll(@Body() body: any) {
    // Get all recipients from database
    const dbRecipients = await this.prisma.recipient.findMany();
    
    // Transform to BulkRecipient format
    const recipients: BulkRecipient[] = dbRecipients.map(recipient => ({
      recipientId: recipient.id,
      email: recipient.email,
      phone: recipient.phone || undefined,
      variables: {}, // Add any recipient-specific variables here
    }));

    const result = await this.sendBulkNotifications.execute({
      templateId: body.templateId,
      channel: body.channel,
      recipients,
      variables: body.variables,
    });

    return result;
  }

  @Post('send-by-csv')
  async sendByCSV(@Body() body: any) {
    // Parse CSV data (frontend should send parsed JSON)
    const csvRecipients: BulkRecipient[] = body.csvData.map((row: any) => ({
      recipientId: row.id || `csv-${Math.random().toString(36).substr(2, 9)}`,
      email: row.email,
      phone: row.phone,
      variables: row.variables || {},
    }));

    const result = await this.sendBulkNotifications.execute({
      templateId: body.templateId,
      templateContent: body.templateContent,
      templateSubject: body.templateSubject,
      channel: body.channel,
      recipients: csvRecipients,
      variables: body.variables,
    });

    return result;
  }
}