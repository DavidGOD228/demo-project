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
// import { GetPromotionErrorEnum } from '../../promotions/interfaces/promotions.enum';
import { PromotionsService } from '../../promotions/services/promotions.service';
import { FileService } from './file.service';

// const NO_PROMOTION_ERROR = {
//   message: 'This widget has no promotion',
//   key: GetPromotionErrorEnum.NO_PROMOTIONS,
// };

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

    private readonly fileService: FileService,
  ) {}

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
    query: GetWidgetPromotionDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    promotions: (Promotion & { widgetId: string }) | (Promotion & { widgetId: string })[];
    channel?: Channel;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const recognizeResult = await this.recognize(file);

    const labelsInfo = recognizeResult.CustomLabels.reduce((gen, curr) => {
      gen[curr.Name] = curr;

      return gen;
    }, {} as Record<string, sdk.Rekognition.CustomLabel>);

    if (query.widgetId) {
      // logic for current widget available promotion
      const widget = await this.widgetRepository.findOne({
        where: { id: query.widgetId },
        relations: [
          'channels',
          'promotion',
          'promotion.userPromotions',
          'promotion.userPromotions.user',
          'scans',
          'scans.channel',
        ],
      });

      if (!widget) {
        throw new BadRequestException(`Widget with id ${query.widgetId} does not exist`);
      }

      const userPromotion = widget?.promotion.userPromotions.find(userPromotion => userPromotion.user.id === userId);

      if (userPromotion && userPromotion.isConfirmed) {
        // returning empty array because this widget was already scanned by this user
        return { promotions: [] };
      }

      const channels = await this.channelRepository.find({
        where: {
          id: In(widget.channels.map(channel => channel.id)),
        },
        relations: ['widgets', 'widgets.channels', 'widgets.promotion', 'widgets.scans', 'widgets.scans.channel'],
      });

      const passedChannel = this.passConfidence(labelsInfo, channels);

      if (passedChannel) {
        if (!widget.promotion) {
          // throw new BadRequestException(NO_PROMOTION_ERROR);
          return { promotions: [] };
        }

        this.notifyUserWithEmail(user, [widget], passedChannel);

        await this.promotionsService.confirmUserPromotions(user.id, [widget.promotion.id], passedChannel);

        return {
          promotions: [
            {
              ...widget.promotion,
              widgetId: widget.id,
              imageUrl: this.fileService.getImageUrl(widget.promotion.imageUrl),
              collaborationImgUrl: widget.promotion.collaborationImgUrl
                ? this.fileService.getImageUrl(widget.promotion.collaborationImgUrl)
                : undefined,
              modalImgUrl: widget.promotion.modalImgUrl
                ? this.fileService.getImageUrl(widget.promotion.modalImgUrl)
                : undefined,
            },
          ],
          channel: passedChannel,
        };
      } else {
        throw new BadRequestException('Ball was not recognized for this widget');
      }
    } else {
      // logic for all available promotions

      const channels = await this.channelRepository.find({
        relations: [
          'widgets',
          'widgets.channels',
          'widgets.promotion',
          'widgets.promotion.userPromotions',
          'widgets.promotion.userPromotions.user',
        ],
      });

      const passedChannel = this.passConfidence(labelsInfo, channels);

      if (passedChannel) {
        const promotionIds = passedChannel.widgets
          .map(widget => {

            if (widget.promotion) {
              // const userPromotion = widget?.promotion.userPromotions.find(
              //   userPromotion => userPromotion.user.id === userId,
              // );
              //
              // if (!userPromotion || !userPromotion.isConfirmed) {
                return widget.promotion.id;
              // }
            }
          })
          .filter(id => !!id);
        console.log('promotionIdspromotionIds', promotionIds);
        if (!promotionIds.length) {
          // throw new BadRequestException(NO_PROMOTION_ERROR);
          return { promotions: [] };
        }

        this.notifyUserWithEmail(user, passedChannel.widgets, passedChannel);

        const promotionsPromises = passedChannel.widgets.map(async widget => {
          if (widget.promotion) {
            return {
              ...widget.promotion,
              widgetId: widget.id,
              imageUrl: this.fileService.getImageUrl(widget.promotion.imageUrl),
              collaborationImgUrl: widget.promotion.collaborationImgUrl
                ? this.fileService.getImageUrl(widget.promotion.collaborationImgUrl)
                : undefined,
              modalImgUrl: widget.promotion.modalImgUrl
                ? this.fileService.getImageUrl(widget.promotion.modalImgUrl)
                : undefined,
            };
          }
        });

        const promotions = await Promise.all(promotionsPromises);

        await this.promotionsService.confirmUserPromotions(user.id, promotionIds, passedChannel);

        return { promotions: promotions.filter(promotion => !!promotion), channel: passedChannel };
      } else {
        throw new BadRequestException('Ball was not recognized for this widget');
      }
    }
  }
}
