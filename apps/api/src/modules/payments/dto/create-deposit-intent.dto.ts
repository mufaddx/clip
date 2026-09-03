import { IsInt, IsPositive } from "class-validator";

export class CreateDepositIntentDto {
  @IsInt()
  @IsPositive()
  amount!: number;
}
