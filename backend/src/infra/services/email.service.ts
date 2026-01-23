import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<number>('MAIL_PORT', 587));
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');

    if (!host || !user || !pass || !fromAddress) {
      this.logger.error('❌ Missing SMTP environment variables');
      return; // DO NOT crash the app
    }

    this.logger.log(`📧 SMTP Host: ${host}`);
    this.logger.log(`📧 SMTP Port: ${port}`);
    this.logger.log(`📧 SMTP User: ${user}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // ✅ REQUIRED for 587
      auth: {
        user,
        pass,
      },
      requireTLS: true, // ✅ STARTTLS
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<EmailResult> {
    if (!this.transporter) {
      return { success: false, error: 'SMTP not initialized' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM_ADDRESS'),
        to,
        subject,
        html,
      });

      this.logger.log(`✅ Email sent → ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      this.logger.error(`❌ Email failed → ${to}`, error.message);
      return { success: false, error: error.message };
    }
  }
}
