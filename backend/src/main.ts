import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { randomBytes } from 'crypto';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import session from 'express-session';
import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';

const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (raw) {
    return raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return [process.env.FRONTEND_URL || DEFAULT_CORS_ORIGIN];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  // ── Security Headers (Helmet) ──────────────────────────────────────────────
  // Must be registered before session/cookie middleware to ensure headers are set.
  // Helmet 8.x sets these defaults:
  //   - Content-Security-Policy (CSP)
  //   - Cross-Origin-Opener-Policy: same-origin
  //   - Cross-Origin-Resource-Policy: same-origin
  //   - Origin-Agent-Cluster: ?1
  //   - Referrer-Policy: no-referrer
  //   - Strict-Transport-Security (HSTS)
  //   - X-Content-Type-Options: nosniff
  //   - X-DNS-Prefetch-Control: off
  //   - X-Download-Options: noopen
  //   - X-Frame-Options: SAMEORIGIN
  //   - X-Permitted-Cross-Domain-Policies: none
  //   - X-XSS-Protection: 0 (disables the broken XSS auditor)
  //
  // We customise CSP to allow:
  //   - Google OAuth redirects (accounts.google.com)
  //   - Facebook OAuth redirects (www.facebook.com)
  //   - Cloudflare R2 (*.r2.cloudflarestorage.com)
  //   - Google Analytics (www.googletagmanager.com, *.google-analytics.com)
  //   - Resend webhook callbacks (api.resend.com)
  //   - The frontend origin for form submissions
  //   - 'unsafe-inline' for styles (NestJS Swagger UI, etc.)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://accounts.google.com',
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: [
            "'self'",
            'data:',
            'https://*.r2.cloudflarestorage.com',
            'https://www.google-analytics.com',
            'https://www.facebook.com',
          ],
          connectSrc: [
            "'self'",
            'https://api.exercio.app',
            'https://accounts.google.com',
            'https://www.facebook.com',
            'https://www.google-analytics.com',
            'https://analytics.google.com',
            'https://api.resend.com',
          ],
          frameSrc: [
            "'self'",
            'https://accounts.google.com',
            'https://www.facebook.com',
          ],
          formAction: [
            "'self'",
            process.env.FRONTEND_URL || 'http://localhost:3000',
            ...(process.env.CORS_ORIGINS
              ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
              : []),
          ],
          upgradeInsecureRequests:
            process.env.NODE_ENV === 'production' ? [] : null,
        },
      },

      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },

      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

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
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 3600000,
      },
    }),
  );

  app.use(cookieParser());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const { doubleCsrfProtection } = doubleCsrf({
    getSecret: (req?) => {
      if (!req) {
        return randomBytes(32).toString('hex');
      }
      const sessionSecret = (req.session as any)?.csrfSecret;
      if (!sessionSecret) {
        const secret = randomBytes(32).toString('hex');
        if (req.session) {
          (req.session as any).csrfSecret = secret;
        }
        return secret;
      }
      return sessionSecret;
    },
    getSessionIdentifier: (req) => req.sessionID,
    cookieName: 'x-csrf-token',
    cookieOptions: {
      httpOnly: false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    size: 64,
    hmacAlgorithm: 'sha256',
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
    skipCsrfProtection: (req) => {
      // Skip CSRF for JWT-authenticated requests.
      // JWT can be sent via Authorization header (API clients) or
      // via httpOnly cookie (browser, set by /auth/login).
      if (
        req.headers.authorization?.startsWith('Bearer ') ||
        req.cookies?.access_token
      ) {
        return true;
      }

      if (
        req.path?.startsWith('/auth/google/callback') ||
        req.path?.startsWith('/auth/facebook/callback')
      ) {
        return true;
      }

      if (
        req.path === '/auth/csrf-token' ||
        req.path === '/auth/login' ||
        req.path === '/auth/request-password-reset' ||
        req.path === '/auth/reset-password'
      ) {
        return true;
      }
      return false;
    },
    errorConfig: {
      statusCode: 403,
      message:
        'Invalid or missing CSRF token. This could be a cross-site request forgery attempt.',
      code: 'CSRF_TOKEN_INVALID',
    },
  });

  // Apply CSRF protection for state-changing requests.
  // The skipCsrfProtection callback in doubleCsrf config handles:
  //   - JWT-authenticated requests (Bearer token)
  //   - OAuth callbacks
  //   - /auth/csrf-token endpoint
  // The ignoredMethods config skips GET/HEAD/OPTIONS.
  // The CSRF token is generated on-demand by the /auth/csrf-token endpoint
  // and returned in the response body for the frontend to send back.
  app.use((req: any, res: any, next: any) => {
    if (!req.sessionID) {
      return next();
    }
    doubleCsrfProtection(req, res, next);
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
