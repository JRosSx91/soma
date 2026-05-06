import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { NeurotransmitterStateService } from './neurotransmitter-state.service.js';
import { NeurotransmitterStateController } from './neurotransmitter-state.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [NeurotransmitterStateController],
  providers: [NeurotransmitterStateService],
})
export class NeurotransmitterStateModule {}