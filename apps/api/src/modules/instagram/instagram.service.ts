import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { prisma } from "@clip/db";
import { getEnv } from "@clip/config";
import { createRedisConnection } from "../../workers/connection";
import { encryptToken, decryptToken } from "./token-crypto";

const STATE_KEY_PREFIX = "instagram_oauth_state:";
const STATE_TTL_SECONDS = 10 * 60; // the OAuth round-trip through Instagram's consent screen can take a while

/**
 * The ONLY module that talks to the Meta/Instagram Graph API — see
 * docs/architecture/META_INSTAGRAM_INTEGRATION.md "Isolation". Every other
 * module (reels, performance workers) goes through the narrow interface
 * exposed here, never the Graph API directly.
 *
 * Uses the Instagram API with Instagram Login (api.instagram.com /
 * graph.instagram.com) OAuth flow. Requires META_APP_ID, META_APP_SECRET,
 * META_REDIRECT_URI, and TOKEN_ENCRYPTION_KEY to actually reach Meta — with
 * those unset (as they are until a real Meta app is configured) the OAuth
 * methods throw a clear 503 rather than silently no-op.
 */
@Injectable()
export class InstagramService {
  private redis = createRedisConnection();

  private requireMetaConfig() {
    const env = getEnv();
    if (!env.META_APP_ID || !env.META_APP_SECRET || !env.META_REDIRECT_URI || !env.TOKEN_ENCRYPTION_KEY) {
      throw new ServiceUnavailableException({
        code: "INSTAGRAM_NOT_CONFIGURED",
        message: "Instagram integration isn't configured yet (META_APP_ID/META_APP_SECRET/META_REDIRECT_URI/TOKEN_ENCRYPTION_KEY).",
      });
    }
    return env;
  }

  /**
   * Step 1 of docs/architecture/META_INSTAGRAM_INTEGRATION.md "Account
   * authorization flow". `state` is stored server-side (Redis, short TTL)
   * mapped to the requesting user — the callback below resolves the user
   * from this rather than from the browser's own session cookie. That's
   * deliberate, not just CSRF protection: the callback is a top-level
   * redirect Instagram itself sends the browser on, arbitrarily later than
   * the user clicked "Connect" (however long they take on Instagram's
   * consent screen), and by then the 15-minute access token from login
   * may well have expired with nothing in this flow to refresh it.
   */
  async getAuthorizationUrl(userId: string): Promise<{ url: string; state: string }> {
    const env = this.requireMetaConfig();
    const state = randomBytes(16).toString("hex");
    await this.redis.set(`${STATE_KEY_PREFIX}${state}`, userId, "EX", STATE_TTL_SECONDS);

    const scopes = ["instagram_business_basic", "instagram_business_content_publish", "instagram_business_manage_insights"];

    const url = new URL("https://api.instagram.com/oauth/authorize");
    url.searchParams.set("client_id", env.META_APP_ID!);
    url.searchParams.set("redirect_uri", env.META_REDIRECT_URI!);
    url.searchParams.set("scope", scopes.join(","));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);

