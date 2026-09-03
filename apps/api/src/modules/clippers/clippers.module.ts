import { Module } from "@nestjs/common";
import { ClippersController } from "./clippers.controller";
import { ClippersService } from "./clippers.service";

@Module({
  controllers: [ClippersController],
  providers: [ClippersService],
})
export class ClippersModule {}
