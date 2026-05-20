import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const locale = request.query.locale || 'pl';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      failureRedirect: `${frontendUrl}/${locale}/login?error=oauth_failed`,
      session: false,
    };
  }
}