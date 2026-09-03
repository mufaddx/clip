import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { prisma } from "@clip/db";
import { getEnv } from "@clip/config";
import { encryptToken, decryptToken } from "./token-crypto";

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

  /** Step 1 of docs/architecture/META_INSTAGRAM_INTEGRATION.md "Account authorization flow". */
  getAuthorizationUrl(): { url: string; state: string } {
    const env = this.requireMetaConfig();
    const state = randomBytes(16).toString("hex");
    const scopes = ["instagram_business_basic", "instagram_business_content_publish", "instagram_business_manage_insights"];

    const url = new URL("https://api.instagram.com/oauth/authorize");
    url.searchParams.set("client_id", env.META_APP_ID!);
    url.searchParams.set("redirect_uri", env.META_REDIRECT_URI!);
    url.searchParams.set("scope", scopes.join(","));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);

    return { url: url.toString(), state };
  }

  /** Step 2-4: exchange code → short-lived → long-lived token, then store the connected account. */
  async connectAccount(creatorUserId: string, code: string) {
    const env = this.requireMetaConfig();
    const creator = await prisma.creatorProfile.findUnique({ where: { userId: creatorUserId } });
    if (!creator) throw new ForbiddenException({ code: "NOT_A_CLIPPER", message: "This account has no creator profile." });

    const shortLived = await this.exchangeCodeForShortLivedToken(code, env);
    const longLived = await this.exchangeForLongLivedToken(shortLived.access_token, env);
    const profile = await this.fetchProfile(longLived.access_token, shortLived.user_id, env);

    const expiresAt = new Date(Date.now() + longLived.expires_in * 1000);
    const encrypted = encryptToken(longLived.access_token, env.TOKEN_ENCRYPTION_KEY!);

    const account = await prisma.instagramAccount.upsert({
      where: { platformUserId: String(shortLived.user_id) },
      create: {
        creatorId: creator.id,
        platformUserId: String(shortLived.user_id),
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
      throw new BadRequestException({ code: "INSTAGRAM_OAUTH_FAILED", message: "Failed to exchange authorization code." });
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
      throw new BadRequestException({ code: "INSTAGRAM_TOKEN_EXCHANGE_FAILED", message: "Failed to obtain a long-lived token." });
    }
    return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
  }

  private async fetchProfile(accessToken: string, userId: number, env: ReturnType<typeof getEnv>) {
    const url = new URL(`https://graph.instagram.com/${env.META_GRAPH_API_VERSION}/${userId}`);
    url.searchParams.set("fields", "id,username,account_type");
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url);
    if (!res.ok) {
      throw new BadRequestException({ code: "INSTAGRAM_PROFILE_FETCH_FAILED", message: "Failed to fetch the connected profile." });
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

  /**
   * Lists recent media on a connected account — feeds the Reel Detection
   * Worker's "Path A" auto-discovery (docs/campaigns/REEL_SUBMISSION.md).
   */
  async listRecentMedia(instagramAccountId: string, limit = 25) {
    const env = this.requireMetaConfig();
    const account = await prisma.instagramAccount.findUniqueOrThrow({ where: { id: instagramAccountId } });
    const accessToken = await this.getDecryptedToken(instagramAccountId, env);

    const url = new URL(`https://graph.instagram.com/${env.META_GRAPH_API_VERSION}/${account.platformUserId}/media`);
    url.searchParams.set("fields", "id,permalink,timestamp,media_type,caption");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url);
    if (!res.ok) {
      throw new BadRequestException({ code: "INSTAGRAM_MEDIA_FETCH_FAILED", message: "Failed to list recent media." });
    }
    const body = (await res.json()) as { data: Array<{ id: string; permalink: string; timestamp: string; media_type: string; caption?: string }> };
    return body.data;
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
