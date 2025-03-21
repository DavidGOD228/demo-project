import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StoryBlockTypeEnum } from '../interfaces/widget.enum';
import { Widget } from './widget.entity';

@Entity({ schema: 'wdgt', name: 'story_block' })
export class StoryBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type', enum: StoryBlockTypeEnum })
  type: string;

  @Column()
  swipeUrl: string;

  @Column()
  assetUrl: string;

  @Column()
  thumbnailUrl: string;

  @Column()
  priority: number;

  @Column({ nullable: true })
  backgroundColor?: string;

  @CreateDateColumn({ name: 'created_at', default: new Date() })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Widget, widget => widget.stories, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'widget_id' })
  widget: Widget;
}
