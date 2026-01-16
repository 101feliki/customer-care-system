import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/database/database.module';
import { HttpModule } from './infra/http/http.module';
import { AuthModule } from './infra/auth/auth.module';
import { RecipientsController } from './infra/http/controllers/recipients.controller';
import { TemplatesController } from './infra/http/controllers/templates.controller';
import { BulkNotificationsController } from './infra/http/controllers/bulk-notifications.controller';
import { EmailService } from './infra/services/email.service';
import { SmsService } from './infra/services/sms.service';
import { SendBulkNotifications } from './app/use-cases/send-bulk-notifications';
import { MailerService } from './infra/mail/mailer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // <-- must point to backend/.env
    }),
    HttpModule,
    DatabaseModule,
    AuthModule,
  ],
  controllers: [
    RecipientsController,
    TemplatesController,
    BulkNotificationsController,
  ],
  providers: [
    EmailService,
    SmsService,
    SendBulkNotifications,
    MailerService,
  ],
})
export class AppModule {}
