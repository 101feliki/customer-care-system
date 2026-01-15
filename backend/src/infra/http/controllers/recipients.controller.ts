import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards,
  Req 
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { JwtAuthGuard } from '../../http/guards/jwt-auth.guard'; // You need to create this or import it

@Controller('recipients')
export class RecipientsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // Add authentication to all endpoints
  async getAll() {
    const recipients = await this.prisma.recipient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { recipients };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string) {
    const recipient = await this.prisma.recipient.findUnique({
      where: { id },
    });
    return { recipient };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: any) {
    const recipient = await this.prisma.recipient.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || 'active', // Add status field
      },
    });
    return { recipient };
  }

  @Post('upload-csv')
  @UseGuards(JwtAuthGuard)
  async uploadCSV(@Body() body: { csvData: string }, @Req() req) {
    const { csvData } = body;
    
    // Parse CSV
    const lines = csvData.split('\n').filter(line => line.trim());
    let imported = 0;
    let skipped = 0;
    
    for (const line of lines) {
      // Skip header if it exists
      if (line.toLowerCase().includes('name,email')) continue;
      
      const [name, email, phone, status = 'active'] = line.split(',').map(field => field.trim());
      
      if (name && email) {
        try {
          await this.prisma.recipient.create({
            data: {
              name,
              email,
              phone: phone || null,
              status: status.toLowerCase() as any
            }
          });
          imported++;
        } catch (error: any) {
          // Skip duplicates
          if (error.code === 'P2002') { // Prisma unique constraint error
            console.log(`Skipping duplicate: ${email}`);
            skipped++;
          } else {
            console.error(`Error importing ${email}:`, error.message);
          }
        }
      }
    }
    
    return { 
      success: true, 
      message: `Imported ${imported} recipients, skipped ${skipped} duplicates`,
      imported,
      skipped
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    const recipient = await this.prisma.recipient.update({
      where: { id },
      data,
    });
    return { recipient };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.prisma.recipient.delete({
      where: { id },
    });
    return { success: true };
  }
}