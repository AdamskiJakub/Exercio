import 'express-session';

declare module 'express-session' {
  interface SessionData {
    oauth_locale?: string;
  }
}
