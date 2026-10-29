import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { User } from "@prisma/client";
import type { Response } from "express";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CreateFeedbackDto } from "./dto/create-feedback.dto.js";
import { ListFeedbackQueryDto } from "./dto/list-feedback-query.dto.js";
import { FEEDBACK_POST_THROTTLE } from "./feedback-throttle.js";
import { FeedbackService } from "./feedback.service.js";

/** Explicit expectedType so validation works when design:paramtypes is stripped. */
function bodyOf(type: new (...args: never[]) => object) {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    expectedType: type,
  });
}

function queryOf(type: new (...args: never[]) => object) {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    expectedType: type,
  });
}

@Controller("me/feedback")
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(
    @Inject(FeedbackService) private readonly feedback: FeedbackService,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: FEEDBACK_POST_THROTTLE.limit,
      ttl: FEEDBACK_POST_THROTTLE.ttl,
    },
  })
  async create(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Body(bodyOf(CreateFeedbackDto)) dto: CreateFeedbackDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.feedback.create(user.id, dto);
    res.status(result.created ? HttpStatus.CREATED : HttpStatus.OK);
    return result.item;
  }

  @Get()
  list(
    @CurrentUser() user: Omit<User, "hashedPassword">,
    @Query(queryOf(ListFeedbackQueryDto)) query: ListFeedbackQueryDto,
  ) {
    return this.feedback.list(user.id, query);
  }
}
