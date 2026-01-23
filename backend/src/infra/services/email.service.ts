/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/* ===============================
   Types
================================ */

export interface EmailResult {
  success: boolean;
  messageId?: string;
  response?: string;
  error?: string;
}

export interface BulkEmailResult extends EmailResult {
  to: string;
}

/* ===============================
   Service
================================ */

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<number>('MAIL_PORT', 587));
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    const fromName =
      this.configService.get<string>('MAIL_FROM_NAME') || 'Customer Care';
    const fromAddress =
      this.configService.get<string>('MAIL_FROM_ADDRESS') || user;

    const secure = port === 465;

    /* ===============================
       Validation
    ================================ */

    if (!host || !user || !pass) {
      throw new Error(
        '❌ Missing MAIL_HOST, MAIL_USER or MAIL_PASS environment variables',
      );
    }

    /* ===============================
       Logs (safe)
    ================================ */

    this.logger.log('📧 Email Service initializing...');
    this.logger.log(`   Host: ${host}`);
    this.logger.log(`   Port: ${port}`);
    this.logger.log(`   User: ${user}`);
    this.logger.log(`   From: ${fromName} <${fromAddress}>`);
    this.logger.log(`   Secure: ${secure}`);

    /* ===============================
       Transporter
    ================================ */

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // Required on Render
      },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
    });

    /* ===============================
       Verify (non-blocking)
    ================================ */

    this.transporter.verify((err) => {
      if (err) {
        this.logger.warn(`❌ SMTP verify failed: ${err.message}`);
      } else {
        this.logger.log('✅ SMTP connection verified');
      }
    });
  }

  /* ===============================
     Single Email
  ================================ */

  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get(
          'MAIL_FROM_ADDRESS',
        )}>`,
        to,
        subject,
        html,
        text: this.htmlToText(html),
        headers: {
          'X-Mailer': 'Customer Care System',
          'Auto-Submitted': 'auto-generated',
        },
      });

      this.logger.log(`📨 Email sent → ${to}`);
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

  /* ===============================
     Bulk Email (FIXED TYPES)
  ================================ */

  async sendBulk(
    emails: Array<{ to: string; subject: string; html: string }>,
  ): Promise<BulkEmailResult[]> {
    const results: BulkEmailResult[] = [];

    for (const email of emails) {
      const result = await this.sendEmail(
        email.to,
        email.subject,
        email.html,
      );

      results.push({
        to: email.to,
        ...result,
      });
    }

    return results;
  }

  /* ===============================
     Utils
  ================================ */

  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p\s*\/?>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
