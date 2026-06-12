import { AppDataSource } from '../../config/database';
import { UserEntity } from './user.entity';
import { In } from 'typeorm';

export class UserRepository {
  private repository = AppDataSource.getRepository(UserEntity);

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

 async findByIds(ids: string[]): Promise<UserEntity[]> {
  return this.repository.findBy({ id: In(ids) });
}

  async searchUsers(query: string, currentUserId: string): Promise<UserEntity[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere(
        '(user.email ILIKE :query OR user.displayName ILIKE :query)',
        { query: `%${query}%` }
      )
      .limit(20)
      .getMany();
  }

  async updateUser(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async setOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await this.repository.update(id, {
      isOnline,
      lastSeenAt: isOnline ? undefined : new Date(),
    });
  }
}