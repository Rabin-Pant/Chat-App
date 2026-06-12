import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';

export class UserService {
  private userRepository = new UserRepository();

  async getUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateProfile(
    id: string,
    data: { displayName?: string; avatarUrl?: string }
  ): Promise<UserEntity | null> {
    return this.userRepository.updateUser(id, data);
  }

  async searchUsers(query: string, currentUserId: string): Promise<UserEntity[]> {
    if (!query || query.trim().length < 2) return [];
    return this.userRepository.searchUsers(query.trim(), currentUserId);
  }

  async setOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    return this.userRepository.setOnlineStatus(id, isOnline);
  }

  sanitizeUser(user: UserEntity): Partial<UserEntity> {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isOnline: user.isOnline,
      lastSeenAt: user.lastSeenAt,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}