import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';

@Entity({ schema: 'usr', name: 'users_promotions' })
export class UsersPromotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.userPromotions)
  @JoinColumn({ name: 'users_id' })
  user: User;

  @ManyToOne(() => Promotion, promotion => promotion.userPromotions)
  @JoinColumn({ name: 'promotions_id' })
  promotion: Promotion;

  @Column()
  isConfirmed: boolean;
}
