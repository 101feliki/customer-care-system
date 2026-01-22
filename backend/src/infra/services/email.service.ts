import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = Number(this.configService.get<number>('MAIL_PORT', 465));
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');
    const mailFromName = this.configService.get<string>('MAIL_FROM_NAME', 'Birdview Customer Care');
    const mailFromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');

    if (!mailHost || !mailUser || !mailPass || !mailFromAddress) {
      this.logger.error('❌ Missing required mail environment variables');
      return;
    }

    this.logger.log('📧 Email Configuration Loaded');
    this.logger.log(`   Host: ${mailHost}`);
    this.logger.log(`   Port: ${mailPort}`);
    this.logger.log(`   User: ${mailUser}`);
    this.logger.log(`   From: ${mailFromName} <${mailFromAddress}>`);

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465, // IMPORTANT for SSL
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false, // prevents Render TLS handshake issues
      },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 20000,
      socketTimeout: 20000,
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
    const mailFromName = this.configService.get<string>('MAIL_FROM_NAME', 'Birdview Customer Care');
    const mailFromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');

    const messageId = `<${Date.now()}.${Math.random()
      .toString(36)
      .substring(2)}@birdviewinsurance.com>`;

    try {
      const info = await this.transporter.sendMail({
        from: `"${mailFromName}" <${mailFromAddress}>`,
        to,
        subject,
        html,
        text: this.htmlToText(html),
        messageId,
        headers: {
          'X-Mailer': 'Birdview Notification System',
          'Auto-Submitted': 'auto-generated',
          'Precedence': 'bulk',
        },
      });

      this.logger.log(`✅ Email sent → ${to}`);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error: any) {
      this.logger.error(`❌ Email failed → ${to}`, error.message);
      return {
        success: false,
        error: error.message,
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
