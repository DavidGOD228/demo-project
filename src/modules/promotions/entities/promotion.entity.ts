import { Column, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ schema: 'wdgt', name: 'promotions' })
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Widget, widget => widget.promotion, { onDelete: 'CASCADE' })
  @JoinColumn()
  widget: Widget;

  @Column()
  imageUrl: string;

  @Column()
  buttonText: string;

  @Column()
  buttonColor: string;

  @ManyToMany(() => User, user => user.promotions, { onDelete: 'CASCADE' })
  users: User[];
}
