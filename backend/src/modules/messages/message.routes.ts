import { Router, Request, Response } from 'express';
import { MessageController } from './message.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { ConversationService } from '../conversations/conversation.service';
import { UserEntity } from '../users/user.entity';

const router = Router();
const messageController = new MessageController();

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.post('/conversations/dm/:userId', messageController.startDM);
router.delete('/conversations/:conversationId/clear', messageController.clearConversation);
router.put('/conversations/:conversationId/unhide', async (req: Request, res: Response) => {
  const user = req.user as UserEntity;
  const conversationId = req.params.conversationId as string;
  const convService = new ConversationService();
  await convService.unhideConversation(user.id, conversationId);
  res.json({ message: 'Conversation unhidden' });
});
router.get('/conversations/:conversationId/messages', messageController.getMessages);
router.post('/conversations/:conversationId/messages', messageController.sendMessage);
router.delete('/messages/:messageId/soft', messageController.softDelete);
router.delete('/messages/:messageId/hard', messageController.hardDelete);
router.delete('/messages/:messageId/unsend', messageController.unsendMessage);

export default router;