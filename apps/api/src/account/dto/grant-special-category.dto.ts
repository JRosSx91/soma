import { Equals, IsBoolean, IsString } from "class-validator";
import { LEGAL_SPECIAL_CATEGORY_VERSION } from "@soma/shared-types";

export class GrantSpecialCategoryDto {
  @IsBoolean()
  @Equals(true)
  acceptedSpecialCategoryProcessing!: boolean;

  @IsString()
  @Equals(LEGAL_SPECIAL_CATEGORY_VERSION)
  specialCategoryProcessingVersion!: string;
}
