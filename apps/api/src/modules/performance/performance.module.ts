import { Module } from "@nestjs/common";
import { WalletModule } from "../wallet/wallet.module";
import { PerformanceController } from "./performance.controller";
import { PerformanceService } from "./performance.service";

@Module({
  imports: [WalletModule],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
