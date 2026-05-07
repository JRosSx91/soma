import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SubstancesModule } from './substances/substances.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { NeurotransmitterStateModule } from './neurotransmitter-state/neurotransmitter-state.module.js';
import { OrganNarrativeStateModule } from './organ-narrative-state/organ-narrative-state.module.js';
import { AchievementsModule } from './achievements/achievements.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    SubstancesModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    NeurotransmitterStateModule,
    OrganNarrativeStateModule,
    AchievementsModule
  ],
})
export class AppModule {}