import { NotificationRepository } from './notification.repository';
import { NotificationEntity } from './notification.entity';
import { NotificationType } from '../../common/types';

export class NotificationService {
  private notificationRepository = new NotificationRepository();

  async createNotification(
    userId: string,
    type: NotificationType,
    payload: Record<string, any>
  ): Promise<NotificationEntity> {
    return this.notificationRepository.createNotification(userId, type, payload);
  }

  async getUserNotifications(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.getUserNotifications(userId);
  }

  async markAsRead(id: string): Promise<void> {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }
}