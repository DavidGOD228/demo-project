import * as sdk from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GetWidgetPromotionDto } from '../interfaces/getWidgetPromotion.dto';
import { Channel } from '../../channels/entities/channel.entity';
import { Widget } from '../../widgets/entities/widget.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';
import { InscriptionLabelAccuracyEnum, LeagueLabelAccuracyEnum } from '../interfaces/accuracy.enum';
import { Scan } from '../../scans/entities/scan.entity';
import { User } from '../../users/entities/user.entity';
import * as constants from '../../../common/constants/constants';
import { EmailsService } from '../../emails/services/emails.service';
import { MailTemplateTypeEnum } from '../../emails/interfaces/mailTemplate.enum';
import { GetChannelByImage } from '../interfaces/interfaces';
import { UserService } from '../../users/services/user.service';
import { GetPromotionErrorEnum } from '../../promotions/interfaces/promotions.enum';
import { PromotionsService } from '../../promotions/services/promotions.service';

const NO_PROMOTION_ERROR = {
  message: 'This widget has no promotion',
  key: GetPromotionErrorEnum.NO_PROMOTIONS,
};

@Injectable()
export class RecognitionService {
  constructor(
    private configService: ConfigService,

    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,

    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,

    @InjectRepository(Scan)
    private scanRepository: Repository<Scan>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly emailService: EmailsService,

    private readonly userService: UserService,

    private readonly promotionsService: PromotionsService,
  ) {}

  public readonly SIGNED_URL_EXPIRATION_TIME = 5;

  public isWidgetExclusiveForUser(widget: Widget, user: User): boolean {
    if (!widget.isExclusive) return false;

    const scan = user.scans.find(scan => widget.channels.filter(widgetChannel => widgetChannel.id === scan.channel.id));

    return !!scan;
  }

  public passConfidence(labelsInfo: Record<string, sdk.Rekognition.CustomLabel>, channels: Channel[]): Channel {
    const passedChannel = channels.find(channel => {
      return (
        labelsInfo[channel.inscriptionLabel]?.Confidence > InscriptionLabelAccuracyEnum[channel.inscriptionLabel] &&
        labelsInfo[channel.leagueLabel]?.Confidence > LeagueLabelAccuracyEnum[channel.leagueLabel]
      );
    });

    return passedChannel;
  }

  public getImageUrl(fileKey: string) {
    const s3Bucket = new sdk.S3();

    const requestObject: Record<string, any> = {
      Expires: this.SIGNED_URL_EXPIRATION_TIME,
      Bucket: this.configService.get(constants.WILSON_AWS_S3_BUCKET),
      Key: fileKey,
    };

    return s3Bucket.getSignedUrl('getObject', requestObject);
  }

  public async increaseScanTimes(widget: Widget, user: User, channel: Channel): Promise<void> {
    const existingWidgetScan = widget.scans?.find(scan => scan.channel.id === channel.id);
    const existingUserScan = user.scans?.find(scan => scan.channel.id === channel.id);

    const newScans: Scan[] = [];

    newScans.push(
      existingWidgetScan
        ? { ...existingWidgetScan, number: existingWidgetScan.number + 1 }
        : this.scanRepository.create({ objectId: widget.id, number: 1, channel }),
    );

    newScans.push(
      existingUserScan
        ? { ...existingUserScan, number: existingUserScan.number + 1 }
        : this.scanRepository.create({ objectId: user.id, number: 1, channel }),
    );

    await this.scanRepository.save(newScans);
  }

  public notifyUserWithEmail(user: User, widgets: Widget[], passedChannel: Channel): void {
    if (user.email) {
      const exclusiveWidgets = passedChannel.widgets.filter(widget => this.isWidgetExclusiveForUser(widget, user));

      if (exclusiveWidgets.length) {
        // we don't wait for the result of sending an email to keep the recognition process going
        this.emailService
          .sendEmail(MailTemplateTypeEnum.EXCLUSIVE, [
            {
              to: user.email,
              templateBody: {
                userName: user.firstName,
                widgets: exclusiveWidgets.map(widget => ({ name: widget.title })),
              },
            },
          ])
          .catch(e => console.log(e.message));
      }

      // we don't wait for the result of sending an email to keep the recognition process going
      this.emailService
        .sendEmail(MailTemplateTypeEnum.SCAN, [
          {
            to: user.email,
            templateBody: {
              userName: user.firstName,
              widgets: widgets.map(widget => ({ name: widget.title })),
            },
          },
        ])
        .catch(e => console.log(e.message));
    }
  }

