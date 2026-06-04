import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
 
  // Trust proxy in production (required for secure cookies behind reverse proxy)
  // Without this, Express will see req.protocol='http' even when user connects via HTTPS
  // This breaks secure cookies and OAuth sessions won't persist
  // Enable when deploying behind Nginx/Cloudflare/etc.
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Validate required environment variables
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  // Configure session middleware for OAuth state management
  // NOTE: Using in-memory store for development. For production, configure a persistent store:
  // - Redis: connect-redis (recommended for multi-instance deployments)
  // - PostgreSQL: connect-pg-simple
  // - MongoDB: connect-mongo
  // See: https://www.npmjs.com/package/express-session#compatible-session-stores
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        sameSite: 'lax', // CSRF protection
        maxAge: 3600000, // 1 hour
      },
    }),
  );

  // Enable cookie parsing
  app.use(cookieParser());

   useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
