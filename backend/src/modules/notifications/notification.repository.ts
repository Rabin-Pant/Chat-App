import { AppDataSource } from '../../config/database';
import { NotificationEntity } from './notification.entity';
import { NotificationType } from '../../common/types';

export class NotificationRepository {
  private repository = AppDataSource.getRepository(NotificationEntity);

  async createNotification(
    userId: string,
    type: NotificationType,
    payload: Record<string, any>
  ): Promise<NotificationEntity> {
    const notification = this.repository.create({ userId, type, payload });
    return this.repository.save(notification);
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<NotificationEntity[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.repository.update(id, { isRead: true, readAt: new Date() });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update()
      .set({ isRead: true, readAt: new Date() })
      .where('userId = :userId AND isRead = false', { userId })
      .execute();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.count({ where: { userId, isRead: false } });
  }
}