import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors({
  origin: [
    'http://localhost:3000',       // local dev
    'http://localhost:5173',       // vite dev
    'https://customer-care-system-6.onrender.com' // deployed frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});


 const port = process.env.PORT || 3001
await app.listen(port);
}
bootstrap();
