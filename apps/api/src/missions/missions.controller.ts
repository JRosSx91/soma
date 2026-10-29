import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import type { User } from "@prisma/client";
import {
  getMissionById,
  type MissionAnswerResponse,
  type MissionSubmitRejection,
} from "@soma/shared-types";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { AnswerMissionDto } from "./dto/answer-mission.dto.js";
import { MissionsService } from "./missions.service.js";

function bodyOf(type: new (...args: never[]) => object) {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    expectedType: type,
  });
}

function throwForRejection(reason: MissionSubmitRejection): never {
  if (reason === "unknown_option") {
    throw new BadRequestException("Unknown option");
  }
  throw new NotFoundException("Mission not found");
}

@Controller("me/missions")
@UseGuards(JwtAuthGuard)
export class MissionsController {
  constructor(
    @Inject(MissionsService) private readonly missions: MissionsService,
  ) {}

  @Get()
  listMine(@CurrentUser() user: Omit<User, "hashedPassword">) {
    return this.missions.listMine(user.id);
  }

  @Post(":missionId/answer")
  @HttpCode(HttpStatus.OK)
  async answer(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Param("missionId") missionId: string,
    @Body(bodyOf(AnswerMissionDto)) dto: AnswerMissionDto,
  ): Promise<MissionAnswerResponse> {
    const outcome = await this.missions.submitAnswer(user.id, {
      missionId,
      selectedOptionId: dto.optionId,
    });
    if (!outcome.ok) {
      throwForRejection(outcome.reason);
    }
    const mission = getMissionById(missionId);
    if (!mission || mission.status !== "published") {
      throw new NotFoundException("Mission not found");
    }
    return {
      ...outcome.result,
      explainKey: mission.explainKey,
    };
  }
}
