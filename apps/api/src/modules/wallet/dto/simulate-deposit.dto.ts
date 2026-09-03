import { IsInt, IsPositive } from "class-validator";

/**
 * Dev/staging-only: simulates a confirmed deposit without a real payment
 * provider webhook, so the wallet flow is testable before
 * PAYMENT_PROVIDER_KEY is configured. Disabled in production — see
 * WalletController.simulateDeposit.
 */
export class SimulateDepositDto {
  @IsInt()
  @IsPositive()
  amount!: number;
}
