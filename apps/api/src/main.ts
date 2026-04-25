import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use((req: Request, res: Response, next: () => void) => {
    if (req.path === '/') {
      return res.json({ status: 'ok', message: 'Task Monitoring API', version: '1.0', docs: '/api/docs' });
    } else if (req.path === '/health') {
      return res.json({ status: 'ok', message: 'Task Monitoring API is running', timestamp: new Date().toISOString() });
    }
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API for task management system')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.API_PORT || '3000', 10);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();