import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnauthorizedExceptionFilter } from 'utils/unauthorized-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


    const config = new DocumentBuilder()
    .setTitle('Matching App Backend')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addTag('users') // optional
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document); // Swagger available at /api

  app.enableCors({

  })
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  await app.listen(3000);
}
bootstrap();
