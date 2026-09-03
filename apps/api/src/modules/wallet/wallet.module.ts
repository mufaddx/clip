import { forwardRef, Module } from "@nestjs/common";
import { PaymentsModule } from "../payments/payments.module";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";

// forwardRef: PaymentsModule also imports WalletModule (PaymentsService
// needs WalletService) — this is a genuine module-level cycle, not a
// provider-level one (no service depends on itself transitively), which
// is exactly what forwardRef is for. See WalletController (needs
// PaymentsService to trigger a payout after requestWithdrawal).
@Module({
  imports: [forwardRef(() => PaymentsModule)],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
