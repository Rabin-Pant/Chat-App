import { GroupRepository } from './group.repository';
import { ConversationRepository } from '../conversations/conversation.repository';
import { GroupEntity } from './group.entity';
import { GroupMemberEntity } from './group-member.entity';
import { ConversationType, GroupMemberRole } from '../../common/types';

export class GroupService {
  private groupRepository = new GroupRepository();
  private conversationRepository = new ConversationRepository();

  async createGroup(
    ownerId: string,
    name: string,
    memberIds: string[],
    description?: string
  ): Promise<GroupEntity> {
    const conversation = await this.conversationRepository.createConversation(
      ConversationType.GROUP
    );

    const group = await this.groupRepository.createGroup({
      conversationId: conversation.id,
      ownerId,
      name,
      description,
    });

    const allMembers = [ownerId, ...memberIds.filter((id) => id !== ownerId)];
    for (const userId of allMembers) {
      await this.conversationRepository.createUserConversation(userId, conversation.id);
      const role = userId === ownerId ? GroupMemberRole.OWNER : GroupMemberRole.MEMBER;
      await this.groupRepository.addMember(group.id, userId, role);
    }

    return (await this.groupRepository.findById(group.id))!;
  }

  async getGroup(groupId: string): Promise<GroupEntity | null> {
    return this.groupRepository.findById(groupId);
  }

  async updateGroup(
    groupId: string,
    userId: string,
    data: { name?: string; avatarUrl?: string; description?: string }
  ): Promise<GroupEntity | null> {
    const member = await this.groupRepository.findMember(groupId, userId);
    if (!member || member.role === GroupMemberRole.MEMBER) {
      throw new Error('Only admins or owner can update group');
    }
    return this.groupRepository.updateGroup(groupId, data);
  }

  async addMember(groupId: string, requesterId: string, userId: string): Promise<GroupMemberEntity> {
    const requester = await this.groupRepository.findMember(groupId, requesterId);
    if (!requester || requester.role === GroupMemberRole.MEMBER) {
      throw new Error('Only admins or owner can add members');
    }

    const existing = await this.groupRepository.findMember(groupId, userId);
    if (existing) throw new Error('User is already a member');

    const group = await this.groupRepository.findById(groupId);
    if (!group) throw new Error('Group not found');

    await this.conversationRepository.createUserConversation(userId, group.conversationId);
    return this.groupRepository.addMember(groupId, userId);
  }

  async removeMember(groupId: string, requesterId: string, userId: string): Promise<void> {
    const requester = await this.groupRepository.findMember(groupId, requesterId);
    if (!requester) throw new Error('Not a member of this group');

    if (requesterId !== userId && requester.role === GroupMemberRole.MEMBER) {
      throw new Error('Only admins or owner can remove members');
    }

    await this.groupRepository.removeMember(groupId, userId);
  }

  async getMembers(groupId: string): Promise<GroupMemberEntity[]> {
    return this.groupRepository.getMembers(groupId);
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const member = await this.groupRepository.findMember(groupId, userId);
    return !!member;
  }
}