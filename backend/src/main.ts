import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  try {
    const app = await NestFactory.create(AppModule);

    const origin = process.env.CORS_ORIGIN;
    if (origin) {
      app.enableCors({
        origin: [origin],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
      });
    }

    await app.listen(3001);
    console.log('🚀 Backend running on http://localhost:3001');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
}

bootstrap();
