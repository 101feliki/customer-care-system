import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Controller('recipients')
export class RecipientsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAll() {
    const recipients = await this.prisma.recipient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { recipients };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const recipient = await this.prisma.recipient.findUnique({
      where: { id },
    });
    return { recipient };
  }

  @Post()
  async create(@Body() data: any) {
    const recipient = await this.prisma.recipient.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });
    return { recipient };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const recipient = await this.prisma.recipient.update({
      where: { id },
      data,
    });
    return { recipient };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.prisma.recipient.delete({
      where: { id },
    });
    return { success: true };
  }
}