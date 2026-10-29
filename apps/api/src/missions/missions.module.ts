import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ProgressModule } from "../progress/progress.module.js";
import { MissionsController } from "./missions.controller.js";
import { MissionsService } from "./missions.service.js";

@Module({
  imports: [PrismaModule, ProgressModule],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
