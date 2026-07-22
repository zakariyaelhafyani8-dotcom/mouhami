import { reminderRepository } from "../repositories/reminder.repository";

function parseEventDateTime(date: Date, time?: string): Date {
  if (!time) return new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hours || 0, minutes || 0, 0, 0);
  return d;
}

function calculateRemindTimes(eventDate: Date, eventTime?: string): Date[] {
  const eventDateTime = parseEventDateTime(eventDate, eventTime);
  return [
    new Date(eventDateTime.getTime() - 7 * 24 * 60 * 60 * 1000),  // J-7
    new Date(eventDateTime.getTime() - 3 * 24 * 60 * 60 * 1000),  // J-3
    new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000),      // J-1
    new Date(eventDateTime.getTime() - 2 * 60 * 60 * 1000),       // H-2
    new Date(eventDateTime.getTime() - 30 * 60 * 1000),           // M-30
  ].filter((d) => d > new Date());
}

export const reminderService = {
  async createEvent(userId: string, data: any) {
    // Convert date string to Date object for Prisma
    const eventDate = new Date(data.date + (data.time ? `T${data.time}` : "T00:00:00"));
    const event = await reminderRepository.createEvent({
      title: data.title,
      description: data.description || null,
      type: data.type,
      date: eventDate,
      time: data.time || null,
      lieu: data.lieu || null,
      priority: data.priority || "NORMALE",
      clientId: data.clientId || null,
      caseId: data.caseId || null,
      userId,
    });

    const remindTimes = calculateRemindTimes(eventDate, data.time);
    if (remindTimes.length > 0) {
      const reminders = remindTimes.map((remindAt) => ({
        eventId: event.id,
        userId,
        title: data.title,
        description: data.description || null,
        remindAt,
      }));
      await reminderRepository.createReminders(reminders);
    }

    return event;
  },

  async updateEvent(userId: string, id: string, data: any) {
    const existing = await reminderRepository.findEventById(id);
    if (!existing) throw { statusCode: 404, message: "الحدث غير موجود" };
    if (existing.userId !== userId) throw { statusCode: 403, message: "غير مصرح" };

    const event = await reminderRepository.updateEvent(id, data);

    // Recalculate reminders if date/time changed
    if (data.date || data.time) {
      await reminderRepository.deleteRemindersByEventId(id);
      const remindTimes = calculateRemindTimes(
        data.date || existing.date,
        data.time ?? existing.time ?? undefined
      );
      if (remindTimes.length > 0) {
        const reminders = remindTimes.map((remindAt) => ({
          eventId: id,
          userId,
          title: data.title || existing.title,
          description: data.description ?? existing.description,
          remindAt,
        }));
        await reminderRepository.createReminders(reminders);
      }
    }

    return event;
  },

  async deleteEvent(userId: string, id: string) {
    const existing = await reminderRepository.findEventById(id);
    if (!existing) throw { statusCode: 404, message: "الحدث غير موجود" };
    if (existing.userId !== userId) throw { statusCode: 403, message: "غير مصرح" };
    return reminderRepository.deleteEvent(id);
  },

  async getNextEvent(userId: string) {
    return reminderRepository.findNextEvent(userId);
  },

  async getTodayEvents(userId: string) {
    return reminderRepository.findTodayEvents(userId);
  },

  async getPendingReminders(userId: string) {
    return reminderRepository.findPendingReminders(userId);
  },

  async getPendingCount(userId: string) {
    return reminderRepository.countPending(userId);
  },

  async dismissReminder(userId: string, id: string) {
    return reminderRepository.dismissReminder(id);
  },

  async markNotified(userId: string, id: string) {
    return reminderRepository.markNotified(id);
  },
};
