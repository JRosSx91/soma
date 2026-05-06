import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OrganNarrativeStateService } from './organ-narrative-state.service.js';
import { OrganNarrativeStateController } from './organ-narrative-state.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrganNarrativeStateController],
  providers: [OrganNarrativeStateService],
})
export class OrganNarrativeStateModule {}