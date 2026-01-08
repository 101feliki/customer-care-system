import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Controller('templates')
export class TemplatesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAll() {
    const templates = await this.prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { templates };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });
    return { template };
  }

  @Post()
  async create(@Body() data: any) {
    const template = await this.prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        htmlBody: data.htmlBody,
        textBody: data.textBody,
        variables: data.variables || [],
      },
    });
    return { template };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const template = await this.prisma.emailTemplate.update({
      where: { id },
      data,
    });
    return { template };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.prisma.emailTemplate.delete({
      where: { id },
    });
    return { success: true };
  }
}