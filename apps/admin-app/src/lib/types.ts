export interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  creatorBudget: number;
  rejectedReason: string | null;
  createdAt: string;
}

export interface ClipperRow {
  id: string;
  displayName: string;
  trustScore: number;
  riskFlagged: boolean;
  user: { email: string; status: string; createdAt: string };
}

export interface InstagramAccountRow {
  id: string;
  username: string;
  connectionHealth: string;
  lastSyncedAt: string | null;
  creator: { displayName: string };
}

export interface WithdrawalRow {
  id: string;
  amount: number;
  status: string;
  requestedAt: string;
  wallet: { user: { email: string } };
}

export interface ReferralRow {
  id: string;
  status: string;
  flaggedReason: string | null;
  createdAt: string;
  referrer: { email: string };
  referred: { email: string };
  reward: { amount: number } | null;
}

export interface AuditLogRow {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export interface PlatformOverview {
  totalUsers: number;
  totalBrands: number;
  totalClippers: number;
  activeCampaigns: number;
  totalCampaignBudget: number;
  platformRevenue: number;
  totalQualifiedPerformance: number;
  pendingWithdrawals: number;
}
