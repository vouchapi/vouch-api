import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import helmet from '@fastify/helmet';

// somewhere in your initialization file
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.register(helmet);
  await app.listen(process.env.PORT ?? 8080, '0.0.0.0').then(() => {
    console.log(`Server is running on ${process.env.PORT ?? 8080}`);
  });
}
bootstrap();
