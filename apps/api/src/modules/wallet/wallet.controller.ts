import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { getEnv } from "@clip/config";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { WalletService } from "./wallet.service";
import { RequestWithdrawalDto } from "./dto/request-withdrawal.dto";
import { SimulateDepositDto } from "./dto/simulate-deposit.dto";

/** /v1/wallet — see docs/api/API_ENDPOINTS.md and docs/finance/WALLET_SYSTEM.md. Self-scoped only. */
@Controller("v1/wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@CurrentUser() user: SessionUser) {
    return this.walletService.getWalletByUserId(user.id);
  }

  @Get("ledger")
  async getLedger(@CurrentUser() user: SessionUser, @Query("cursor") cursor?: string) {
    return this.walletService.getLedger(user.id, 50, cursor);
  }

  @Post("withdrawals")
  async requestWithdrawal(@CurrentUser() user: SessionUser, @Body() dto: RequestWithdrawalDto) {
    return this.walletService.requestWithdrawal(user.id, dto.amount, dto.payoutMethod);
  }

  @Get("withdrawals")
  async listWithdrawals(@CurrentUser() user: SessionUser) {
    return this.walletService.listWithdrawals(user.id);
  }

  /**
   * Dev-only stand-in for the real payment provider webhook — see
   * docs/finance/PAYMENT_SYSTEM.md. Real deposits are only recognized on a
   * verified webhook (see modules/payments), never a client callback.
   */
  @Post("deposits/simulate")
  async simulateDeposit(@CurrentUser() user: SessionUser, @Body() dto: SimulateDepositDto) {
    if (getEnv().NODE_ENV === "production") {
      throw new BadRequestException({ code: "NOT_AVAILABLE", message: "Simulated deposits are disabled in production." });
    }
    return this.walletService.recognizeDeposit(user.id, dto.amount, `simulated-${crypto.randomUUID()}`);
  }
}