  public async recognize(file: Express.Multer.File): Promise<sdk.Rekognition.DetectCustomLabelsResponse> {
    const rekognition = new sdk.Rekognition();

    return new Promise((resolve, reject) =>
      rekognition.detectCustomLabels(
        {
          ProjectVersionArn: this.configService.get<string>(constants.WILSON_AWS_MODEL_ARN),
          Image: { Bytes: file.buffer },
        },
        (err, data) => {
          if (err) return reject(err);

          if (!data.CustomLabels) reject('Image was not recognized');

          resolve(data);
        },
      ),
    );
  }

  public async getChannelByImage(file: Express.Multer.File): Promise<GetChannelByImage> {
    const recognizeResult = await this.recognize(file);
    const labelsInfo = recognizeResult.CustomLabels.reduce((gen, curr) => {
      gen[curr.Name] = curr;

      return gen;
    }, {} as Record<string, sdk.Rekognition.CustomLabel>);

    const channels = await this.channelRepository.find();
    const passedChannel = this.passConfidence(labelsInfo, channels);

    if (passedChannel) {
      return { channel: passedChannel, labelsInfo };
    } else {
      throw new BadRequestException('Image was not recognized');
    }
  }

  public async getBallPromotion(
    body: GetWidgetPromotionDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Promotion | Promotion[]> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['scans', 'scans.channel'] });

    const recognizeResult = await this.recognize(file);

    const labelsInfo = recognizeResult.CustomLabels.reduce((gen, curr) => {
      gen[curr.Name] = curr;

      return gen;
    }, {} as Record<string, sdk.Rekognition.CustomLabel>);

    if (body.widgetId) {
      // logic for current widget available promotion
      const widget = await this.widgetRepository.findOne({
        where: { id: body.widgetId },
        relations: ['channels', 'promotion', 'scans', 'scans.channel'],
      });

      if (!widget) {
        throw new BadRequestException(`Widget with id ${body.widgetId} does not exist`);
      }

      const channels = await this.channelRepository.find({
        where: { id: In(widget.channels.map(channel => channel.id)) },
      });

      const passedChannel = this.passConfidence(labelsInfo, channels);

      if (passedChannel) {
        if (!widget.promotion) {
          throw new BadRequestException(NO_PROMOTION_ERROR);
        }

        this.notifyUserWithEmail(user, [widget], passedChannel);

        await Promise.all([
          this.increaseScanTimes(widget, user, passedChannel),
          this.promotionsService.confirmUserPromotions(user.id, [widget.promotion.id]),
        ]);

        return { ...widget.promotion, imageUrl: this.getImageUrl(widget.promotion.imageUrl) };
      } else {
        throw new BadRequestException('Ball was not recognized for this widget');
      }
    } else {
      // logic for all available promotions
      const channels = await this.channelRepository.find({
        relations: ['widgets', 'widgets.channels', 'widgets.promotion', 'widgets.scans', 'widgets.scans.channel'],
      });

      const passedChannel = this.passConfidence(labelsInfo, channels);

      if (passedChannel) {
        const promotionIds = passedChannel.widgets
          .map(widget => widget.promotion && widget.promotion.id)
          .filter(id => !!id);

        if (!promotionIds.length) {
          throw new BadRequestException(NO_PROMOTION_ERROR);
        }

        this.notifyUserWithEmail(user, passedChannel.widgets, passedChannel);

        const promotionsPromises = passedChannel.widgets.map(async widget => {
          await this.increaseScanTimes(widget, user, passedChannel);

          if (widget.promotion) {
            return {
              ...widget.promotion,
              imageUrl: this.getImageUrl(widget.promotion.imageUrl),
            };
          }
        });

        const promotions = await Promise.all(promotionsPromises);

        await this.promotionsService.confirmUserPromotions(user.id, promotionIds);

        return promotions.filter(promotion => !!promotion);
      } else {
        throw new BadRequestException('Ball was not recognized for this widget');
      }
    }
  }
}
