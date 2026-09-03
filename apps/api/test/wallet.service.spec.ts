/**
 * Wallet ledger invariant tests — the highest testing priority per
 * docs/development/TESTING_STRATEGY.md: "every ledger invariant ... has a
 * corresponding test that tries to violate it."
 *
 * Mocks @clip/db's `prisma` singleton rather than hitting a real database —
 * see docs/development/TESTING_STRATEGY.md "Unit tests" (service methods
 * with mocked @clip/db). The integration-level tests that exercise real
 * Postgres transactions/constraints are a follow-up (need a running
 * Postgres, which this environment doesn't have).
 */
import { WalletService } from "../src/modules/wallet/wallet.service";

jest.mock("@clip/db", () => {
  const wallet = {
    id: "wallet-1",
    userId: "user-1",
    availableBalance: 1000,
    lockedBalance: 0,
    spentBalance: 0,
    refundableBalance: 0,
    pendingBalance: 0,
    processingBalance: 0,
    withdrawnBalance: 0,
    currency: "INR",
  };

  const ledgerEntries: unknown[] = [];

  const applyUpdate = (data: Record<string, unknown>) => {
    for (const [field, op] of Object.entries(data)) {
      if (typeof op === "object" && op !== null) {
        const { increment, decrement } = op as { increment?: number; decrement?: number };
        if (increment != null) (wallet as Record<string, number>)[field] += increment;
        if (decrement != null) (wallet as Record<string, number>)[field] -= decrement;
      }
    }
    return { ...wallet };
  };

  const tx = {
    wallet: {
      findUniqueOrThrow: jest.fn(async () => ({ ...wallet })),
      update: jest.fn(async ({ data }: { data: Record<string, unknown> }) => applyUpdate(data)),
    },
    walletLedgerEntry: {
      create: jest.fn(async ({ data }: { data: unknown }) => {
        ledgerEntries.push(data);
        return data;
      }),
    },
  };

  return {
    prisma: {
      wallet: {
        findUnique: jest.fn(async () => ({ ...wallet })),
        findUniqueOrThrow: jest.fn(async () => ({ ...wallet })),
      },
      walletLedgerEntry: {
        findFirst: jest.fn(async () => null),
        findMany: jest.fn(async () => ledgerEntries),
      },
      $transaction: jest.fn(async (arg: unknown) => {
        if (typeof arg === "function") return arg(tx);
        return Promise.all(arg as Promise<unknown>[]);
      }),
      __test: { wallet, ledgerEntries, tx },
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prisma } = require("@clip/db");

describe("WalletService ledger invariants", () => {
  let service: WalletService;

  beforeEach(() => {
    service = new WalletService();
    prisma.__test.wallet.availableBalance = 1000;
    prisma.__test.wallet.lockedBalance = 0;
    prisma.__test.ledgerEntries.length = 0;
  });

  it("moves the full amount between buckets and writes two balanced ledger entries", async () => {
    await service.lockForCampaign("user-1", "campaign-1", 400);

    expect(prisma.__test.wallet.availableBalance).toBe(600);
    expect(prisma.__test.wallet.lockedBalance).toBe(400);

    const entries = prisma.__test.ledgerEntries as Array<{ type: string; bucket: string; amount: number }>;
    expect(entries).toHaveLength(2);
    expect(entries.find((e) => e.type === "DEBIT" && e.bucket === "AVAILABLE")?.amount).toBe(400);
    expect(entries.find((e) => e.type === "CREDIT" && e.bucket === "LOCKED")?.amount).toBe(400);
  });

  it("rejects a move that would exceed the source bucket's balance", async () => {
    await expect(service.lockForCampaign("user-1", "campaign-1", 5000)).rejects.toMatchObject({
      response: { code: "INSUFFICIENT_BALANCE" },
    });
    // Balance must be unchanged — a rejected move is not a partial move.
    expect(prisma.__test.wallet.availableBalance).toBe(1000);
    expect(prisma.__test.wallet.lockedBalance).toBe(0);
  });

  it("rejects a non-positive amount", async () => {
    await expect(service.lockForCampaign("user-1", "campaign-1", 0)).rejects.toMatchObject({
      response: { code: "INVALID_AMOUNT" },
    });
  });
});
