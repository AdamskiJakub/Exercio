import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const supportedLocales = ['pl', 'en'] as const;
    const rawLocale = request.query.locale;
    
    // Preserve existing session locale, only update if explicitly provided
    let locale = (request.session as any)?.oauth_locale || 'pl';
    if (typeof rawLocale === 'string' && supportedLocales.includes(rawLocale as typeof supportedLocales[number])) {
      locale = rawLocale;
      if (request.session) {
        request.session.oauth_locale = locale;
      }
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
      scope: ['email', 'public_profile'], // OAuth scopes must be set here, not in strategy
      failureRedirect: `${frontendUrl}/${locale}/login?error=oauth_failed`,
      session: false,
    };
  }
}