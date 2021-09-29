import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { Promotion } from 'src/modules/promotions/entities/promotion.entity';
import { Scan } from 'src/modules/scans/entities/scan.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { WidgetTypeEnum } from '../interfaces/widget.enum';
import { StoryBlock } from './storyBlock.entity';

@Entity({ schema: 'wdgt', name: 'widgets' })
export class Widget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ name: 'type', enum: WidgetTypeEnum })
  type: string;

  @ManyToOne(() => Widget, widget => widget.childWidgets)
  parent: Widget;

  // general info
  @Column()
  title: string;

  @Column({ nullable: true })
  backgroundColor?: string;

  @Column()
  webViewUrl: string;

  @Column({ default: false })
  exclusive: boolean;

  @Column({ nullable: true })
  expireAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Promotion, promotion => promotion.widget)
  promotion: Promotion;

  @OneToMany(() => StoryBlock, storyBlock => storyBlock.widget)
  storyBlocks: StoryBlock[];

  @ManyToMany(() => Tag, tag => tag.widgets)
  tags: Tag[];

  @ManyToMany(() => User, user => user.widgets)
  users: User[];

  @OneToMany(() => Scan, scan => scan.widget)
  @JoinColumn({ name: 'object_id' })
  scans: Scan[];

  @ManyToMany(() => Channel, channel => channel.widgets)
  channels: Channel[];

  @OneToMany(() => Widget, widget => widget.parent)
  @JoinColumn({ name: 'parent_id' })
  childWidgets: Widget[];
}
