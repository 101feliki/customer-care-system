import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete,
  ValidationPipe,
  UsePipes,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

// DTOs for validation
class CreateTemplateDto {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables?: string[];
}

class UpdateTemplateDto {
  name?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  variables?: string[];
}

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
  async create(@Body() data: CreateTemplateDto) {
    // Validate required fields
    if (!data.subject || !data.htmlBody) {
      throw new BadRequestException('Subject and htmlBody are required');
    }

    const template = await this.prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        htmlBody: data.htmlBody,
        textBody: data.textBody || null,
        variables: data.variables || [],
      },
    });
    return { template };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateTemplateDto) {
    const template = await this.prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.subject && { subject: data.subject }),
        ...(data.htmlBody && { htmlBody: data.htmlBody }),
        ...(data.textBody !== undefined && { textBody: data.textBody }),
        ...(data.variables && { variables: data.variables }),
      },
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