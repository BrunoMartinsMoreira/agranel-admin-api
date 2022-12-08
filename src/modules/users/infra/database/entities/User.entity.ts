import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn({ default: 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ default: 'now()' })
  updatedAt: Date;
}
