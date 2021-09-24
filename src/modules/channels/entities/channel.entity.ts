import { Scan } from 'src/modules/scans/entities/scan.entity';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChannelTypeEnum, LeagueLabelEnum, TypeLabelEnum } from '../interfaces/channel.enum';

@Entity({ schema: 'chnl', name: 'channels' })
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type', enum: ChannelTypeEnum })
  type: string;

  @Column()
  inscription: string;

  @Column()
  league: string;

  @Column({ enum: LeagueLabelEnum })
  leagueLabel: string;

  @Column({ default: 'Wilson' })
  inscriptionLabel: string;

  @Column({ enum: TypeLabelEnum })
  typeLabel: string;

  @OneToMany(() => Scan, scan => scan.channel)
  scans: Scan[];

  @ManyToMany(() => Widget, widget => widget.channels)
  @JoinTable({ name: 'channels_widgets' })
  widgets: Widget[];
}
