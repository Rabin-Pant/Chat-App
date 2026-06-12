import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Unique
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { MessageEntity } from '../messages/message.entity';

@Entity('reactions')
@Unique(['messageId', 'userId'])
export class ReactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  messageId: string;

  @Column()
  userId: string;

  @ManyToOne(() => MessageEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: MessageEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ length: 10 })
  emoji: string;

  @CreateDateColumn()
  createdAt: Date;
}