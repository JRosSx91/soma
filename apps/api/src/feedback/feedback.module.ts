import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { FeedbackController } from "./feedback.controller.js";
import { FeedbackService } from "./feedback.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
