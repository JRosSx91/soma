import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { JournalController } from "./journal.controller.js";
import { JournalService } from "./journal.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [JournalController],
  providers: [JournalService],
})
export class JournalModule {}
