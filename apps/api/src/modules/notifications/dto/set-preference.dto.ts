import { IsBoolean, IsString } from "class-validator";

export class SetPreferenceDto {
  @IsString()
  type!: string;

  @IsBoolean()
  inAppEnabled!: boolean;

  @IsBoolean()
  emailEnabled!: boolean;
}
