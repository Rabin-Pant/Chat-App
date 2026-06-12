import { MessageRepository } from './message.repository';
import { ConversationRepository } from '../conversations/conversation.repository';
import { MessageEntity } from './message.entity';
import { MessageType, MessageStatus } from '../../common/types';

export class MessageService {
  private messageRepository = new MessageRepository();
  private conversationRepository = new ConversationRepository();

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.TEXT
  ): Promise<MessageEntity> {
    const isMember = await this.conversationRepository.isUserInConversation(senderId, conversationId);
    if (!isMember) throw new Error('Not a member of this conversation');

    const message = await this.messageRepository.createMessage({
      conversationId,
      senderId,
      content,
      type,
      status: MessageStatus.SENT,
      deletedForUsers: [],
    });

    return message;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    before?: string
  ): Promise<MessageEntity[]> {
    const isMember = await this.conversationRepository.isUserInConversation(userId, conversationId);
    if (!isMember) throw new Error('Not a member of this conversation');

    const uc = await this.conversationRepository.findUserConversation(userId, conversationId);

    if (uc?.clearedAt) {
      return this.messageRepository.getMessagesAfterDate(conversationId, userId, uc.clearedAt);
    }

    return this.messageRepository.getMessages(conversationId, userId, limit, before);
  }

  async softDeleteForSelf(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    await this.messageRepository.softDeleteForUser(messageId, userId);
  }

  async hardDelete(messageId: string, userId: string): Promise<MessageEntity> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.senderId !== userId) throw new Error('Only sender can hard delete');

    await this.messageRepository.hardDeleteMessage(messageId);
    return (await this.messageRepository.findById(messageId))!;
  }

  async unsendMessage(messageId: string, userId: string): Promise<MessageEntity> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.senderId !== userId) throw new Error('Only sender can unsend');

    const minutesSinceSent = (Date.now() - message.createdAt.getTime()) / 1000 / 60;
    if (minutesSinceSent > 10) throw new Error('Can only unsend within 10 minutes');

    await this.messageRepository.unsendMessage(messageId);
    return (await this.messageRepository.findById(messageId))!;
  }
}