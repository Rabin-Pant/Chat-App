import { AppDataSource } from '../../config/database';
import { MessageEntity } from './message.entity';
import { MessageType } from '../../common/types';

export class MessageRepository {
  private repository = AppDataSource.getRepository(MessageEntity);

  async findById(id: string): Promise<MessageEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async getMessages(
  conversationId: string,
  userId: string,
  limit: number = 50,
  before?: string
): Promise<MessageEntity[]> {
  const query = this.repository
    .createQueryBuilder('m')
    .leftJoinAndSelect('m.sender', 'sender')
    .where('m.conversationId = :conversationId', { conversationId })
    .andWhere(
  '("m"."deletedForUsers" IS NULL OR "m"."deletedForUsers" NOT LIKE :userId)',
  { userId: `%${userId}%` }
)
    .andWhere('m.type != :deleted', { deleted: MessageType.DELETED })
    .orderBy('m.createdAt', 'DESC')
    .limit(limit);

  if (before) {
    const beforeMessage = await this.findById(before);
    if (beforeMessage) {
      query.andWhere('m.createdAt < :beforeDate', { beforeDate: beforeMessage.createdAt });
    }
  }

  const messages = await query.getMany();
  return messages.reverse();
}

  async createMessage(data: Partial<MessageEntity>): Promise<MessageEntity> {
    const message = this.repository.create(data);
    return this.repository.save(message);
  }

  async softDeleteForUser(messageId: string, userId: string): Promise<void> {
    const message = await this.findById(messageId);
    if (!message) throw new Error('Message not found');

    const deletedForUsers = message.deletedForUsers || [];
    if (!deletedForUsers.includes(userId)) {
      deletedForUsers.push(userId);
      await this.repository.update(messageId, { deletedForUsers });
    }
  }

  async hardDeleteMessage(messageId: string): Promise<void> {
    await this.repository.update(messageId, {
      content: null,
      type: MessageType.DELETED,
    });
  }

  async unsendMessage(messageId: string): Promise<void> {
    await this.repository.update(messageId, {
      content: null,
      type: MessageType.UNSENT,
    });
  }

  async getMessagesAfterDate(conversationId: string, userId: string, afterDate: Date): Promise<MessageEntity[]> {
  return this.repository
    .createQueryBuilder('m')
    .leftJoinAndSelect('m.sender', 'sender')
    .where('m.conversationId = :conversationId', { conversationId })
    .andWhere('m.createdAt > :afterDate', { afterDate })
    .andWhere(
  '("m"."deletedForUsers" IS NULL OR "m"."deletedForUsers" NOT LIKE :userId)',
  { userId: `%${userId}%` }
)
    .andWhere('m.type != :deleted', { deleted: MessageType.DELETED })
    .orderBy('m.createdAt', 'ASC')
    .getMany();
}
}