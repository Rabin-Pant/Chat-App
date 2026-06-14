import { AppDataSource } from '../../config/database';
import { BlockEntity } from './block.entity';

export class BlockService {
  private repository = AppDataSource.getRepository(BlockEntity);

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) throw new Error('Cannot block yourself');
    const existing = await this.repository.findOne({
      where: { blockerId, blockedId },
    });
    if (existing) throw new Error('User already blocked');
    await this.repository.save({ blockerId, blockedId });
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.repository.delete({ blockerId, blockedId });
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.repository.findOne({
      where: { blockerId, blockedId },
    });
    return !!block;
  }

  async isEitherBlocked(userAId: string, userBId: string): Promise<boolean> {
    const block = await this.repository
      .createQueryBuilder('b')
      .where(
        '(b.blockerId = :userAId AND b.blockedId = :userBId) OR (b.blockerId = :userBId AND b.blockedId = :userAId)',
        { userAId, userBId }
      )
      .getOne();
    return !!block;
  }

  async getBlockedUsers(userId: string): Promise<BlockEntity[]> {
    return this.repository.find({
      where: { blockerId: userId },
      relations: { blocked: true },
    });
  }
}