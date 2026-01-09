import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
        bodyParser: true,
    });
    
    // Configurar raw body apenas para webhooks do Stripe
    app.use('/webhooks/stripe', json({ verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }}));
    
    // Garantir que JSON está sendo parseado para outras rotas
    app.use(json());
    
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
            const formattedErrors = errors.map((error) => ({
                field: error.property,
                constraints: Object.values(error.constraints || {}),
            }));
            console.error('Validation errors:', formattedErrors);
            return new BadRequestException({
                message: formattedErrors.map((e) => e.constraints.join(', ')).join('; '),
                errors: formattedErrors,
            });
        },
    }));
    
    app.useGlobalFilters(new HttpExceptionFilter());
    
    // Configure CORS
    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin) {
        app.enableCors({
            origin: corsOrigin.split(',').map(origin => origin.trim()),
            credentials: true,
        });
    } else if (process.env.NODE_ENV === 'production') {
        // In production, if CORS_ORIGIN is not set, disable CORS for security
        console.warn('WARNING: CORS_ORIGIN not set in production. CORS is disabled.');
    } else {
        // In development, allow all origins
        app.enableCors();
    }
    
    await app.listen(3003);
    console.log('API running on http://localhost:3003');
}
bootstrap().catch((err) => {
    console.error('Failed to start API:', err);
    process.exit(1);
});
