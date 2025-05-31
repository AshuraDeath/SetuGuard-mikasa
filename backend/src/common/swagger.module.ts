import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthController } from '../modules/auth/auth.controller';
import { DomainCheckController } from '../modules/domain-check/domain-check.controller';
import { RootController } from './root.controller';

export function setupSwagger(app) {
  const config = new DocumentBuilder()
    .setTitle('SetuGuard API')
    .setDescription('SetuGuard Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header'
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    include: [
      AuthController,
      DomainCheckController,
      RootController
    ],
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'SetuGuard API Documentation',
  });

  // Add redirect from /api/docs to /docs
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/api/docs', (req, res) => {
    res.redirect('/docs');
  });
}
