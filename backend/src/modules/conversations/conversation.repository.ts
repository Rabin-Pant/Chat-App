import { AppDataSource } from '../../config/database';
import { ConversationEntity } from './conversation.entity';
import { UserConversationEntity } from './user-conversation.entity';
import { ConversationType } from '../../common/types';
import { GroupEntity } from '../groups/group.entity';
import { MessageEntity } from '../messages/message.entity';

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
    .andWhere('uc.isHidden = false')
    .orderBy('c.updatedAt', 'DESC')
    .getMany();

  if (ucs.length === 0) return [];

  const conversationIds = ucs.map((uc) => uc.conversationId);

  const lastMessages = await AppDataSource.getRepository(MessageEntity)
    .createQueryBuilder('m')
    .select(['m.conversationId', 'm.id', 'm.content', 'm.type', 'm.createdAt', 'm.senderId'])
    .where('m.conversationId IN (:...ids)', { ids: conversationIds })
    .andWhere(
      'm.createdAt = (SELECT MAX(m2."createdAt") FROM messages m2 WHERE m2."conversationId" = m."conversationId")'
    )
    .getMany();

  const lastMessageMap: Record<string, any> = {};
  for (const msg of lastMessages) {
    lastMessageMap[msg.conversationId] = msg;
  }

  const otherUserIds = ucs
    .filter((uc) => uc.conversation.type === 'dm')
    .map((uc) => uc.conversationId);

  const otherUsers = otherUserIds.length > 0
    ? await this.ucRepository
        .createQueryBuilder('uc2')
        .innerJoinAndSelect('uc2.user', 'u')
        .where('uc2.conversationId IN (:...ids)', { ids: otherUserIds })
        .andWhere('uc2.userId != :userId', { userId })
        .getMany()
    : [];

  const otherUserMap: Record<string, any> = {};
  for (const uc of otherUsers) {
    otherUserMap[uc.conversationId] = uc.user;
  }

  const groupConvIds = ucs
    .filter((uc) => uc.conversation.type === 'group')
    .map((uc) => uc.conversationId);

  const groups = groupConvIds.length > 0
    ? await AppDataSource.getRepository(GroupEntity)
        .createQueryBuilder('g')
        .leftJoinAndSelect('g.members', 'members')
        .leftJoinAndSelect('members.user', 'memberUser')
        .where('g.conversationId IN (:...ids)', { ids: groupConvIds })
        .getMany()
    : [];

  const groupMap: Record<string, any> = {};
  for (const group of groups) {
    groupMap[group.conversationId] = group;
  }

  return ucs.map((uc) => ({
    ...uc,
    lastMessage: lastMessageMap[uc.conversationId] || null,
    otherUser: otherUserMap[uc.conversationId] || null,
    group: groupMap[uc.conversationId] || null,
  }));
}

  async findUserConversation(userId: string, conversationId: string): Promise<UserConversationEntity | null> {
    return this.ucRepository.findOne({ where: { userId, conversationId } });
  }

  async clearConversationForUser(userId: string, conversationId: string): Promise<void> {
  await this.ucRepository.update(
    { userId, conversationId },
    { clearedAt: new Date(), isHidden: true }
  );
}

  async isUserInConversation(userId: string, conversationId: string): Promise<boolean> {
    const uc = await this.ucRepository.findOne({ where: { userId, conversationId } });
    return !!uc;
  }

  async updateTimestamp(conversationId: string): Promise<void> {
  await this.repository.update(conversationId, { updatedAt: new Date() });
}

 async getConversationMemberIds(conversationId: string): Promise<string[]> {
  const members = await this.ucRepository.find({
    where: { conversationId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

async unhideConversationForUser(userId: string, conversationId: string): Promise<void> {
  await this.ucRepository.update(
    { userId, conversationId },
    { isHidden: false }
  );
}
}