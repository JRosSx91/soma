import { Module } from '@nestjs/common';
import { SubstancesController } from './substances.controller.js';
import { SubstancesService } from './substances.service.js';

@Module({
  controllers: [SubstancesController],
  providers: [SubstancesService],
})
export class SubstancesModule {}