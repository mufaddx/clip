import { Module } from "@nestjs/common";
import { ReferralsModule } from "../referrals/referrals.module";
import { UsersController } from "./users.controller";

@Module({
  imports: [ReferralsModule],
  controllers: [UsersController],
})
export class UsersModule {}
