import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT Auth Guard
 * Allows both authenticated and anonymous requests
 * If JWT token is present and valid, req.user will be populated
 * If no token or invalid token, req.user will be undefined (but request continues)
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Return user if authenticated, undefined if not
    // Don't throw error for unauthenticated requests
    return user;
  }
}
