import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // THE MAGIC: This replaces {{key}} with value from the data object
  private parseTemplate(html: string, data: any): string {
    return html.replace(/{{(.*?)}}/g, (match, key) => {
      const value = data[key.trim()];
      return value !== undefined ? value : match; 
    });
  }

  async send(to: string, subject: string, templateHtml: string, data: any) {
    const finalHtml = this.parseTemplate(templateHtml, data);

    return await this.transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject: this.parseTemplate(subject, data), // Subject can be dynamic too!
      html: finalHtml,
    });
  }
}