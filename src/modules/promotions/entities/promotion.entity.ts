import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersPromotion } from '../../users/entities/usersPromotions.entity';

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

  @Column()
  collaborationImgUrl: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  modalImgUrl: string;

  @Column()
  modalTitle: string;

  @Column()
  backgroundColor: string;

  @OneToMany(() => UsersPromotion, usersPromotion => usersPromotion.promotion, { onDelete: 'CASCADE' })
  userPromotions: UsersPromotion[];

  @ManyToMany(() => User, user => user.wonPromotions)
  @JoinTable({ name: 'winners' })
  winners: User[];
}
