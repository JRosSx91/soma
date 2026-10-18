import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { JwtStrategy } from "./jwt.strategy.js";
import { RefreshSessionService } from "./refresh-session.service.js";
import { AuthOriginGuard } from "./auth-origin.guard.js";
import { PasswordResetService } from "./password-reset.service.js";
import {
  PASSWORD_RESET_MAILER,
  createPasswordResetMailer,
} from "./password-reset.mailer.js";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_SECRET");
        if (!secret) {
          throw new Error("JWT_SECRET is not defined in environment");
        }

        return {
          secret,
          signOptions: {
            // Short-lived access JWT; SPA renews via HttpOnly refresh cookie.
            expiresIn: (config.get<string>("JWT_EXPIRES_IN") ??
              "15m") as `${number}${"s" | "m" | "h" | "d"}`,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshSessionService,
    AuthOriginGuard,
    PasswordResetService,
    {
      provide: PASSWORD_RESET_MAILER,
      useFactory: () => createPasswordResetMailer(),
    },
  ],
  exports: [AuthService, RefreshSessionService, PasswordResetService],
})
export class AuthModule {}
