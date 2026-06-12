import { AppDataSource } from '../../config/database';
import { GroupEntity } from './group.entity';
import { GroupMemberEntity } from './group-member.entity';
import { GroupMemberRole } from '../../common/types';

export class GroupRepository {
  private groupRepo = AppDataSource.getRepository(GroupEntity);
  private memberRepo = AppDataSource.getRepository(GroupMemberEntity);

  async findById(id: string): Promise<GroupEntity | null> {
  return this.groupRepo.findOne({
    where: { id },
    relations: {
      members: {
        user: true,
      },
    },
  });
}

  async findByConversationId(conversationId: string): Promise<GroupEntity | null> {
    return this.groupRepo.findOne({ where: { conversationId } });
  }

  async createGroup(data: Partial<GroupEntity>): Promise<GroupEntity> {
    const group = this.groupRepo.create(data);
    return this.groupRepo.save(group);
  }

  async updateGroup(id: string, data: Partial<GroupEntity>): Promise<GroupEntity | null> {
    await this.groupRepo.update(id, data);
    return this.findById(id);
  }

  async deleteGroup(id: string): Promise<void> {
    await this.groupRepo.delete(id);
  }

  async addMember(groupId: string, userId: string, role: GroupMemberRole = GroupMemberRole.MEMBER): Promise<GroupMemberEntity> {
    const member = this.memberRepo.create({ groupId, userId, role });
    return this.memberRepo.save(member);
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await this.memberRepo.delete({ groupId, userId });
  }

  async findMember(groupId: string, userId: string): Promise<GroupMemberEntity | null> {
    return this.memberRepo.findOne({ where: { groupId, userId } });
  }

  async updateMemberRole(groupId: string, userId: string, role: GroupMemberRole): Promise<void> {
    await this.memberRepo.update({ groupId, userId }, { role });
  }

  async getMembers(groupId: string): Promise<GroupMemberEntity[]> {
  return this.memberRepo.find({
    where: { groupId },
    relations: {
      user: true,
    },
  });
}
}