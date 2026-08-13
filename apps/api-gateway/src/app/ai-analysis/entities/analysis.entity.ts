import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('trend_analyses')
export class AnalysisEntity {
  @PrimaryColumn()
  trendId!: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column('text', { array: true, default: [] })
  keyPoints!: string[];

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  sentiment?: string;

  @Column('text', { array: true, default: [] })
  tags!: string[];

  @Column({ default: 'pending' })
  status!: string;

  @Column({ type: 'timestamptz', nullable: true })
  generatedAt?: Date;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}