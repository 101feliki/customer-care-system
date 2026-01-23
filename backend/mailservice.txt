/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    const fromEmail = process.env.FROM_EMAIL?.trim() || user;

    this.logger.log('🚀 MailerService initializing...');
    this.logger.log(`   SMTP_HOST   = ${host}`);
    this.logger.log(`   SMTP_PORT   = ${port}`);
    this.logger.log(`   SMTP_USER   = ${user}`);
    this.logger.log(`   FROM_EMAIL  = ${fromEmail}`);

    if (!host || !port || !user || !pass) {
      throw new InternalServerErrorException('❌ Missing SMTP configuration');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // SSL for 465, TLS otherwise
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      pool: true,
      maxConnections: 3,
    });

    this.transporter.verify((err, success) => {
      if (err) {
        this.logger.warn('SMTP VERIFY ERROR:', err.message);
      } else {
        this.logger.log('✅ SMTP connection ready');
      }
    });
  }

  // This matches your controller call
  async send(
    to: string,
    subject: string,
    html: string,
    data?: Record<string, any>,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Replace {{key}} in template if data is provided
    const finalHtml = data ? this.parseTemplate(html, data) : html;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to,
        subject,
        html: finalHtml,
        text: this.htmlToText(finalHtml),
      });

      this.logger.log(`📧 Email sent → ${to} | Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email → ${to}`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Bulk send emails
  async sendBulk(
    emails: Array<{ to: string; subject: string; html: string; data?: Record<string, any> }>,
  ) {
    const results: Array<{ to: string; success: boolean; messageId?: string; error?: string }> = [];
    for (const email of emails) {
      const result = await this.send(email.to, email.subject, email.html, email.data);
      results.push({ to: email.to, ...result });
    }
    return results;
  }

  private parseTemplate(html: string, data: Record<string, any>): string {
    return html.replace(/{{(.*?)}}/g, (_, key) => {
      const value = data[key.trim()];
      return value !== undefined ? value : '';
    });
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
