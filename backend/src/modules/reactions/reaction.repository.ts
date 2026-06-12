import { AppDataSource } from '../../config/database';
import { ReactionEntity } from './reaction.entity';

export class ReactionRepository {
  private repository = AppDataSource.getRepository(ReactionEntity);

  async findReaction(messageId: string, userId: string): Promise<ReactionEntity | null> {
    return this.repository.findOne({ where: { messageId, userId } });
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<ReactionEntity> {
    const existing = await this.findReaction(messageId, userId);
    if (existing) {
      await this.repository.update(existing.id, { emoji });
      return (await this.repository.findOne({ where: { id: existing.id } }))!;
    }
    const reaction = this.repository.create({ messageId, userId, emoji });
    return this.repository.save(reaction);
  }

  async removeReaction(messageId: string, userId: string): Promise<void> {
    await this.repository.delete({ messageId, userId });
  }

  async getReactions(messageId: string): Promise<ReactionEntity[]> {
    return this.repository.find({
      where: { messageId },
      relations: { user: true },
    });
  }

  async getGroupedReactions(messageId: string): Promise<Record<string, any>> {
    const reactions = await this.getReactions(messageId);
    const grouped: Record<string, { count: number; userIds: string[] }> = {};

    for (const reaction of reactions) {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = { count: 0, userIds: [] };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].userIds.push(reaction.userId);
    }

    return grouped;
  }
}