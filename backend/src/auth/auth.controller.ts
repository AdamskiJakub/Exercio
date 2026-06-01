import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailDto, RequestPasswordResetDto, ResetPasswordDto, ResendVerificationDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import type { Request, Response } from 'express';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('register-instructor')
  @HttpCode(HttpStatus.CREATED)
  async registerInstructor(@Body() dto: RegisterDto) {
    return await this.authService.registerInstructor(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, access_token } = await this.authService.login(dto);
    res.cookie('access_token', access_token, COOKIE_OPTIONS);
    return { user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res);
  }

  private async handleOAuthCallback(req: Request, res: Response) {
    const oauthUser = req.user as any;
    const locale = req.session?.oauth_locale || 'pl';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    try {
      const { access_token } = await this.authService.findOrCreateOAuthUser({
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        avatarUrl: oauthUser.avatarUrl,
      });

      res.cookie('access_token', access_token, COOKIE_OPTIONS);
      res.redirect(`${frontendUrl}/${locale}/auth/callback?success=true`);
    } catch (error) {
      const errorMessage = error?.message || 'oauth_failed';
      res.redirect(`${frontendUrl}/${locale}/login?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  // ============================================
  // EMAIL VERIFICATION & PASSWORD RESET
  // ============================================

  @Post('send-verification')
  @HttpCode(HttpStatus.OK)
  async sendVerification(
    @Body() dto: ResendVerificationDto,
    @Query('lang') lang?: string,
  ) {
    const language = (lang === 'en' ? 'en' : 'pl') as 'pl' | 'en';
    return this.authService.sendVerificationCode(dto.email, language);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token } = await this.authService.verifyEmail(dto.email, dto.code);
    res.cookie('access_token', access_token, COOKIE_OPTIONS);
    return { user };
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
    @Query('lang') lang?: string,
  ) {
    const language = (lang === 'en' ? 'en' : 'pl') as 'pl' | 'en';
    return this.authService.requestPasswordReset(dto.email, language);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token } = await this.authService.resetPassword(
      dto.code,
      dto.newPassword,
    );
    res.cookie('access_token', access_token, COOKIE_OPTIONS);
    return { user };
  }
}
