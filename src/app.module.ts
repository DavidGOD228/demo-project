import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ormconfig } from './common/ormconfig';
import { AuthModule } from './modules/auth/auth.module';
import { ChannelModule } from './modules/channels/channel.module';
import { InterestModule } from './modules/interests/interest.module';
import { PromotionModule } from './modules/promotions/promotion.module';
import { ScanModule } from './modules/scans/scan.module';
import { TagModule } from './modules/tags/tag.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { UserModule } from './modules/users/user.module';
import { WidgetModule } from './modules/widgets/widget.module';
import { EmailsModule } from './modules/emails/emails.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(ormconfig as TypeOrmModuleAsyncOptions),
    TypeOrmModule.forFeature([]),
    AuthModule,
    ChannelModule,
    EmailsModule,
    InterestModule,
    PromotionModule,
    TagModule,
    UserModule,
    WidgetModule,
    ScanModule,
    TwilioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
