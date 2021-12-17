import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TermsTypeEnum } from '../interfaces/interfaces';

@Entity({ schema: 'cmn', name: 'terms' })
export class TermsOfUse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column()
  title: string;

  @Column()
  mainText: string;

  @Column({ enum: TermsTypeEnum })
  type: TermsTypeEnum;
}
