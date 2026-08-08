import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('sources')
export class SourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  name!: string;

  @Column()
  status!: string;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'last_checked' })
  lastChecked!: Date;
}
