import { MessageRepository } from './message.repository';
import { ConversationRepository } from '../conversations/conversation.repository';
import { MessageEntity } from './message.entity';
import { MessageType, MessageStatus } from '../../common/types';
import { ChatGateway } from '../../sockets/chat.gateway';
import { BlockService } from '../users/block.service';

export class MessageService {
  private messageRepository = new MessageRepository();
  private conversationRepository = new ConversationRepository();
  private chatGateway = new ChatGateway();
  private blockService = new BlockService();

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.TEXT,
    replyToId?: string
  ): Promise<MessageEntity> {
    const isMember = await this.conversationRepository.isUserInConversation(
      senderId, conversationId
    );
    if (!isMember) throw new Error('Not a member of this conversation');

    const memberIds = await this.conversationRepository.getConversationMemberIds(
      conversationId
    );

    for (const memberId of memberIds) {
      if (memberId === senderId) continue;
      const blocked = await this.blockService.isEitherBlocked(senderId, memberId);
      if (blocked) throw new Error('Cannot send message — user is blocked');
    }

    const message = await this.messageRepository.createMessage({
      conversationId,
      senderId,
      content,
      type,
      status: MessageStatus.SENT,
      deletedForUsers: [],
      readByUsers: [],
      replyToId: replyToId || null,
    });

    await this.chatGateway.onNewMessage(message);
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

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
  await this.messageRepository.markAsRead(conversationId, userId);
}

  async hardDelete(messageId: string, userId: string): Promise<MessageEntity> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.senderId !== userId) throw new Error('Only sender can hard delete');

    await this.messageRepository.hardDeleteMessage(messageId);
    const updated = (await this.messageRepository.findById(messageId))!;
    await this.chatGateway.onMessageDeleted(messageId, message.conversationId, 'hard');
    return updated;
  }

  async unsendMessage(messageId: string, userId: string): Promise<MessageEntity> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.senderId !== userId) throw new Error('Only sender can unsend');

    const minutesSinceSent = (Date.now() - message.createdAt.getTime()) / 1000 / 60;
    if (minutesSinceSent > 10) throw new Error('Can only unsend within 10 minutes');

    await this.messageRepository.unsendMessage(messageId);
    const updated = (await this.messageRepository.findById(messageId))!;
    await this.chatGateway.onMessageDeleted(messageId, message.conversationId, 'unsend');
    return updated;
  }
}