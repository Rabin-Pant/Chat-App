import { AppDataSource } from '../../config/database';
import { ConversationEntity } from './conversation.entity';
import { UserConversationEntity } from './user-conversation.entity';
import { ConversationType } from '../../common/types';
import { GroupEntity } from '../groups/group.entity';

export class ConversationRepository {
  private repository = AppDataSource.getRepository(ConversationEntity);
  private ucRepository = AppDataSource.getRepository(UserConversationEntity);

  async findById(id: string): Promise<ConversationEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findDMBetweenUsers(userAId: string, userBId: string): Promise<ConversationEntity | null> {
    return this.repository
      .createQueryBuilder('c')
      .innerJoin('user_conversations', 'uc1', 'uc1.conversationId = c.id AND uc1.userId = :userAId', { userAId })
      .innerJoin('user_conversations', 'uc2', 'uc2.conversationId = c.id AND uc2.userId = :userBId', { userBId })
      .where('c.type = :type', { type: ConversationType.DM })
      .getOne();
  }

  async createConversation(type: ConversationType): Promise<ConversationEntity> {
    const conversation = this.repository.create({ type });
    return this.repository.save(conversation);
  }

  async createUserConversation(userId: string, conversationId: string): Promise<UserConversationEntity> {
    const uc = this.ucRepository.create({ userId, conversationId });
    return this.ucRepository.save(uc);
  }

  async getUserConversations(userId: string): Promise<any[]> {
  const ucs = await this.ucRepository
    .createQueryBuilder('uc')
    .innerJoinAndSelect('uc.conversation', 'c')
    .where('uc.userId = :userId', { userId })
    .andWhere('uc.isArchived = false')
    .orderBy('c.updatedAt', 'DESC')
    .getMany();

  const result = [];
  for (const uc of ucs) {
    const item: any = { ...uc };
    if (uc.conversation.type === 'dm') {
      const other = await this.ucRepository
        .createQueryBuilder('uc2')
        .innerJoinAndSelect('uc2.user', 'u')
        .where('uc2.conversationId = :convId', { convId: uc.conversationId })
        .andWhere('uc2.userId != :userId', { userId })
        .getOne();
      item.otherUser = other?.user || null;
   } else {
  const group = await AppDataSource.getRepository(GroupEntity)
  .findOne({
    where: { conversationId: uc.conversationId },
    relations: { members: { user: true } },
  });
  item.group = group || null;
}
    result.push(item);
  }
  return result;
}

  async findUserConversation(userId: string, conversationId: string): Promise<UserConversationEntity | null> {
    return this.ucRepository.findOne({ where: { userId, conversationId } });
  }

  async clearConversationForUser(userId: string, conversationId: string): Promise<void> {
    await this.ucRepository.update(
      { userId, conversationId },
      { clearedAt: new Date() }
    );
  }

  async isUserInConversation(userId: string, conversationId: string): Promise<boolean> {
    const uc = await this.ucRepository.findOne({ where: { userId, conversationId } });
    return !!uc;
  }

 async getConversationMemberIds(conversationId: string): Promise<string[]> {
  const members = await this.ucRepository.find({
    where: { conversationId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}
}