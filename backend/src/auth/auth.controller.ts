import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, access_token } = await this.authService.register(dto);
    res.cookie('access_token', access_token, COOKIE_OPTIONS);
    return { user };
  }

  @Post('register-instructor')
  @HttpCode(HttpStatus.CREATED)
  async registerInstructor(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, access_token } = await this.authService.registerInstructor(dto);
    res.cookie('access_token', access_token, COOKIE_OPTIONS);
    return { user };
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
}
