import { Channel } from 'src/modules/channels/entities/channel.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Widget } from '../../widgets/entities/widget.entity';

@Entity({ schema: 'cmn', name: 'scans' })
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: number;

  @Column()
  objectId: string;

  @ManyToOne(() => Channel, channel => channel.scans)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'object_id' })
  user: User;

  @ManyToOne(() => Widget, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'object_id' })
  widget: Widget;
}
