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
    // Load environment variables with defaults
    const host = this.configService.get<string>('MAIL_HOST') || 'mail5016.site4now.net';
    const port = Number(this.configService.get<number>('MAIL_PORT', 587));
    const user = this.configService.get<string>('MAIL_USER') || 'customerservice@birdviewinsurance.com';
    const pass = this.configService.get<string>('MAIL_PASS') || 'B!rdv!ew@2024';
    const fromName = this.configService.get<string>('MAIL_FROM_NAME') || 'Birdview Customer Care';
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS') || 'customerservice@birdviewinsurance.com';
    const secure = port === 465; // SSL if port 465

    // Log configuration
    this.logger.log('📧 Email Configuration:');
    this.logger.log(`   Host: ${host}`);
    this.logger.log(`   Port: ${port}`);
    this.logger.log(`   User: ${user}`);
    this.logger.log(`   From: ${fromName} <${fromAddress}>`);
    this.logger.log(`   Secure: ${secure}`);

    // Create transporter
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // allows self-signed certs (needed for Render)
      },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
    });

    // Test connection without throwing
    this.transporter.verify((err, success) => {
      if (err) {
        this.logger.warn(`❌ SMTP connection failed: ${err.message}`);
      } else {
        this.logger.log('✅ SMTP connection verified successfully');
      }
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME') || 'Birdview Customer Care';
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS') || 'customerservice@birdviewinsurance.com';

    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@birdviewinsurance.com>`;

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
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
      return { success: true, messageId: info.messageId, response: info.response };
    } catch (error: any) {
      this.logger.error(`❌ Email failed → ${to}`, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendBulk(
    emails: Array<{ to: string; subject: string; html: string }>
  ): Promise<Array<{ to: string; success: boolean; messageId?: string; error?: string }>> {
    const results: Array<{ to: string; success: boolean; messageId?: string; error?: string }> = [];
    for (const email of emails) {
      const result = await this.sendEmail(email.to, email.subject, email.html);
      results.push({ to: email.to, ...result });
    }
    return results;
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
