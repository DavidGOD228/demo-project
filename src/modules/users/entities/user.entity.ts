import { Interest } from 'src/modules/interests/entities/interest.entity';
import { Promotion } from 'src/modules/promotions/entities/promotion.entity';
import { Scan } from 'src/modules/scans/entities/scan.entity';
import { Widget } from 'src/modules/widgets/entities/widget.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoleEnum } from '../interfaces/user.enum';
import { UsersPromotion } from './usersPromotions.entity';

@Entity({ schema: 'usr', name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  phoneNumber: string;

  @Column()
  location: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: false })
  onboarded: boolean;

  @Column({ default: false })
  exclusiveSubscription: boolean;

  @Column({ name: 'role', enum: UserRoleEnum, insert: true, default: UserRoleEnum.USER })
  role: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToMany(() => Interest, interest => interest.users)
  @JoinTable({ name: 'users_interests' })
  interests: Interest[];

  @OneToMany(() => UsersPromotion, usersPromotion => usersPromotion.user)
  usersPromotions: UsersPromotion[];

  @ManyToMany(() => Widget, widget => widget.users)
  @JoinTable({ name: 'favorites' })
  widgets: Widget[];

  @OneToMany(() => Scan, scan => scan.user)
  @JoinColumn({ name: 'object_id' })
  scans: Scan[];

  @ManyToMany(() => Promotion, promotion => promotion.winners)
  wonPromotions: Promotion[];
}
