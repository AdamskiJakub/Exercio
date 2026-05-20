import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
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