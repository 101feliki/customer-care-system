/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DatabaseModule } from './infra/database/database.module';
import { HttpModule } from './infra/http/http.module';
import { RecipientsController } from './infra/http/controllers/recipients.controller';
import { TemplatesController } from './infra/http/controllers/templates.controller';
import { AuthModule } from './infra/auth/auth.module';

import { EmailService } from './infra/services/email.service';
import { SmsService } from './infra/services/sms.service';
import { MailerService } from './infra/mail/mailer.service'; // Add this import
import { SendBulkNotifications } from './app/use-cases/send-bulk-notifications';
import { BulkNotificationsController } from './infra/http/controllers/bulk-notifications.controller';

@Module({
  imports: [
    HttpModule, 
    DatabaseModule, 
    AuthModule
  ],
  controllers: [
    RecipientsController, 
    TemplatesController, 
    BulkNotificationsController
  ],
  providers: [
    EmailService, 
    SmsService, 
    MailerService, // Register the MailerService here
    SendBulkNotifications
  ],
  // Export MailerService if HttpModule needs it and is defined in another file
  exports: [MailerService] 
})
export class AppModule {}