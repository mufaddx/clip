import { Body, Controller, Post } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UploadsService } from "./uploads.service";
import { PresignUploadDto } from "./dto/presign-upload.dto";

/** /v1/uploads — see docs/api/API_ENDPOINTS.md and
 * docs/campaigns/CAMPAIGN_CREATION_FLOW.md "Assets". Only brands attach
 * campaign creative today, hence BRAND_OWNER/BRAND_TEAM_MEMBER only —
 * widen this if another role ever needs to upload something. */
@Controller("v1/uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Roles("BRAND_OWNER", "BRAND_TEAM_MEMBER")
  @Post("presign")
  async presign(@CurrentUser() user: SessionUser, @Body() dto: PresignUploadDto) {
    return this.uploadsService.presignUpload(user.id, dto.filename, dto.contentType);
  }
}
