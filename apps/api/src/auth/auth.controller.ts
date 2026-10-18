import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { User } from "@prisma/client";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { CurrentUser } from "./current-user.decorator.js";
import {
  AUTH_LOGIN_THROTTLE,
  AUTH_REGISTER_THROTTLE,
} from "./auth-throttle.js";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: AUTH_REGISTER_THROTTLE.limit,
      ttl: AUTH_REGISTER_THROTTLE.ttl,
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: AUTH_LOGIN_THROTTLE.limit,
      ttl: AUTH_LOGIN_THROTTLE.ttl,
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Returns the currently authenticated user. Useful for the frontend
   * to verify a stored JWT is still valid and to fetch fresh user
   * data on app load.
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: Omit<User, "hashedPassword">) {
    return user;
  }
}
