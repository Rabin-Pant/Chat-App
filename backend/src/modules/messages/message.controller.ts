import { Request, Response } from 'express';
import { MessageService } from './message.service';
import { ConversationService } from '../conversations/conversation.service';
import { UserEntity } from '../users/user.entity';
import { MessageType } from '../../common/types';

export class MessageController {
  private messageService = new MessageService();
  private conversationService = new ConversationService();

  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const conversationId = req.params.conversationId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before as string | undefined;

      const messages = await this.messageService.getMessages(
        conversationId, user.id, limit, before
      );
      res.json({ messages });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const conversationId = req.params.conversationId as string;
      const { content, type } = req.body;

      if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return;
      }

      const message = await this.messageService.sendMessage(
        conversationId, user.id, content, type || MessageType.TEXT
      );
      res.status(201).json({ message });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  startDM = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const userId = req.params.userId as string;

      const conversation = await this.conversationService.getOrCreateDM(user.id, userId);
      res.json({ conversation });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const conversations = await this.conversationService.getUserConversations(user.id);
      res.json({ conversations });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  clearConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const conversationId = req.params.conversationId as string;
      await this.conversationService.clearConversationForUser(user.id, conversationId);
      res.json({ message: 'Conversation cleared' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  softDelete = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const messageId = req.params.messageId as string;
      await this.messageService.softDeleteForSelf(messageId, user.id);
      res.json({ message: 'Message deleted for you' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  hardDelete = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const messageId = req.params.messageId as string;
      const message = await this.messageService.hardDelete(messageId, user.id);
      res.json({ message });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  unsendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const messageId = req.params.messageId as string;
      const message = await this.messageService.unsendMessage(messageId, user.id);
      res.json({ message });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}