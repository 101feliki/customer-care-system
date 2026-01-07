import { Injectable } from '@nestjs/common';

// Export the interfaces so they can be used elsewhere
export interface Client {
  name: string;
  email: string;
  product: string;
  id?: string;
}

export interface EmailResult {
  clientId: string;
  status: 'sent' | 'failed';
  email: string;
  error?: string;
  timestamp: Date;
}

export interface BulkEmailResponse {
  total: number;
  sent: number;
  failed: number;
  details: EmailResult[];
}

@Injectable()
export class BulkEmailService {
  
  private generateEmailTemplate(client: Client): string {
    // ... keep your existing template code ...
    return `...`; // Your template HTML
  }

  private generateTextEmail(client: Client): string {
    // ... keep your existing text email code ...
    return `...`; // Your text email
  }

  async sendBulkEmails(clients: Client[], templateName: string = 'abandoned-cart'): Promise<BulkEmailResponse> {
    const results: EmailResult[] = [];
    
    for (const client of clients) {
      try {
        console.log(`Would send email to: ${client.email}`);
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          results.push({
            clientId: client.id || client.email,
            status: 'sent',
            email: client.email,
            timestamp: new Date(),
          });
        } else {
          throw new Error('Simulated email sending failure');
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: unknown) {
        results.push({
          clientId: client.id || client.email,
          status: 'failed',
          email: client.email,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });
      }
    }

    return {
      total: clients.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      details: results,
    };
  }

  async sendTestEmail(testData: { email: string; name: string; product: string }) {
    const result = await this.sendBulkEmails([testData], 'test');
    return {
      message: 'Test email simulated',
      result: result.details[0],
    };
  }
}