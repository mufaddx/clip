import { IsIn, IsString, MinLength } from "class-validator";
import type { TicketCategory } from "@clip/db";

const CATEGORIES: TicketCategory[] = ["CAMPAIGN", "PAYMENT", "INSTAGRAM", "VERIFICATION", "PERFORMANCE", "ACCOUNT", "OTHER"];

export class CreateTicketDto {
  @IsIn(CATEGORIES)
  category!: TicketCategory;

  @IsString()
  @MinLength(3)
  subject!: string;

  @IsString()
  @MinLength(1)
  message!: string;
}
