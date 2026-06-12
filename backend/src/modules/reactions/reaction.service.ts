import { ReactionRepository } from './reaction.repository';
import { ReactionEntity } from './reaction.entity';

const ALLOWED_EMOJIS = ['heart', 'laugh', 'sad', 'angry', 'wow', 'thumbsup'];

export class ReactionService {
  private reactionRepository = new ReactionRepository();

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<ReactionEntity> {
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      throw new Error(`Invalid emoji. Allowed: ${ALLOWED_EMOJIS.join(', ')}`);
    }
    return this.reactionRepository.addReaction(messageId, userId, emoji);
  }

  async removeReaction(messageId: string, userId: string): Promise<void> {
    return this.reactionRepository.removeReaction(messageId, userId);
  }

  async getReactions(messageId: string): Promise<Record<string, any>> {
    return this.reactionRepository.getGroupedReactions(messageId);
  }
}