import { Request, Response } from 'express';
import { ReactionService } from './reaction.service';
import { UserEntity } from '../users/user.entity';
import { ChatGateway } from '../../sockets/chat.gateway';
import { MessageRepository } from '../messages/message.repository';

export class ReactionController {
  private reactionService = new ReactionService();
  private chatGateway = new ChatGateway();
  private messageRepository = new MessageRepository();

  addReaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const messageId = req.params.messageId as string;
      const { emoji } = req.body;

      if (!emoji) {
        res.status(400).json({ message: 'Emoji is required' });
        return;
      }

      const reaction = await this.reactionService.addReaction(messageId, user.id, emoji);

      const message = await this.messageRepository.findById(messageId);
      if (message) {
        const reactions = await this.reactionService.getReactions(messageId);
        await this.chatGateway.onReactionUpdate(messageId, message.conversationId, reactions);
      }

      res.status(201).json({ reaction });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  removeReaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const messageId = req.params.messageId as string;

      await this.reactionService.removeReaction(messageId, user.id);

      const message = await this.messageRepository.findById(messageId);
      if (message) {
        const reactions = await this.reactionService.getReactions(messageId);
        await this.chatGateway.onReactionUpdate(messageId, message.conversationId, reactions);
      }

      res.json({ message: 'Reaction removed' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getReactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const messageId = req.params.messageId as string;
      const reactions = await this.reactionService.getReactions(messageId);
      res.json({ reactions });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}