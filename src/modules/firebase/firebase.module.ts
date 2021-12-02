import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { FirebaseService } from './services/firebase.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
