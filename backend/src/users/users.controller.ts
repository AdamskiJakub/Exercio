import {
  Controller,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdatePasswordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../types/express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(@Body() dto: UpdateUserDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.usersService.updateUser(user.id, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Body() dto: UpdatePasswordDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.usersService.updatePassword(user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.usersService.deleteAccount(user.id);
  }
}
