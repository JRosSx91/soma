import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ProgressController } from "./progress.controller.js";
import { ProgressService } from "./progress.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
