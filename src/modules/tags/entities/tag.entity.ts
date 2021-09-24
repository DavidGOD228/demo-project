import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'wdgt', name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Widget, widget => widget.tags)
  @JoinTable({ name: 'widget_tags' })
  widgets: Widget[];
}
