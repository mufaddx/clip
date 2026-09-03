import { Module } from "@nestjs/common";
import { WalletModule } from "../wallet/wallet.module";
import { DisputesController } from "./disputes.controller";
import { DisputesService } from "./disputes.service";

@Module({
  imports: [WalletModule],
  controllers: [DisputesController],
  providers: [DisputesService],
})
export class DisputesModule {}
