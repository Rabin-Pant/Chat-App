import { AppDataSource } from '../../config/database';
import { UnreadEntity } from '../notifications/unread.entity';

export class UnreadService {
  private repository = AppDataSource.getRepository(UnreadEntity);

  async incrementUnread(conversationId: string, excludeUserId: string, userIds: string[]): Promise<void> {
    for (const userId of userIds) {
      if (userId === excludeUserId) continue;

      const existing = await this.repository.findOne({
        where: { userId, conversationId },
      });

      if (existing) {
        await this.repository.update(existing.id, { count: existing.count + 1 });
      } else {
        await this.repository.save({ userId, conversationId, count: 1 });
      }
    }
  }

  async resetUnread(userId: string, conversationId: string): Promise<void> {
    await this.repository.update({ userId, conversationId }, { count: 0 });
  }

  async getUnreadCounts(userId: string): Promise<UnreadEntity[]> {
    return this.repository.find({ where: { userId } });
  }

  async getTotalUnread(userId: string): Promise<number> {
    const counts = await this.repository.find({ where: { userId } });
    return counts.reduce((sum, u) => sum + u.count, 0);
  }
}