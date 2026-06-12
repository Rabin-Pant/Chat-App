import { Request, Response } from 'express';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';

export class UserController {
  private userService = new UserService();

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      res.json({ user: this.userService.sanitizeUser(user) });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const { displayName, avatarUrl } = req.body;

      const updated = await this.userService.updateProfile(user.id, {
        displayName,
        avatarUrl,
      });

      res.json({ user: updated ? this.userService.sanitizeUser(updated) : null });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as UserEntity;
    const query = Array.isArray(req.query.q)
      ? req.query.q[0] as string
      : req.query.q as string;

    if (!query) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const users = await this.userService.searchUsers(query, user.id);
    res.json({ users: users.map((u) => this.userService.sanitizeUser(u)) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

  getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await this.userService.getUserById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: this.userService.sanitizeUser(user) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
}