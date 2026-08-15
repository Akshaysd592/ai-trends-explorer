import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('analyses')
export class AnalysisEntity {
  @PrimaryColumn()
  trendId!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text', nullable: true })
  sentiment?: string;

  @Column({ type: 'jsonb', nullable: true })
  keyPoints?: string[];

  @Column({ type: 'text', nullable: true })
  category?: string;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Column({ type: 'text', default: 'completed' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'generated_at' })
  generatedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
