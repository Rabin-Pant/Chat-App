import { Router } from 'express';
import { GroupController } from './group.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const groupController = new GroupController();

router.use(authMiddleware);

router.post('/', groupController.createGroup);
router.get('/:groupId', groupController.getGroup);
router.put('/:groupId', groupController.updateGroup);
router.get('/:groupId/members', groupController.getMembers);
router.post('/:groupId/members/:userId', groupController.addMember);
router.delete('/:groupId/members/:userId', groupController.removeMember);

export default router;