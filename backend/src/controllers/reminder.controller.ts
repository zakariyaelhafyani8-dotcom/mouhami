import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { reminderService } from "../services/reminder.service";

export const reminderController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await reminderService.createEvent(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await reminderService.updateEvent(req.user!.userId, req.params.id as string, req.body);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await reminderService.deleteEvent(req.user!.userId, req.params.id as string);
      res.json({ success: true, message: "تم حذف الحدث بنجاح" });
    } catch (error) {
      next(error);
    }
  },

  async getNext(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const event = await reminderService.getNextEvent(req.user!.userId);
      res.json({ success: true, data: event || null });
    } catch (error) {
      next(error);
    }
  },

  async getToday(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await reminderService.getTodayEvents(req.user!.userId);
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  },

  async getPending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reminders = await reminderService.getPendingReminders(req.user!.userId);
      res.json({ success: true, data: reminders });
    } catch (error) {
      next(error);
    }
  },

  async getPendingCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await reminderService.getPendingCount(req.user!.userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  },

  async dismiss(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await reminderService.dismissReminder(req.user!.userId, req.params.id as string);
      res.json({ success: true, message: "تم إلغاء التذكير" });
    } catch (error) {
      next(error);
    }
  },
};
