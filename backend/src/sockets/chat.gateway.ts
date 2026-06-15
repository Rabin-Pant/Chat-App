import { SocketManager } from './socket.manager';
import { MessageEntity } from '../modules/messages/message.entity';
import { NotificationService } from '../modules/notifications/notification.service';
import { UnreadService } from '../modules/presence/unread.service';
import { ConversationRepository } from '../modules/conversations/conversation.repository';
import { NotificationType } from '../common/types';
import { AppDataSource } from '../config/database';
import { UserEntity } from '../modules/users/user.entity';

export class ChatGateway {
  private notificationService = new NotificationService();
  private unreadService = new UnreadService();
  private conversationRepository = new ConversationRepository();

  private get socketManager(): SocketManager {
    return SocketManager.getInstance();
  }

async onNewMessage(message: MessageEntity): Promise<void> {
  await this.conversationRepository.updateTimestamp(message.conversationId);

  this.socketManager.emitToConversation(
    message.conversationId,
    'message:receive',
    message
  );

  const memberIds = await this.conversationRepository.getConversationMemberIds(
    message.conversationId
  );

  await this.unreadService.incrementUnread(
    message.conversationId,
    message.senderId,
    memberIds
  );

  const sender = await AppDataSource.getRepository(UserEntity).findOne({
    where: { id: message.senderId },
  });

  for (const memberId of memberIds) {
    if (memberId === message.senderId) continue;

    await this.conversationRepository.unhideConversationForUser(
      memberId,
      message.conversationId
    );
    this.socketManager.emitToUser(memberId, 'conversation:show', {
  conversationId: message.conversationId,
});

    const notification = await this.notificationService.createNotification(
      memberId,
      NotificationType.NEW_MESSAGE,
      {
        messageId: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: sender?.displayName || sender?.email || 'Someone',
        preview: message.content?.substring(0, 50),
      }
    );

    this.socketManager.emitToUser(memberId, 'notification:new', notification);

    const unreadCounts = await this.unreadService.getUnreadCounts(memberId);
    this.socketManager.emitToUser(memberId, 'unread:update', { unreadCounts });
  }
}

  async onMessageDeleted(
    messageId: string,
    conversationId: string,
    type: 'hard' | 'unsend'
  ): Promise<void> {
    this.socketManager.emitToConversation(conversationId, 'message:deleted', {
      messageId,
      type,
    });
  }

  async onReactionUpdate(
    messageId: string,
    conversationId: string,
    reactions: any
  ): Promise<void> {
    this.socketManager.emitToConversation(conversationId, 'reaction:update', {
      messageId,
      reactions,
    });
  }
}