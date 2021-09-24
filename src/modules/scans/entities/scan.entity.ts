import { Channel } from 'src/modules/channels/entities/channel.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'cmn', name: 'scans' })
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: number;

  @Column()
  objectId: number;

  @ManyToOne(() => Channel, channel => channel.scans)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;
}
