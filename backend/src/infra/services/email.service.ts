import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailResult {
  success: boolean;
  messageId?: string;
  response?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Get values from .env with fallbacks
    const mailHost = this.configService.get<string>('MAIL_HOST', 'mail5016.site4now.net');
    const mailPort = this.configService.get<number>('MAIL_PORT', 465);
    const mailUser = this.configService.get<string>('MAIL_USER', 'customerservice@birdviewinsurance.com');
    const mailPass = this.configService.get<string>('MAIL_PASS', 'B!rdv!ew@2024');
    const mailFromName = this.configService.get<string>('MAIL_FROM_NAME', 'Birdview Customer Care');
    const mailFromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS', 'customerservice@birdviewinsurance.com');
    const mailSecure = this.configService.get<boolean>('MAIL_SECURE', true);

    console.log('📧 Email Configuration:');
    console.log(`   Host: ${mailHost}`);
    console.log(`   Port: ${mailPort}`);
    console.log(`   User: ${mailUser}`);
    console.log(`   From: ${mailFromName} <${mailFromAddress}>`);
    console.log(`   Secure: ${mailSecure}`);

    // Create transporter with environment variables
    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailSecure,
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      // Add proper HELO identification
      name: 'birdviewinsurance.com',
      // Connection pooling
      pool: true,
      maxConnections: 5,
      // Timeout settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Test connection on startup
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ SMTP connection failed:', errorMessage);
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
    // Get from address from config
    const mailFromName = this.configService.get<string>('MAIL_FROM_NAME', 'Birdview Customer Care');
    const mailFromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS', 'customerservice@birdviewinsurance.com');
    
    // Generate a proper Message-ID with your domain
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const messageId = `<${timestamp}.${randomId}@birdviewinsurance.com>`;
    
    try {
      console.log(`📧 Preparing email to: ${to}`);
      console.log(`📧 From: ${mailFromName} <${mailFromAddress}>`);
      
      const info = await this.transporter.sendMail({
        from: `"${mailFromName}" <${mailFromAddress}>`,
        to,
        subject,
        html,
        text: this.htmlToText(html),
        // Custom Message-ID to avoid @localhost
        messageId: messageId,
        // Additional headers for better deliverability
        headers: {
          'X-Mailer': 'Birdview Notification System v1.0',
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'Precedence': 'bulk',
          'Auto-Submitted': 'auto-generated',
          'List-Unsubscribe': `<mailto:${mailFromAddress}?subject=unsubscribe>`,
          'X-Originating-IP': '197.248.54.99',
        },
        // Date header
        date: new Date(),
      });

      console.log(`✅ Email sent successfully to: ${to}`);
      console.log(`📨 Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to send email to ${to}:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p\s*\/?>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}