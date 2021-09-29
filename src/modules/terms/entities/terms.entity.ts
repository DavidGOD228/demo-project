import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'cmn', name: 'terms_of_use' })
export class TermsOfUse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column()
  title: string;

  @Column()
  mainText: string;
}
