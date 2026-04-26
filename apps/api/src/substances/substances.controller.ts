import { Controller, Get } from '@nestjs/common';
import { SubstancesService } from './substances.service.js';

@Controller('substances')
export class SubstancesController {
  constructor(private readonly substancesService: SubstancesService) {}

  @Get()
  async findAll() {
    return this.substancesService.findAll();
  }
}