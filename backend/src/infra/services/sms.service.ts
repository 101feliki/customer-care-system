import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface SMSResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface BulkSMSResult {
  to: string;
  success: boolean;
  data?: any;
  error?: string;
}

@Injectable()
export class SmsService {
  private readonly baseUrl = 'https://api.textsms.co.ke/api/v3';
  private readonly senderId = process.env.TEXTSMS_SENDER_ID || 'BIRDVIEW';
  private readonly apiKey = process.env.TEXTSMS_API_KEY;
  private readonly partnerId = process.env.TEXTSMS_PARTNER_ID;

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/sendsms`,
        {
          sender_id: this.senderId,
          to,
          message,
          partner_id: this.partnerId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkSMS(messages: Array<{to: string, message: string}>): Promise<BulkSMSResult[]> {
    const results: BulkSMSResult[] = [];
    
    for (const sms of messages) {
      const result = await this.sendSMS(sms.to, sms.message);
      results.push({
        to: sms.to,
        success: result.success,
        data: result.data,
        error: result.error,
      });
    }
    
    return results;
  }

  async getBalance(): Promise<SMSResult> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/balance`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}