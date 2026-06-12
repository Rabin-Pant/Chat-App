import { Router } from 'express';
import { MessageController } from './message.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const messageController = new MessageController();

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.post('/conversations/dm/:userId', messageController.startDM);
router.delete('/conversations/:conversationId/clear', messageController.clearConversation);
router.get('/conversations/:conversationId/messages', messageController.getMessages);
router.post('/conversations/:conversationId/messages', messageController.sendMessage);
router.delete('/messages/:messageId/soft', messageController.softDelete);
router.delete('/messages/:messageId/hard', messageController.hardDelete);
router.delete('/messages/:messageId/unsend', messageController.unsendMessage);

export default router;