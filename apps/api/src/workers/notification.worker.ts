import { Worker } from "bullmq";
import { Resend } from "resend";
import { prisma } from "@clip/db";
import { createRedisConnection } from "./connection";
import { QUEUE_NAMES, type SendEmailJob } from "./queues";
import { getEnv } from "@clip/config";

/**
 * Notification Worker — fans out the email half of a notification via
 * Resend. See docs/architecture/BACKGROUND_JOBS.md and
 * docs/operations/NOTIFICATION_SYSTEM.md. Falls back to a visible log
 * line (not a silent no-op) when EMAIL_PROVIDER_API_KEY isn't set, so
 * local dev without a Resend key still works.
 */
export function startNotificationWorker(): Worker<SendEmailJob> {
  return new Worker<SendEmailJob>(
    QUEUE_NAMES.notifications,
    async (job) => {
      const env = getEnv();
      const user = await prisma.user.findUnique({ where: { id: job.data.userId }, select: { email: true } });
      if (!user) return; // account may have been deleted/anonymized since the job was enqueued

      if (!env.EMAIL_PROVIDER_API_KEY) {
        console.log(`[email stub] would send "${job.data.title}" to ${user.email}`);
        return;
      }

      const resend = new Resend(env.EMAIL_PROVIDER_API_KEY);
      const { error } = await resend.emails.send({
        from: env.EMAIL_FROM ?? "no-reply@vidlix.in",
        to: user.email,
        subject: job.data.title,
        html: `<p>${escapeHtml(job.data.body)}</p>`,
      });

      if (error) {
        // Thrown so BullMQ retries per the queue's backoff policy — see
        // docs/architecture/BACKGROUND_JOBS.md "Job requirements".
        throw new Error(`Resend failed to send to ${user.email}: ${error.message}`);
      }
    },
    { connection: createRedisConnection() }
  );
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
