import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Unique
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('blocks')
@Unique(['blockerId', 'blockedId'])
export class BlockEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockerId: string;

  @Column()
  blockedId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockerId' })
  blocker: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockedId' })
  blocked: UserEntity;

  @CreateDateColumn()
  createdAt: Date;
}