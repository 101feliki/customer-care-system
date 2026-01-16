/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
 
@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    // Debugging: print env
    console.log('🚀 MailerService initializing...');
    console.log('🚀 SMTP_HOST   =', process.env.SMTP_HOST);
    console.log('🚀 SMTP_PORT   =', process.env.SMTP_PORT);
    console.log('🚀 SMTP_USER   =', process.env.SMTP_USER);
    console.log('🚀 FROM_EMAIL  =', process.env.FROM_EMAIL);

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      throw new InternalServerErrorException('❌ Missing SMTP configuration in .env!');
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim(),
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // SSL if port 465
      auth: {
        user: process.env.SMTP_USER?.trim(),
        pass: process.env.SMTP_PASS?.trim(),
      },
      logger: true,   // logs SMTP commands
      debug: true,    // prints detailed server responses
      tls: {
        rejectUnauthorized: false, // allows self-signed certs
      },
      // Remove pooling for now to avoid dropped connections
      // pool: true,
      // maxConnections: 1,
      // maxMessages: 5,
    });
    

    this.transporter.verify((err, success) => {
      if (err) {
        console.error('SMTP VERIFY ERROR:', err.message);
      } else {
        console.log('✅ SMTP connection ready');
      }
    });
  }

  // Replaces {{key}} in templates with actual values
  private parseTemplate(html: string, data: Record<string, any>): string {
    return html.replace(/{{(.*?)}}/g, (match, key) => {
      const value = data[key.trim()];
      return value !== undefined ? value : match;
    });
  }

  async send(
    to: string,
    subject: string,
    templateHtml: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const finalHtml = this.parseTemplate(templateHtml, data);

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_USER, // must match SMTP user for Site4Now
        to,
        subject: this.parseTemplate(subject, data),
        html: finalHtml,
      });

      console.log('📧 Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  // Bulk sending
  async sendBulk(
  emails: Array<{ to: string; subject: string; templateHtml: string; data: Record<string, any> }>
) {
  const results: Array<{ to: string; success: boolean; messageId?: string; error?: string }> = [];

  for (const email of emails) {
    const result = await this.send(email.to, email.subject, email.templateHtml, email.data);
    results.push({ to: email.to, ...result });
  }

  return results;
} 
}

