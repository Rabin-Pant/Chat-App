import { Router } from 'express';
import { ReactionController } from './reaction.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const reactionController = new ReactionController();

router.use(authMiddleware);

router.post('/:messageId', reactionController.addReaction);
router.delete('/:messageId', reactionController.removeReaction);
router.get('/:messageId', reactionController.getReactions);

export default router;