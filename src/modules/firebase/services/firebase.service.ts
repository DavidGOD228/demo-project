import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { MessagingPayload } from 'firebase-admin/lib/messaging/messaging-api';
import { ConfigService } from '@nestjs/config';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as serviceAccount from '../../../../wilson-alfa-firebase-admin.json';

@Injectable()
export class FirebaseService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private configService: ConfigService,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: this.configService.get<string>('WILSON_FIREBASE_DB_URL'),
    });
  }

  public async notifyAll(message: MessagingPayload) {
    const users = await this.usersRepository.find({ where: { deviceToken: Not(IsNull()), notificationEnabled: true } });

    await this.notify(
      users.map(user => user.deviceToken),
      message,
    );
  }

  public async notify(tokens: string[], message: MessagingPayload) {
    const options = {
      priority: 'high',
      timeToLive: 60 * 60 * 24,
    };

    await admin.messaging().sendToDevice(tokens, message, options);
  }
}
