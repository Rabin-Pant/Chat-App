import { Router } from 'express';
import { GroupController } from './group.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { AppDataSource } from '../../config/database';
import { GroupEntity } from './group.entity';
import { UserEntity } from '../users/user.entity';
import { Request, Response } from 'express';

const router = Router();
const groupController = new GroupController();

router.use(authMiddleware);

router.get('/search', async (req: Request, res: Response) => {
  try {
    const user = req.user as UserEntity;
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      res.json({ groups: [] });
      return;
    }
    const groups = await AppDataSource.getRepository(GroupEntity)
      .createQueryBuilder('g')
      .innerJoin('group_members', 'gm', 'gm."groupId" = g.id AND gm."userId" = :userId', { userId: user.id })
      .where('g.name ILIKE :query', { query: `%${query}%` })
      .getMany();
    res.json({ groups });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', groupController.createGroup);
router.get('/:groupId', groupController.getGroup);
router.put('/:groupId', groupController.updateGroup);
router.get('/:groupId/members', groupController.getMembers);
router.post('/:groupId/members/:userId', groupController.addMember);
router.delete('/:groupId/members/:userId', groupController.removeMember);

export default router;