import { Router, Request, Response } from 'express';
import { BlockService } from './block.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { UserEntity } from './user.entity';

const router = Router();
const blockService = new BlockService();

router.use(authMiddleware);

router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const user = req.user as UserEntity;
    const blockedId = req.params.userId as string;
    await blockService.blockUser(user.id, blockedId);
    res.json({ message: 'User blocked' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const user = req.user as UserEntity;
    const blockedId = req.params.userId as string;
    await blockService.unblockUser(user.id, blockedId);
    res.json({ message: 'User unblocked' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user as UserEntity;
    const blocked = await blockService.getBlockedUsers(user.id);
    res.json({ blocked });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const user = req.user as UserEntity;
    const blockedId = req.params.userId as string;
    const isBlocked = await blockService.isBlocked(user.id, blockedId);
    res.json({ isBlocked });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;