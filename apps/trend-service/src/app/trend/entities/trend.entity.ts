import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('trends')
export class TrendEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  source!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  stars?: number;

  @Column({ nullable: true })
  forks?: number;

  @Column()
  score!: number;

  @Column('text', { array: true, default: [] })
  topics!: string[];

  @Column({ type: 'timestamptz', nullable: true })
  createdAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'saved_at' })
  savedAt!: Date;
}
