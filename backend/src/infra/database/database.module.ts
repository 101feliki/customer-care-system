/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { NotificationsRepository } from '@app/repositories/notifications-repository';
import { UsersRepository } from '@app/repositories/users-repository'; // Add this
import { PrismaService } from './prisma/prisma.service';
import { PrismaNotificationsRepository } from './prisma/repositories/prisma-notifications-repository';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'; // Add this

@Module({
  providers: [
    PrismaService,
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationsRepository,
    },
    {
      provide: UsersRepository,  // Add this
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [
    PrismaService, 
    NotificationsRepository,
    UsersRepository,  // Add this
  ],
})
export class DatabaseModule {}