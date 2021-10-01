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
  @JoinColumn({ name: 'parent_id' })
  parentWidget: Widget;

  // general info
  @Column()
  title: string;

  @Column({ nullable: true })
  backgroundColor?: string;

  @Column()
  webViewUrl: string;

  @Column({ default: false })
  exclusive: boolean;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  expirationDate?: Date;

  @Column('time', { name: 'start_time' })
  startTime: Date;

  @Column('time', { name: 'expiration_time', nullable: true })
  expirationTime?: Date;

  @Column({ default: false })
  canBeShared: boolean;

  @Column({ default: false })
  hasExpiration: boolean;

  //feed info
  @Column()
  feedButtonText: string;

  @Column()
  feedButtonColor: string;

  @Column()
  feedMediaUrl: string;

  // details info
  @Column()
  detailsButtonText: string;

  @Column()
  detailsButtonColor: string;

  @Column()
  retailPrice: string;

  @Column()
  discount: string;

  @Column()
  discountedPrice: string;

  @Column()
  detailsMediaUrl: string;

  @Column()
  thumbnailUrl: string;

  @Column({ nullable: true })
  carouselTitle?: string;

  @Column({ nullable: true })
  carouselPriority?: number;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Promotion, promotion => promotion.widget)
  promotion: Promotion;

  @OneToMany(() => StoryBlock, storyBlock => storyBlock.widget)
  stories: StoryBlock[];

  @ManyToMany(() => Tag, tag => tag.widgets)
  tags: Tag[];

  @ManyToMany(() => User, user => user.widgets)
  users: User[];

  @OneToMany(() => Scan, scan => scan.widget)
  @JoinColumn({ name: 'object_id' })
  scans: Scan[];

  @ManyToMany(() => Channel, channel => channel.widgets)
  channels: Channel[];

  @OneToMany(() => Widget, widget => widget.parentWidget)
  @JoinColumn({ name: 'parent_id' })
  childWidgets: Widget[];
}
