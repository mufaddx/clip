import { IsString, IsUrl } from "class-validator";

export class SubmitReelDto {
  @IsString()
  campaignCreatorId!: string;

  @IsUrl()
  url!: string;
}
