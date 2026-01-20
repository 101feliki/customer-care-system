// admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from '../src/infra/http/controllers/admin.controller';
import { AdminService } from '../src/infra/services/admin.services';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';
import { AuthModule } from '../src/infra/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService, // Add PrismaService here
  ],
  exports: [AdminService],
})
export class AdminModule {}