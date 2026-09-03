import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { getEnv } from "@clip/config";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { WalletService } from "./wallet.service";
import { PaymentsService } from "../payments/payments.service";
import { RequestWithdrawalDto } from "./dto/request-withdrawal.dto";
import { SimulateDepositDto } from "./dto/simulate-deposit.dto";
import { CreateDepositIntentDto } from "../payments/dto/create-deposit-intent.dto";

/** /v1/wallet — see docs/api/API_ENDPOINTS.md and docs/finance/WALLET_SYSTEM.md. Self-scoped only. */
@Controller("v1/wallet")
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentsService: PaymentsService
  ) {}

  @Get()
  async getWallet(@CurrentUser() user: SessionUser) {
    return this.walletService.getWalletByUserId(user.id);
  }

  @Get("ledger")
  async getLedger(@CurrentUser() user: SessionUser, @Query("cursor") cursor?: string) {
    return this.walletService.getLedger(user.id, 50, cursor);
  }

  /** Real deposit flow — see docs/finance/PAYMENT_SYSTEM.md. Returns what the frontend needs to open Razorpay Checkout. */
  @Post("deposits/create-intent")
  async createDepositIntent(@CurrentUser() user: SessionUser, @Body() dto: CreateDepositIntentDto) {
    return this.paymentsService.createDepositIntent(user.id, dto.amount);
  }

  @Post("withdrawals")
  async requestWithdrawal(@CurrentUser() user: SessionUser, @Body() dto: RequestWithdrawalDto) {
    const withdrawal = await this.walletService.requestWithdrawal(user.id, dto.amount, dto.payoutMethod);

    // Best-effort: the ledger debit (AVAILABLE → PROCESSING) already
    // happened and stands regardless — a payout API failure here doesn't
    // roll it back. It just leaves the withdrawal PROCESSING for admin
    // follow-up (see admin.domain.in/finance/withdrawals) rather than
    // failing the request the user sees.
    try {
      await this.paymentsService.createPayout(withdrawal.id);
    } catch {
      // Logged inside PaymentsService's own call chain; nothing further to do here.
    }

    return withdrawal;
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
