import { Router } from 'express';
import { NotificationService } from './notification.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { UserEntity } from '../users/user.entity';
import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { NotificationEntity } from './notification.entity';

const router = Router();
const notificationService = new NotificationService();

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const user = req.user as UserEntity;
  const notifications = await notificationService.getUserNotifications(user.id);
  res.json({ notifications });
});

router.get('/unread-count', async (req: Request, res: Response) => {
  const user = req.user as UserEntity;
  const count = await notificationService.getUnreadCount(user.id);
  res.json({ count });
});

router.put('/read-all', async (req: Request, res: Response) => {
  const user = req.user as UserEntity;
  await notificationService.markAllAsRead(user.id);
  res.json({ message: 'All marked as read' });
});

router.put('/:id/read', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await notificationService.markAsRead(id);
  res.json({ message: 'Marked as read' });
});

router.delete('/', async (req: Request, res: Response) => {
  const user = req.user as UserEntity;
  await AppDataSource.getRepository(NotificationEntity).delete({ userId: user.id });
  res.json({ message: 'All notifications deleted' });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = req.user as UserEntity;
  await AppDataSource.getRepository(NotificationEntity).delete({ id, userId: user.id });
  res.json({ message: 'Notification deleted' });
});

export default router;