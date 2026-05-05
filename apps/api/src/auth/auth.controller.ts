import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    console.log('[AuthController] login dto:', JSON.stringify(dto));
    return this.authService.login(dto);
  }

  /**
   * Returns the currently authenticated user. Useful for the frontend
   * to verify a stored JWT is still valid and to fetch fresh user
   * data on app load.
   */
  @Get('me')
@UseGuards(JwtAuthGuard)
me(@CurrentUser() user: Omit<User, 'hashedPassword'>) {
  return user;
}
}