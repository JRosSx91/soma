import { Transform } from "class-transformer";
import {
  IsIn,
  IsString,
  Validate,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from "class-validator";
import {
  FEEDBACK_CATEGORY_IDS,
  isFeedbackBodyLength,
  isFeedbackTitleLength,
  type FeedbackCategoryId,
} from "@soma/shared-types";

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === "string" ? value.trim() : value;
}

@ValidatorConstraint({ name: "feedbackTitleLength", async: false })
class FeedbackTitleLengthConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === "string" && isFeedbackTitleLength(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return "title must be between 3 and 80 characters";
  }
}

@ValidatorConstraint({ name: "feedbackBodyLength", async: false })
class FeedbackBodyLengthConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === "string" && isFeedbackBodyLength(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return "body must be between 20 and 4000 characters";
  }
}

export class CreateFeedbackDto {
  @IsString()
  @IsIn([...FEEDBACK_CATEGORY_IDS])
  category!: FeedbackCategoryId;

  @Transform(trimString)
  @IsString()
  @Validate(FeedbackTitleLengthConstraint)
  title!: string;

  @Transform(trimString)
  @IsString()
  @Validate(FeedbackBodyLengthConstraint)
  body!: string;
}
