/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SendNotification } from '../../app/use-cases/send-notification';
import { DatabaseModule } from '../database/database.module';
import { NotificationsController } from './controllers/notifications.controller';
import { CancelNotification } from '@app/use-cases/cancel-notification';
import { CountRecipientNotifications } from '@app/use-cases/count-recipient-notifications';
import { GetRecipientNotifications } from '@app/use-cases/get-recipient-notifications';
import { ReadNotification } from '@app/use-cases/read-notification';
import { UnreadNotification } from '@app/use-cases/unread-notification';
import { GetAllNotifications } from '@app/use-cases/get-all-notifications';
import { MailerService } from '../mail/mailer.service'; // Direct import

@Module({
  imports: [DatabaseModule], // ONLY DatabaseModule, NOT AppModule
  controllers: [NotificationsController],
  providers: [
    SendNotification,
    CancelNotification,
    CountRecipientNotifications,
    GetRecipientNotifications,
    ReadNotification,
    UnreadNotification,
    GetAllNotifications,
    MailerService, // Add MailerService here
  ],
})
export class HttpModule {}