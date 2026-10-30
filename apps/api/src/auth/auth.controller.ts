import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import type { User } from "@prisma/client";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { CurrentUser } from "./current-user.decorator.js";
import {
  AUTH_LOGIN_THROTTLE,
  AUTH_REGISTER_THROTTLE,
  AUTH_REFRESH_THROTTLE,
  AUTH_FORGOT_PASSWORD_THROTTLE,
  AUTH_RESET_PASSWORD_THROTTLE,
} from "./auth-throttle.js";
import { AuthOriginGuard } from "./auth-origin.guard.js";
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  setRefreshCookie,
} from "./refresh-cookie.js";
import { ForgotPasswordDto } from "./dto/forgot-password.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";
import { PasswordResetService } from "./password-reset.service.js";
import { resolveRegistrationMode } from "./registration-mode.js";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(PasswordResetService)
    private readonly passwordReset: PasswordResetService,
  ) {}

  @Get("registration-mode")
  registrationMode() {
    try {
      return { mode: resolveRegistrationMode() };
    } catch {
      throw new ServiceUnavailableException({
        message: "Registration is temporarily unavailable",
        code: "AUTH_REGISTRATION_MODE_UNAVAILABLE",
      });
    }
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: AUTH_REGISTER_THROTTLE.limit,
      ttl: AUTH_REGISTER_THROTTLE.ttl,
    },
  })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto, this.metaFrom(req));
    setRefreshCookie(res, result.refresh.plaintext);
    return { accessToken: result.accessToken, user: result.user };
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
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, this.metaFrom(req));
    setRefreshCookie(res, result.refresh.plaintext);
    return { accessToken: result.accessToken, user: result.user };
  }

  /**
   * Rotates the HttpOnly refresh cookie and returns a new access JWT.
   * Does not require a Bearer access token (used after reload in delivery 3).
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, AuthOriginGuard)
  @Throttle({
    default: {
      limit: AUTH_REFRESH_THROTTLE.limit,
      ttl: AUTH_REFRESH_THROTTLE.ttl,
    },
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const plaintext = this.readRefreshCookie(req);
    const result = await this.authService.refreshFromCookie(
      plaintext,
      this.metaFrom(req),
    );
    setRefreshCookie(res, result.refresh.plaintext);
    return { accessToken: result.accessToken, user: result.user };
  }

  /**
   * Revokes the refresh-token family for this cookie and clears it.
   * Idempotent if the cookie is missing or already revoked.
   * Note: a still-valid access JWT remains usable until it expires —
   * this delivery does not maintain an access-token denylist.
   */
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthOriginGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const plaintext = this.readRefreshCookie(req);
    await this.authService.logout(plaintext);
    clearRefreshCookie(res);
    return { ok: true };
  }

  /**
   * Starts a password-reset flow. Always returns the same generic body
   * (no account enumeration). Does not set session cookies.
   */
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: AUTH_FORGOT_PASSWORD_THROTTLE.limit,
      ttl: AUTH_FORGOT_PASSWORD_THROTTLE.ttl,
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordReset.requestReset(dto);
  }

  /**
   * Consumes a one-time reset token, updates the password hash, and revokes
   * all refresh sessions. Does not issue a new login session.
   * Access JWTs issued before the reset remain valid until they expire.
   */
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: AUTH_RESET_PASSWORD_THROTTLE.limit,
      ttl: AUTH_RESET_PASSWORD_THROTTLE.ttl,
    },
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordReset.resetPassword(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: Omit<User, "hashedPassword">) {
    return user;
  }

  private readRefreshCookie(req: Request): string | undefined {
    const value = req.cookies?.[REFRESH_COOKIE_NAME];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  }

  private metaFrom(req: Request) {
    return {
      ip: req.ip,
      userAgent:
        typeof req.headers["user-agent"] === "string"
          ? req.headers["user-agent"]
          : undefined,
    };
  }
}
