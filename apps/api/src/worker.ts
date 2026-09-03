import "reflect-metadata";

/**
 * Background worker process entrypoint — deployed and scaled independently
 * from the HTTP API (see docs/architecture/BACKGROUND_JOBS.md and
 * docs/deployment/DEPLOYMENT_ARCHITECTURE.md "Why HTTP and workers are split").
 *
 * Not yet implemented: the worker registry (Instagram Sync, Reel Detection,
 * Reel Verification, Metrics Sync, Performance Calculation, Campaign Progress,
 * Earnings, Notification, Referral Reward — see docs/architecture/BACKGROUND_JOBS.md)
 * lands in a later session, each as a BullMQ Worker bound to its queue,
 * reusing the same service layer the HTTP controllers call.
 */
async function bootstrapWorkers() {
  console.log("CLIP worker process starting — no queues registered yet (see docs/architecture/BACKGROUND_JOBS.md).");
}

bootstrapWorkers();
