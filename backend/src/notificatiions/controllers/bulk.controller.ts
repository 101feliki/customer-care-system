import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BulkEmailService } from '../../providers/email/bulk-email.service';

interface BulkEmailRequest {
  clients: Array<{
    name: string;
    email: string;
    product: string;
    [key: string]: any;
  }>;
  template?: string;
}

@Controller('bulk')
export class BulkController {
  constructor(private readonly bulkEmailService: BulkEmailService) {}

  @Post('emails')
  async sendBulkEmails(@Body() bulkRequest: BulkEmailRequest) {
    return await this.bulkEmailService.sendBulkEmails(
      bulkRequest.clients,
      bulkRequest.template || 'abandoned-cart'
    );
  }

  @Post('test')
  async sendTestEmail(@Body() testData: { email: string; name: string; product: string }) {
    const result = await this.bulkEmailService.sendBulkEmails([testData], 'test');
    return {
      message: 'Test email sent',
      result: result.details[0],
    };
  }
}