    return { url: url.toString(), state };
  }

  /** Resolves and consumes (single-use) the state issued by
   * getAuthorizationUrl — throws if it's missing/expired/already used. */
  async resolveUserIdFromState(state: string): Promise<string> {
    const key = `${STATE_KEY_PREFIX}${state}`;
    const userId = await this.redis.get(key);
    if (!userId) {
      throw new UnauthorizedException({ code: "OAUTH_STATE_INVALID", message: "This connection attempt expired — please try again." });
    }
    await this.redis.del(key);
    return userId;
  }

  /** Step 2-4: exchange code → short-lived → long-lived token, then store the connected account. */
  async connectAccount(creatorUserId: string, code: string) {
    const env = this.requireMetaConfig();
    const creator = await prisma.creatorProfile.findUnique({ where: { userId: creatorUserId } });
    if (!creator) throw new ForbiddenException({ code: "NOT_A_CLIPPER", message: "This account has no creator profile." });

    const shortLived = await this.exchangeCodeForShortLivedToken(code, env);
    const longLived = await this.exchangeForLongLivedToken(shortLived.access_token, env);
    const profile = await this.fetchProfile(longLived.access_token, env);

    const expiresAt = new Date(Date.now() + longLived.expires_in * 1000);
    const encrypted = encryptToken(longLived.access_token, env.TOKEN_ENCRYPTION_KEY!);

    // profile.id (from the /me fetch above) is the canonical node id for
    // this graph — later calls like /{platformUserId}/media use the same
    // node path style, so this has to be that id, not the short-lived
    // token exchange's own user_id (which is a different ID namespace and
    // isn't a valid node under graph.instagram.com).
    const account = await prisma.instagramAccount.upsert({
      where: { platformUserId: profile.id },
      create: {
        creatorId: creator.id,
        platformUserId: profile.id,
        username: profile.username,
        accountType: profile.account_type,
        connectionHealth: "HEALTHY",
        lastSyncedAt: new Date(),
      },
      update: {
        creatorId: creator.id,
        username: profile.username,
        accountType: profile.account_type,
        connectionHealth: "HEALTHY",
        disconnectedAt: null,
        lastSyncedAt: new Date(),
      },
    });

    await prisma.instagramToken.upsert({
      where: { instagramAccountId: account.id },
      create: { instagramAccountId: account.id, encryptedAccessToken: encrypted, expiresAt },
      update: { encryptedAccessToken: encrypted, expiresAt, lastRefreshedAt: new Date() },
    });

    return account;
  }

  private async exchangeCodeForShortLivedToken(code: string, env: ReturnType<typeof getEnv>) {
    const body = new URLSearchParams({
      client_id: env.META_APP_ID!,
      client_secret: env.META_APP_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: env.META_REDIRECT_URI!,
      code,
    });

    const res = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Instagram code exchange failed:", res.status, detail);
      throw new BadRequestException({ code: "INSTAGRAM_OAUTH_FAILED", message: "Failed to exchange authorization code.", details: { detail } });
    }
    return res.json() as Promise<{ access_token: string; user_id: number }>;
  }

  private async exchangeForLongLivedToken(shortLivedToken: string, env: ReturnType<typeof getEnv>) {
    const url = new URL("https://graph.instagram.com/access_token");
    url.searchParams.set("grant_type", "ig_exchange_token");
    url.searchParams.set("client_secret", env.META_APP_SECRET!);
    url.searchParams.set("access_token", shortLivedToken);

    const res = await fetch(url);
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Instagram long-lived token exchange failed:", res.status, detail);
      throw new BadRequestException({ code: "INSTAGRAM_TOKEN_EXCHANGE_FAILED", message: "Failed to obtain a long-lived token.", details: { detail } });
    }
    return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
  }

  // Note: graph.instagram.com (the standalone "Instagram API with Instagram
  // Login" graph, as opposed to graph.facebook.com) resolves the current
  // token's own account via the /me alias — the numeric user_id from the
  // token exchange isn't a valid node path here, unlike the classic
  // Facebook Graph API pattern this was originally modeled on.
  private async fetchProfile(accessToken: string, env: ReturnType<typeof getEnv>) {
    const url = new URL(`https://graph.instagram.com/${env.META_GRAPH_API_VERSION}/me`);
    url.searchParams.set("fields", "id,username,account_type");
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url);
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Instagram profile fetch failed:", res.status, detail);
      throw new BadRequestException({ code: "INSTAGRAM_PROFILE_FETCH_FAILED", message: "Failed to fetch the connected profile.", details: { detail } });
    }
    return res.json() as Promise<{ id: string; username: string; account_type: string }>;
  }

  /** Refreshes a long-lived token before it expires — see docs/architecture/META_INSTAGRAM_INTEGRATION.md "Token monitoring". */
  async refreshAccountToken(instagramAccountId: string) {
    const env = this.requireMetaConfig();
    const account = await prisma.instagramAccount.findUnique({
      where: { id: instagramAccountId },
      include: { token: true },
    });
    if (!account?.token) throw new NotFoundException({ code: "ACCOUNT_NOT_FOUND", message: "Connected account not found." });

    const current = decryptToken(account.token.encryptedAccessToken, env.TOKEN_ENCRYPTION_KEY!);
    const url = new URL("https://graph.instagram.com/refresh_access_token");
    url.searchParams.set("grant_type", "ig_refresh_token");
    url.searchParams.set("access_token", current);

    const res = await fetch(url);
    if (!res.ok) {
      await prisma.instagramAccount.update({ where: { id: instagramAccountId }, data: { connectionHealth: "ERROR" } });
      throw new BadRequestException({ code: "INSTAGRAM_REFRESH_FAILED", message: "Failed to refresh the Instagram token." });
    }
    const refreshed = (await res.json()) as { access_token: string; expires_in: number };
    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

    await prisma.$transaction([
      prisma.instagramToken.update({
        where: { instagramAccountId },
        data: { encryptedAccessToken: encryptToken(refreshed.access_token, env.TOKEN_ENCRYPTION_KEY!), expiresAt, lastRefreshedAt: new Date() },
      }),
      prisma.instagramAccount.update({ where: { id: instagramAccountId }, data: { connectionHealth: "HEALTHY", lastSyncedAt: new Date() } }),
    ]);
  }

  private async getDecryptedToken(instagramAccountId: string, env: ReturnType<typeof getEnv>): Promise<string> {
    const token = await prisma.instagramToken.findUnique({ where: { instagramAccountId } });
    if (!token) throw new NotFoundException({ code: "NO_TOKEN", message: "This account has no stored token." });
    return decryptToken(token.encryptedAccessToken, env.TOKEN_ENCRYPTION_KEY!);
  }

  /** Shared ownership check for the profile/media endpoints below — mirrors disconnect(). */
  private async requireOwnedAccount(creatorUserId: string, accountId: string) {
    const creator = await prisma.creatorProfile.findUniqueOrThrow({ where: { userId: creatorUserId } });
    const account = await prisma.instagramAccount.findUnique({ where: { id: accountId } });
    if (!account || account.creatorId !== creator.id) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "This account isn't connected to your profile." });
    }
    return account;
  }

  /**
   * Lists recent media on a connected account — feeds the Reel Detection
   * Worker's "Path A" auto-discovery (docs/campaigns/REEL_SUBMISSION.md) as
   * well as the clipper-facing "My Instagram" profile view (media_url/
   * thumbnail_url/like_count/comments_count are only used by the latter;
   * the worker ignores the extra fields).
   */
  async listRecentMedia(instagramAccountId: string, limit = 25) {
    const env = this.requireMetaConfig();
    const account = await prisma.instagramAccount.findUniqueOrThrow({ where: { id: instagramAccountId } });
    const accessToken = await this.getDecryptedToken(instagramAccountId, env);

    const url = new URL(`https://graph.instagram.com/${env.META_GRAPH_API_VERSION}/${account.platformUserId}/media`);
    url.searchParams.set(
      "fields",
      "id,permalink,timestamp,media_type,caption,media_url,thumbnail_url,like_count,comments_count"
    );
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url);
    if (!res.ok) {
      throw new BadRequestException({ code: "INSTAGRAM_MEDIA_FETCH_FAILED", message: "Failed to list recent media." });
    }
    const body = (await res.json()) as {
      data: Array<{
        id: string;
        permalink: string;
        timestamp: string;
        media_type: string;
        caption?: string;
        media_url?: string;
        thumbnail_url?: string;
        like_count?: number;
        comments_count?: number;
      }>;
    };
    return body.data;
  }

  /** Ownership-checked wrapper around listRecentMedia() for the clipper's own "My Instagram" page. */
  async listRecentMediaForCreator(creatorUserId: string, instagramAccountId: string, limit = 12) {
    await this.requireOwnedAccount(creatorUserId, instagramAccountId);
    return this.listRecentMedia(instagramAccountId, limit);
  }

  /**
   * Account-level profile stats (followers, media count, avatar) — powers
   * the clipper's "My Instagram" profile view. Separate from
   * connectAccount()'s narrower fetchProfile(): that one only needs
   * id/username/account_type to identify the account; this needs the full
   * public-facing picture, and is called on-demand from the frontend
   * rather than at connect time (these numbers change constantly).
   */
  async getAccountStats(creatorUserId: string, instagramAccountId: string) {
    const env = this.requireMetaConfig();
    await this.requireOwnedAccount(creatorUserId, instagramAccountId);
    const accessToken = await this.getDecryptedToken(instagramAccountId, env);

    const url = new URL(`https://graph.instagram.com/${env.META_GRAPH_API_VERSION}/me`);
    url.searchParams.set("fields", "id,username,account_type,media_count,followers_count,profile_picture_url");
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url);
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Instagram account stats fetch failed:", res.status, detail);
      throw new BadRequestException({ code: "INSTAGRAM_STATS_FETCH_FAILED", message: "Failed to fetch account stats." });
    }
    return res.json() as Promise<{
      id: string;
      username: string;
      account_type: string;
      media_count?: number;
      followers_count?: number;
      profile_picture_url?: string;
    }>;
  }

  /** Pulls current insights for one media item — feeds the Metrics Sync Worker. See docs/performance/METRICS_ARCHITECTURE.md. */
  async getMediaInsights(instagramAccountId: string, mediaId: string) {
    const env = this.requireMetaConfig();
    const accessToken = await this.getDecryptedToken(instagramAccountId, env);

    const url = new URL(`https://graph.instagram.com/${env.META_GRAPH_API_VERSION}/${mediaId}/insights`);
    url.searchParams.set("metric", "reach,likes,comments,shares,saved,plays");
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url);
    if (!res.ok) {
      // Not every account type/permission exposes every metric — a failed
      // insights call is recorded as "unavailable", not fabricated. See
      // docs/performance/METRICS_ARCHITECTURE.md.
      return null;
    }
    const body = (await res.json()) as { data: Array<{ name: string; values: Array<{ value: number }> }> };
    const byName = (name: string) => body.data.find((m) => m.name === name)?.values[0]?.value;

    return {
      views: byName("plays"),
      reach: byName("reach"),
      likes: byName("likes"),
      comments: byName("comments"),
      shares: byName("shares"),
      saves: byName("saved"),
    };
  }

  /** Deletes the token immediately on disconnect — see docs/database/DATA_RETENTION.md. */
  async disconnect(creatorUserId: string, accountId: string) {
    const creator = await prisma.creatorProfile.findUniqueOrThrow({ where: { userId: creatorUserId } });
    const account = await prisma.instagramAccount.findUnique({ where: { id: accountId } });
    if (!account || account.creatorId !== creator.id) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "This account isn't connected to your profile." });
    }

    await prisma.$transaction([
      prisma.instagramToken.deleteMany({ where: { instagramAccountId: accountId } }),
      prisma.instagramAccount.update({
        where: { id: accountId },
        data: { connectionHealth: "REVOKED", disconnectedAt: new Date() },
      }),
    ]);
  }

  async listAccounts(creatorUserId: string) {
    const creator = await prisma.creatorProfile.findUniqueOrThrow({ where: { userId: creatorUserId } });
    return prisma.instagramAccount.findMany({ where: { creatorId: creator.id }, orderBy: { connectedAt: "desc" } });
  }
}
