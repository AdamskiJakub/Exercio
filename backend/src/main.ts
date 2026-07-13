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
          ],
          upgradeInsecureRequests:
            process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      // HSTS: enforce HTTPS for 1 year, include subdomains, preload
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Referrer-Policy: strict-origin-when-cross-origin (less strict than Helmet's default 'no-referrer')
      // Allows referrer to be sent for same-origin requests and to HTTPS origins,
      // which is needed for OAuth flows and analytics
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      // Cross-Origin-Resource-Policy: cross-origin
      // The API and frontend are on different origins (localhost:3001 vs localhost:3000 in dev,
      // api.exercio.app vs exercio.app in prod). Images and other static assets served by the
      // backend need to be loadable cross-origin by the frontend.
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

  // ── Enable CORS (must be before CSRF middleware) ────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // ── CSRF Protection (Double Submit Cookie) ─────────────────────────────────
  // Uses the Double Submit Cookie pattern:
  //   1. Server generates a CSRF token and sets it as a non-httpOnly cookie
  //   2. Client reads the cookie and sends the token back in X-CSRF-Token header
  //   3. Server validates the header matches the cookie value
  //
  // IMPORTANT: CSRF protection is ONLY applied to routes that need it.
  // We use a custom middleware that checks:
  //   - Skip GET/HEAD/OPTIONS (safe methods)
  //   - Skip requests with JWT Bearer token (not vulnerable to CSRF)
  //   - Skip OAuth callback routes (external redirects)
  //   - Skip /auth/csrf-token endpoint (frontend needs to fetch token)
  //   - For all other mutating requests: validate X-CSRF-Token header
  //
  // This approach avoids the issue where csrf-csrf throws on requests without
  // a session (saveUninitialized: false means no session for anonymous users).
  const { invalidCsrfTokenError, generateCsrfToken, doubleCsrfProtection } =
    doubleCsrf({
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
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
      size: 64,
      hmacAlgorithm: 'sha256',
      ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
      getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
      skipCsrfProtection: (req) => {
        // Skip if JWT Bearer token is present (not vulnerable to CSRF)
        if (req.headers.authorization?.startsWith('Bearer ')) {
          return true;
        }
        // Skip OAuth callback routes (external redirects)
        if (
          req.path?.startsWith('/auth/google/callback') ||
          req.path?.startsWith('/auth/facebook/callback')
        ) {
          return true;
        }
        // Skip CSRF token endpoint (frontend needs to fetch token)
        if (req.path === '/auth/csrf-token') {
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

  // ── CSRF Token Middleware ─────────────────────────────────────────────────────
  // Sets the CSRF cookie on every response so the frontend always has a token.
  // The token is regenerated on each request for simplicity.
  // csrf-csrf 4.x does NOT set the cookie automatically - we must call
  // generateCsrfToken() explicitly.
  app.use((req: any, res: any, next: any) => {
    // Only set CSRF cookie if the request has a session (i.e., the user has
    // visited before). For anonymous users without a session, we skip CSRF
    // entirely because there are no cookies to exploit.
    if (req.sessionID) {
      try {
        generateCsrfToken(req, res, { overwrite: true });
      } catch {
        // If token generation fails (e.g., missing session), just continue
      }
    }
    next();
  });

  // Apply CSRF protection middleware ONLY for mutating requests that need it.
  // We wrap doubleCsrfProtection in a custom handler that safely skips
  // requests without a session (anonymous users don't need CSRF).
  app.use((req: any, res: any, next: any) => {
    // Skip safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    // Skip if JWT Bearer token is present
    if (req.headers.authorization?.startsWith('Bearer ')) {
      return next();
    }
    // Skip OAuth callback routes
    if (
      req.path?.startsWith('/auth/google/callback') ||
      req.path?.startsWith('/auth/facebook/callback')
    ) {
      return next();
    }
    // Skip CSRF token endpoint
    if (req.path === '/auth/csrf-token') {
      return next();
    }
    // For all other mutating requests, apply CSRF protection
    // If there's no session, create one so csrf-csrf can work
    if (!req.sessionID) {
      return next(); // No session = no CSRF risk (no cookies to exploit)
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
