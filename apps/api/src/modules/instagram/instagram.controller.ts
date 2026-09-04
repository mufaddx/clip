import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Post, Query, Req, Res } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request, Response } from "express";
import { getEnv } from "@clip/config";
import { createHmac, timingSafeEqual } from "crypto";
import type { SessionUser } from "@clip/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
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
  async oauthStart(@CurrentUser() user: SessionUser) {
    return this.instagramService.getAuthorizationUrl(user.id);
  }

  // Public: this is a top-level redirect Instagram's own server sends the
  // browser, not a same-session API call — the user is identified via the
  // server-side `state` lookup (see getAuthorizationUrl), not the request's
  // own session cookie/JWT. See docs/architecture/META_INSTAGRAM_INTEGRATION.md
  // "Account authorization flow".
  @Public()
  @Get("oauth/callback")
  async oauthCallback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Res({ passthrough: false }) res: Response
  ) {
    // The browser lands here via a top-level redirect from Instagram, not
    // a fetch() call from our own frontend — returning JSON would just
    // dump raw text on screen. Redirect back into the app instead, with a
    // query param it can turn into a toast/banner.
    const instagramPageUrl = `${getEnv().CLIPPER_APP_URL}/instagram`;
    try {
      const userId = await this.instagramService.resolveUserIdFromState(state);
      await this.instagramService.connectAccount(userId, code);
      return res.redirect(`${instagramPageUrl}?connected=1`);
    } catch {
      return res.redirect(`${instagramPageUrl}?connected=0`);
    }
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

  // ── Profile view (followers/media stats + recent posts) — see
  // docs/architecture/META_INSTAGRAM_INTEGRATION.md ──

  @Roles("CLIPPER")
  @Get("accounts/:id/profile")
  async getProfile(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.instagramService.getAccountStats(user.id, id);
  }

  @Roles("CLIPPER")
  @Get("accounts/:id/media")
  async getMedia(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.instagramService.listRecentMediaForCreator(user.id, id, 12);
  }

  // ── Meta webhook — see docs/api/WEBHOOKS.md "Meta / Instagram webhooks" ──

  /** Meta's verification handshake, required when first registering the webhook subscription. */
  @Public()
  @Get("webhook")
  verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string
  ) {
    const env = getEnv();
    if (mode === "subscribe" && token === env.META_APP_SECRET) {
      return challenge;
    }
    throw new BadRequestException({ code: "INVALID_VERIFY_TOKEN", message: "Webhook verification failed." });
  }

  /**
   * Verified via X-Hub-Signature-256 before the payload is trusted — see
   * docs/architecture/SECURITY_ARCHITECTURE.md "Webhook security". Only
   * verifies + enqueues; a verified event should enqueue a Reel Detection
   * Worker job (see docs/architecture/BACKGROUND_JOBS.md) once that worker
   * exists — currently just logged.
   */
  @Public()
  @Post("webhook")
  receiveWebhook(@Req() req: RawBodyRequest<Request>, @Headers("x-hub-signature-256") signature: string, @Body() body: unknown) {
    const env = getEnv();
    if (!env.META_APP_SECRET || !req.rawBody || !signature?.startsWith("sha256=")) {
      throw new BadRequestException({ code: "INVALID_SIGNATURE", message: "Missing signature or secret." });
    }

    const expected = "sha256=" + createHmac("sha256", env.META_APP_SECRET).update(req.rawBody).digest("hex");
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(signature);
    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
      throw new BadRequestException({ code: "INVALID_SIGNATURE", message: "Webhook signature verification failed." });
    }

    console.log("[instagram webhook] verified event received", JSON.stringify(body));
    return { received: true };
  }
}
