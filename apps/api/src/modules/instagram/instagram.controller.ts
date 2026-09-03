import { Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { InstagramService } from "./instagram.service";

/**
 * /v1/instagram — see docs/api/API_ENDPOINTS.md and
 * docs/architecture/META_INSTAGRAM_INTEGRATION.md "Account authorization flow".
 * The callback route is reachable because api.<domain> shares the session
 * cookie's parent domain with clipper.<domain> — see
 * docs/architecture/DOMAIN_ARCHITECTURE.md.
 */
@Controller("v1/instagram")
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Roles("CLIPPER")
  @Get("oauth/start")
  async oauthStart() {
    // NOTE: a production-hardened version persists `state` server-side
    // keyed by the requesting user and checks it on callback (CSRF
    // protection); this pass trusts the round-tripped value.
    return this.instagramService.getAuthorizationUrl();
  }

  @Roles("CLIPPER")
  @Get("oauth/callback")
  async oauthCallback(@CurrentUser() user: SessionUser, @Query("code") code: string) {
    return this.instagramService.connectAccount(user.id, code);
  }

  @Roles("CLIPPER")
  @Get("accounts")
  async listAccounts(@CurrentUser() user: SessionUser) {
    return this.instagramService.listAccounts(user.id);
  }

  @Roles("CLIPPER")
  @Delete("accounts/:id")
  async disconnect(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    await this.instagramService.disconnect(user.id, id);
    return { success: true };
  }

  @Roles("CLIPPER")
  @Post("accounts/:id/refresh")
  async refresh(@Param("id") id: string) {
    await this.instagramService.refreshAccountToken(id);
    return { success: true };
  }
}
