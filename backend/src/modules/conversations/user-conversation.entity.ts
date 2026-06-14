import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { ConversationEntity } from './conversation.entity';

@Entity('user_conversations')
export class UserConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => ConversationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: ConversationEntity;

  @Column({ nullable: true })
  clearedAt: Date;

  @Column({ default: false })
  isHidden: boolean;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ nullable: true })
  lastReadAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}