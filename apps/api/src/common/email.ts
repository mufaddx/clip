import { Resend } from "resend";
import { getEnv } from "@clip/config";

/**
 * Direct (non-queued) transactional email — for anything the user is
 * actively waiting on in real time, like a signup/password-reset OTP.
 * The regular notification email path (notification.worker.ts) goes
 * through a BullMQ queue, which is the right call for ordinary
 * notifications but wrong here: if the worker process isn't running,
 * a queued OTP would just sit there and the user would never receive
 * it, breaking signup entirely. So this calls Resend inline from the
 * request itself. Same "log stub" fallback when no API key is set.
 */
export async function sendEmailNow(to: string, subject: string, html: string): Promise<void> {
  const env = getEnv();

  if (!env.EMAIL_PROVIDER_API_KEY) {
    console.log(`[email stub] would send "${subject}" to ${to}:\n${html}`);
    return;
  }

  const resend = new Resend(env.EMAIL_PROVIDER_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM ?? "no-reply@vidlix.in",
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend failed to send to ${to}: ${error.message}`);
  }
}
