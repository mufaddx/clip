import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class AddMessageDto {
  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
