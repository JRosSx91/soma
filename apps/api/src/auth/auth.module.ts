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
            // Access TTL stays at JWT_EXPIRES_IN (default 7d) until
            // delivery 3 wires automatic refresh on the SPA.
            expiresIn: (config.get<string>("JWT_EXPIRES_IN") ??
              "7d") as `${number}${"s" | "m" | "h" | "d"}`,
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
  ],
  exports: [AuthService, RefreshSessionService],
})
export class AuthModule {}
