export interface Campaign {
  id: string;
  name: string;
  type: string | null;
  objective: string;
  description: string | null;
  status: string;
  creatorBudget: number;
  platformFeeRate: number;
  lockedAmount: number;
  spentAmount: number;
  maxParticipants: number | null;
  currency: string;
  rejectedReason: string | null;
  createdAt: string;
}

export interface Wallet {
  id: string;
  availableBalance: number;
  lockedBalance: number;
  spentBalance: number;
  refundableBalance: number;
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

export interface TeamMember {
  id: string;
  userId: string;
  permissions: string[];
  invitedAt: string;
  acceptedAt: string | null;
  user: { email: string; status: string };
}
