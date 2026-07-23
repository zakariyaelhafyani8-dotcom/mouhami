// Contrôleur des notifications

import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { notificationRepository } from "../repositories/notification.repository";

export const notificationsController = {
  // GET /api/notifications
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationRepository.findByUserId(
        req.user!.userId
      );
      const unread = await notificationRepository.countUnread(req.user!.userId);
      res.json({ success: true, notifications, unread });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/notifications/:id/read
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationRepository.markAsRead(req.params.id as string);
      res.json({ success: true, message: "تمت قراءة الإشعار" });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/notifications/read-all
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationRepository.markAllAsRead(req.user!.userId);
      res.json({ success: true, message: "تمت قراءة جميع الإشعارات" });
    } catch (error) {
      next(error);
    }
  },
};
