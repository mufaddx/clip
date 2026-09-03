import { BadGatewayException, Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { extname } from "path";
import { getEnv } from "@clip/config";

export interface PresignedUpload {
  /** Where the browser PUTs the file bytes directly — never proxied through this API. */
  uploadUrl: string;
  /** Where the file is publicly reachable afterward — this is what gets saved as CampaignAsset.mediaUrl. */
  publicUrl: string;
  key: string;
}

/**
 * Direct browser-to-R2 uploads for campaign creative (see
 * docs/campaigns/CAMPAIGN_CREATION_FLOW.md "Assets"): the API never
 * receives the file bytes itself — it only signs a short-lived PUT URL,
 * the browser uploads straight to the bucket, and the resulting public
 * URL becomes the CampaignAsset's mediaUrl. Keeps large video uploads off
 * this process entirely.
 */
@Injectable()
export class UploadsService {
  private client: S3Client | undefined;

  private getClient(): S3Client {
    if (this.client) return this.client;

    const env = getEnv();
    if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_ENDPOINT || !env.R2_BUCKET_NAME) {
      throw new BadGatewayException({
        code: "UPLOADS_NOT_CONFIGURED",
        message: "File uploads aren't configured on this server yet.",
      });
    }

    this.client = new S3Client({
      region: "auto", // R2 doesn't use AWS regions — "auto" is R2's documented value.
      endpoint: env.R2_ENDPOINT,
      credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
    });
    return this.client;
  }

  async presignUpload(userId: string, filename: string, contentType: string): Promise<PresignedUpload> {
    const env = getEnv();
    const client = this.getClient();

    const ext = extname(filename); // preserves e.g. ".mp4" for CDN/player extension-sniffing
    const key = `campaign-assets/${userId}/${randomUUID()}${ext}`;

    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: contentType }),
      { expiresIn: 300 } // 5 minutes — long enough to start a large-video PUT, short enough not to linger as a live credential
    );

    const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;

    return { uploadUrl, publicUrl, key };
  }
}
