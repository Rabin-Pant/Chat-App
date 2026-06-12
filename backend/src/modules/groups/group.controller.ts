import { Request, Response } from 'express';
import { GroupService } from './group.service';
import { UserEntity } from '../users/user.entity';

export class GroupController {
  private groupService = new GroupService();

  createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const { name, memberIds, description } = req.body;

      if (!name) {
        res.status(400).json({ message: 'Group name is required' });
        return;
      }

      const group = await this.groupService.createGroup(
        user.id, name, memberIds || [], description
      );
      res.status(201).json({ group });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const groupId = req.params.groupId as string;
      const group = await this.groupService.getGroup(groupId);
      if (!group) {
        res.status(404).json({ message: 'Group not found' });
        return;
      }
      res.json({ group });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  updateGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const groupId = req.params.groupId as string;
      const { name, avatarUrl, description } = req.body;

      const group = await this.groupService.updateGroup(groupId, user.id, {
        name, avatarUrl, description,
      });
      res.json({ group });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  addMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const groupId = req.params.groupId as string;
      const userId = req.params.userId as string;

      const member = await this.groupService.addMember(groupId, user.id, userId);
      res.status(201).json({ member });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  removeMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as UserEntity;
      const groupId = req.params.groupId as string;
      const userId = req.params.userId as string;

      await this.groupService.removeMember(groupId, user.id, userId);
      res.json({ message: 'Member removed' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const groupId = req.params.groupId as string;
      const members = await this.groupService.getMembers(groupId);
      res.json({ members });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}