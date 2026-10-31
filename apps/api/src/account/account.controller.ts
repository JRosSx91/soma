import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { User } from "@prisma/client";
import type { Response } from "express";
import { AuthOriginGuard } from "../auth/auth-origin.guard.js";
import { AUTH_DELETE_ACCOUNT_THROTTLE } from "../auth/auth-throttle.js";
import { AuthService } from "../auth/auth.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { clearRefreshCookie } from "../auth/refresh-cookie.js";
import { DeleteAccountDto } from "./dto/delete-account.dto.js";
import { GrantSpecialCategoryDto } from "./dto/grant-special-category.dto.js";
import { WithdrawSpecialCategoryDto } from "./dto/withdraw-special-category.dto.js";

function bodyOf(type: new (...args: never[]) => object) {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    expectedType: type,
  });
}

@Controller("me/account")
export class AccountController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("special-category-consent")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, AuthOriginGuard, ThrottlerGuard)
  @Throttle({
    default: {
      limit: AUTH_DELETE_ACCOUNT_THROTTLE.limit,
      ttl: AUTH_DELETE_ACCOUNT_THROTTLE.ttl,
    },
  })
  async grantSpecialCategoryConsent(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(GrantSpecialCategoryDto)) dto: GrantSpecialCategoryDto,
  ): Promise<void> {
    await this.authService.grantSpecialCategoryConsent(user.id, dto);
  }

  @Post("special-category-consent/withdraw")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, AuthOriginGuard, ThrottlerGuard)
  @Throttle({
    default: {
      limit: AUTH_DELETE_ACCOUNT_THROTTLE.limit,
      ttl: AUTH_DELETE_ACCOUNT_THROTTLE.ttl,
    },
  })
  async withdrawSpecialCategoryConsent(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(WithdrawSpecialCategoryDto)) dto: WithdrawSpecialCategoryDto,
  ): Promise<void> {
    await this.authService.withdrawSpecialCategoryConsent(user.id, dto.password);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, AuthOriginGuard, ThrottlerGuard)
  @Throttle({
    default: {
      limit: AUTH_DELETE_ACCOUNT_THROTTLE.limit,
      ttl: AUTH_DELETE_ACCOUNT_THROTTLE.ttl,
    },
  })
  async deleteAccount(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(DeleteAccountDto)) dto: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.deleteOwnAccount(user.id, dto.password);
    clearRefreshCookie(res);
  }
}
