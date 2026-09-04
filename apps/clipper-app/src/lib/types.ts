// Loose client-side shapes mirroring the API's Prisma-backed responses.
// A shared @clip/types DTO package would be the long-term home for these —
// see docs/architecture/APPLICATION_ARCHITECTURE.md "packages/types is the
// contract between frontend and backend" — this is a pragmatic stand-in.

export interface Campaign {
  id: string;
  name: string;
  type: string | null;
  objective: string;
  description: string | null;
  status: string;
  creatorBudget: number;
  maxParticipants: number | null;
  currency: string;
  requirements?: { minFollowers: number | null; minTrustScore: number | null; contentRestrictions: string[] } | null;
}

export interface CampaignReel {
  id: string;
  url: string;
  status: string;
  submittedAt: string;
}

export interface CampaignAcceptance {
  id: string;
  campaignId: string;
  status: string;
  acceptedAt: string;
  campaign: Campaign;
  reels: CampaignReel[];
}

export interface InstagramAccount {
  id: string;
  username: string;
  accountType: string | null;
  connectionHealth: string;
  connectedAt: string;
}

// Live Graph API responses (Instagram's own field names, not Prisma's) —
// see InstagramService.getAccountStats/listRecentMediaForCreator.
export interface InstagramProfileStats {
  id: string;
  username: string;
  account_type: string;
  media_count?: number;
  followers_count?: number;
  profile_picture_url?: string;
}

export interface InstagramMediaItem {
  id: string;
  permalink: string;
  timestamp: string;
  media_type: string;
  caption?: string;
  media_url?: string;
  thumbnail_url?: string;
  like_count?: number;
  comments_count?: number;
}

export interface Wallet {
  id: string;
  availableBalance: number;
  lockedBalance: number;
  spentBalance: number;
  pendingBalance: number;
  processingBalance: number;
  withdrawnBalance: number;
  currency: string;
}

export interface LedgerEntry {
  id: string;
  type: "CREDIT" | "DEBIT";
  bucket: string;
  amount: number;
  source: string;
  balanceAfter: number;
  createdAt: string;
}
