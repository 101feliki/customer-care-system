/* eslint-disable prettier/prettier */
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailResult {
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
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<number>('MAIL_PORT', 465));
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'Birdview Customer Care');
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');

    if (!host || !user || !pass || !fromAddress) {
      this.logger.error('❌ Missing required SMTP environment variables!');
      throw new InternalServerErrorException('Missing SMTP configuration');
    }

    this.logger.log('📧 Initializing EmailService...');
    this.logger.log(`   Host: ${host}`);
    this.logger.log(`   Port: ${port}`);
    this.logger.log(`   User: ${user}`);
    this.logger.log(`   From: ${fromName} <${fromAddress}>`);

    // Create nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL for 465, STARTTLS for 587
      auth: { user, pass },
      tls: { rejectUnauthorized: false }, // avoids Render TLS handshake issues
      pool: true,
      maxConnections: 3,
      connectionTimeout: 20000,
      socketTimeout: 20000,
    });

    // Only verify SMTP connection in non-production to prevent startup blocking
    if (process.env.NODE_ENV !== 'production') {
      this.transporter.verify((err, success) => {
        if (err) this.logger.warn('SMTP verify failed:', err.message);
        else this.logger.log('✅ SMTP connection verified (non-prod)');
      });
    }
  }

  // Send a single email with optional template data
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    templateData?: Record<string, any>
  ): Promise<EmailResult> {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'Birdview Customer Care');
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');

    // Replace template placeholders {{key}} in subject and html
    const finalSubject = this.parseTemplate(subject, templateData);
    const finalHtml = this.parseTemplate(html, templateData);

    // Custom Message-ID for proper deliverability
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@birdviewinsurance.com>`;

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject: finalSubject,
        html: finalHtml,
        text: this.htmlToText(finalHtml),
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
      const msg = error instanceof Error ? error.message : 'Unknown SMTP error';
      this.logger.error(`❌ Failed to send email → ${to}`, msg);
      return { success: false, error: msg };
    }
  }

  // Send multiple emails in bulk
  async sendBulk(
    emails: Array<{ to: string; subject: string; html: string; data?: Record<string, any> }>
  ): Promise<Array<EmailResult & { to: string }>> {
    const results: Array<EmailResult & { to: string }> = [];
    for (const email of emails) {
      const result = await this.sendEmail(email.to, email.subject, email.html, email.data);
      results.push({ to: email.to, ...result });
    }
    return results;
  }

  // Convert HTML content to plain text for fallback
  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p\s*\/?>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Simple template parser: replaces {{key}} with actual values
  private parseTemplate(template: string, data?: Record<string, any>): string {
    if (!data) return template;
    return template.replace(/{{(.*?)}}/g, (_, key) => {
      const value = data[key.trim()];
      return value !== undefined ? value : `{{${key}}}`;
    });
  }
}
