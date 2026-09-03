import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type TicketCategory, type TicketStatus } from "@clip/db";
import type { UserRole } from "@clip/types";
import { NotificationsService } from "../notifications/notifications.service";

// FINANCE_ADMIN deliberately excluded — see docs/admin/ADMIN_PERMISSIONS.md
// ("FINANCE_ADMIN does not have ticket access").
const SUPPORT_STAFF_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SUPPORT"];

/**
 * Ticket-based support — see docs/operations/SUPPORT_SYSTEM.md. Distinct
 * from disputes (contesting a specific outcome) — this handles general
 * questions/issues.
 */
@Injectable()
export class SupportService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async createTicket(userId: string, category: TicketCategory, subject: string, message: string) {
    return prisma.supportTicket.create({
      data: {
        userId,
        category,
        subject,
        status: "OPEN",
        messages: { create: { authorId: userId, authorType: "user", body: message } },
      },
      include: { messages: true },
    });
  }

  async listMine(userId: string) {
    return prisma.supportTicket.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  }

  async listAll(status?: TicketStatus) {
    return prisma.supportTicket.findMany({
      where: status ? { status } : undefined,
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { email: true, role: true } } },
    });
  }

  private async getTicketForActor(actorId: string, actorRole: UserRole, ticketId: string) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException({ code: "TICKET_NOT_FOUND", message: "Ticket not found." });
    const isOwner = ticket.userId === actorId;
    const isStaff = SUPPORT_STAFF_ROLES.includes(actorRole);
    if (!isOwner && !isStaff) throw new ForbiddenException({ code: "FORBIDDEN", message: "Not your ticket." });
    return { ticket, isStaff };
  }

  async getTicket(actorId: string, actorRole: UserRole, ticketId: string) {
    const { ticket } = await this.getTicketForActor(actorId, actorRole, ticketId);
    return prisma.supportTicket.findUnique({ where: { id: ticket.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  }

  /** Lifecycle: Open → In Progress → Waiting for User → Resolved → Closed — see docs/operations/SUPPORT_SYSTEM.md. */
  async addMessage(actorId: string, actorRole: UserRole, ticketId: string, body: string, attachments: string[] = []) {
    const { ticket, isStaff } = await this.getTicketForActor(actorId, actorRole, ticketId);

    const nextStatus: TicketStatus = isStaff
      ? "WAITING_FOR_USER"
      : ticket.status === "RESOLVED"
        ? "IN_PROGRESS" // reopened within the grace period — see docs/operations/SUPPORT_SYSTEM.md
        : "IN_PROGRESS";

    const [message] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: { ticketId, authorId: actorId, authorType: isStaff ? "admin" : "user", body, attachments },
      }),
      prisma.supportTicket.update({ where: { id: ticketId }, data: { status: nextStatus } }),
    ]);

    if (isStaff) {
      await this.notificationsService.create(ticket.userId, "support.reply", "Support replied to your ticket", body.slice(0, 140));
    }

    return message;
  }

  async updateStatus(ticketId: string, status: TicketStatus, assignedTo?: string) {
    return prisma.supportTicket.update({ where: { id: ticketId }, data: { status, assignedTo } });
  }
}
