import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ schema: 'wdgt', name: 'promotions' })
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Widget, widget => widget.promotion)
  @JoinColumn()
  widget: Widget;

  @Column()
  imageUrl: string;

  @Column()
  buttonText: string;

  @Column()
  buttonColor: string;

  @ManyToMany(() => User, user => user.promotions)
  users: User[];

  @ManyToMany(() => User, user => user.wonPromotions)
  @JoinTable({ name: 'winners' })
  winners: User[];
}
