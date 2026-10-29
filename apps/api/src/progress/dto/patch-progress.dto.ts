import { IsIn } from "class-validator";
import { PROGRESS_TITLE_IDS } from "@soma/shared-types";

export class PatchProgressDto {
  @IsIn([...PROGRESS_TITLE_IDS])
  equippedTitleId!: string;
}
