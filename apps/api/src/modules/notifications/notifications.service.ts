import { Injectable } from "@nestjs/common";
import { prisma } from "@clip/db";
import { notificationsQueue } from "../../workers/queues";

/**
 * See docs/operations/NOTIFICATION_SYSTEM.md. Any service that produces a
 * notable event calls `create()` here rather than writing to `notifications`
 * directly, so preference-checking stays in one place. Email delivery is
 * enqueued to the Notification Worker (apps/api/src/workers/notification.worker.ts)
 * rather than sent inline — a slow email provider must never block the
 * request that triggered the notification.
 */
@Injectable()
export class NotificationsService {
  async create(userId: string, type: string, title: string, body: string, data?: Record<string, unknown>) {
    const pref = await prisma.notificationPreference.findUnique({ where: { userId_type: { userId, type } } });
    const inAppEnabled = pref?.inAppEnabled ?? true;
    const emailEnabled = pref?.emailEnabled ?? true;

    let notification = null;
    if (inAppEnabled) {
      notification = await prisma.notification.create({ data: { userId, type, title, body, data } });
    }

    if (emailEnabled) {
      await notificationsQueue.add("send-email", { userId, title, body });
    }

    return notification;
  }

  async list(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markRead(userId: string, id: string) {
    return prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  }

  async getPreferences(userId: string) {
    return prisma.notificationPreference.findMany({ where: { userId } });
  }

  async setPreference(userId: string, type: string, inAppEnabled: boolean, emailEnabled: boolean) {
    return prisma.notificationPreference.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, inAppEnabled, emailEnabled },
      update: { inAppEnabled, emailEnabled },
    });
  }
}
