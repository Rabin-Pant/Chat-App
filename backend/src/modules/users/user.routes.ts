import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.put('/me', userController.updateProfile);
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);

export default router;