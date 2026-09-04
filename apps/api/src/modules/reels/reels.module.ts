import { Module } from "@nestjs/common";
import { InstagramModule } from "../instagram/instagram.module";
import { ReelsController } from "./reels.controller";
import { ReelsService } from "./reels.service";
import { MediaFingerprintService } from "./media-fingerprint.service";

@Module({
  imports: [InstagramModule],
  controllers: [ReelsController],
  providers: [ReelsService, MediaFingerprintService],
  exports: [ReelsService],
})
export class ReelsModule {}
