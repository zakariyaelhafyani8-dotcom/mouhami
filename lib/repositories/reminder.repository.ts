import { prisma } from "@/lib/prisma";

export const reminderRepository = {
  async createEvent(data: any) { return prisma.reminderEvent.create({ data }); },
  async updateEvent(id: string, data: any) { return prisma.reminderEvent.update({ where: { id }, data }); },
  async deleteEvent(id: string) { await prisma.reminder.deleteMany({ where: { eventId: id } }); return prisma.reminderEvent.delete({ where: { id } }); },
  async findEventById(id: string) { return prisma.reminderEvent.findUnique({ where: { id }, include: { client: true, cas: true, reminders: true } }); },
  async findEventsByUser(userId: string) { return prisma.reminderEvent.findMany({ where: { userId }, orderBy: { date: "asc" }, include: { client: true, cas: true } }); },
  async createReminders(dataArray: any[]) { return prisma.reminder.createMany({ data: dataArray }); },
  async findPendingReminders(userId: string) {
    const now = new Date();
    return prisma.reminder.findMany({ where: { userId, notified: false, dismissed: false, remindAt: { lte: now } }, include: { event: { include: { client: true, cas: true } } }, orderBy: { remindAt: "asc" } });
  },
  async findNextEvent(userId: string) {
    const now = new Date();
    return prisma.reminderEvent.findFirst({ where: { userId, date: { gte: now } }, orderBy: { date: "asc" }, include: { client: true, cas: true } });
  },
  async findTodayEvents(userId: string) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return prisma.reminderEvent.findMany({ where: { userId, date: { gte: start, lte: end } }, orderBy: { time: "asc" }, include: { client: true, cas: true } });
  },
  async markNotified(id: string) { return prisma.reminder.update({ where: { id }, data: { notified: true } }); },
  async dismissReminder(id: string) { return prisma.reminder.update({ where: { id }, data: { dismissed: true } }); },
  async countPending(userId: string) {
    const now = new Date();
    return prisma.reminder.count({ where: { userId, notified: false, dismissed: false, remindAt: { lte: now } } });
  },
  async deleteRemindersByEventId(eventId: string) { return prisma.reminder.deleteMany({ where: { eventId } }); },
};
