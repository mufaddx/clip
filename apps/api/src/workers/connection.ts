import IORedis from "ioredis";
import { getEnv } from "@clip/config";

/**
 * Shared Redis connection for every BullMQ queue/worker — see
 * docs/architecture/BACKGROUND_JOBS.md. `maxRetriesPerRequest: null` is
 * required by BullMQ for the blocking connections its workers use.
 */
export function createRedisConnection(): IORedis {
  return new IORedis(getEnv().REDIS_URL, { maxRetriesPerRequest: null });
}
