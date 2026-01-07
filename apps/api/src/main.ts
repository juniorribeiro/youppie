import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
    });
    
    // Middleware de JSON para todas as rotas (exceto webhooks)
    app.use((req: any, res, next) => {
        if (req.path.startsWith('/webhooks/stripe')) {
            return next();
        }
        if (req.headers['content-type']?.includes('application/json')) {
            json()(req, res, next);
        } else {
            next();
        }
    });
    
    // Configurar raw body apenas para webhooks do Stripe
    app.use('/webhooks/stripe', json({ verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }}));
    
    app.enableCors();
    await app.listen(3003);
    console.log('API running on http://localhost:3003');
}
bootstrap().catch((err) => {
    console.error('Failed to start API:', err);
});
