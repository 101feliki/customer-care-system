import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailResult {
  success: boolean;
  messageId?: string;
  response?: string;
  error?: string;
}

interface BulkEmailResult {
  to: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_USERNAME,
        to,
        subject,
        html,
        text,
      });
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkEmails(emails: Array<{to: string, subject: string, html: string}>): Promise<BulkEmailResult[]> {
    const results: BulkEmailResult[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email.to, email.subject, email.html);
      results.push({
        to: email.to,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });
    }
    
    return results;
  }
}