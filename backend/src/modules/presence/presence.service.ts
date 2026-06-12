import { AppDataSource } from '../../config/database';
import { UserEntity } from '../users/user.entity';

export class PresenceService {
  private userRepository = AppDataSource.getRepository(UserEntity);

  async setOnline(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      isOnline: true,
      lastSeenAt: new Date(),
    });
  }

  async setOffline(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      isOnline: false,
      lastSeenAt: new Date(),
    });
  }

  async getStatus(userId: string): Promise<{ isOnline: boolean; lastSeenAt: Date | null }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return { isOnline: false, lastSeenAt: null };
    return { isOnline: user.isOnline, lastSeenAt: user.lastSeenAt };
  }

  async getOnlineUsers(userIds: string[]): Promise<string[]> {
    const users = await this.userRepository
      .createQueryBuilder('u')
      .where('u.id IN (:...userIds)', { userIds })
      .andWhere('u.isOnline = true')
      .getMany();
    return users.map((u) => u.id);
  }
}