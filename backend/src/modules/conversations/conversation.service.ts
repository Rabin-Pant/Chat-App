import { ConversationRepository } from './conversation.repository';
import { ConversationEntity } from './conversation.entity';
import { ConversationType } from '../../common/types';

export class ConversationService {
  private conversationRepository = new ConversationRepository();

  async getOrCreateDM(userAId: string, userBId: string): Promise<ConversationEntity> {
    const existing = await this.conversationRepository.findDMBetweenUsers(userAId, userBId);
    if (existing) return existing;

    const conversation = await this.conversationRepository.createConversation(ConversationType.DM);
    await this.conversationRepository.createUserConversation(userAId, conversation.id);
    await this.conversationRepository.createUserConversation(userBId, conversation.id);

    return conversation;
  }

  async getUserConversations(userId: string): Promise<any[]> {
    return this.conversationRepository.getUserConversations(userId);
  }

  async clearConversationForUser(userId: string, conversationId: string): Promise<void> {
    const isMember = await this.conversationRepository.isUserInConversation(userId, conversationId);
    if (!isMember) throw new Error('Not a member of this conversation');
    await this.conversationRepository.clearConversationForUser(userId, conversationId);
  }

  async isUserInConversation(userId: string, conversationId: string): Promise<boolean> {
    return this.conversationRepository.isUserInConversation(userId, conversationId);
  }
}