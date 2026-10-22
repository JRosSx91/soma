import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { HealthModule } from "./health/health.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { SubstancesModule } from "./substances/substances.module.js";
import { UsersModule } from "./users/users.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { ProfileModule } from "./profile/profile.module.js";
import { AccountModule } from "./account/account.module.js";
import { NeurotransmitterStateModule } from "./neurotransmitter-state/neurotransmitter-state.module.js";
import { OrganNarrativeStateModule } from "./organ-narrative-state/organ-narrative-state.module.js";
import { AchievementsModule } from "./achievements/achievements.module.js";

/**
 * Throttler is registered globally as infrastructure, but ThrottlerGuard
 * is applied only on auth mutations and DELETE /me/account.
 * Other routes stay unthrottled in this delivery.
 *
 * Storage is in-memory per process — insufficient for multi-instance
 * deployments until a shared store is introduced.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        // High default ceiling; route @Throttle overrides set real limits.
        ttl: 60_000,
        limit: 1_000,
      },
    ]),
    PrismaModule,
    HealthModule,
    SubstancesModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    AccountModule,
    NeurotransmitterStateModule,
    OrganNarrativeStateModule,
    AchievementsModule,
  ],
})
export class AppModule {}
