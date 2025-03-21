import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, In, IsNull, Not, Repository } from 'typeorm';
// @ts-ignore
import * as Vibrant from 'node-vibrant';
import { FileService } from 'src/modules/aws/services/file.service';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ExportCsvService } from 'src/modules/config/services/csvExport.service';
import { Promotion } from 'src/modules/promotions/entities/promotion.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { Widget } from '../entities/widget.entity';
import { AddStoryBlockToWidget, CreateWidgetDto, EditWidgetDto, FilterWidgetsDto } from '../interfaces/widget.dto';
import {
  AddAuthorAvatarResponse,
  AddDetailsMediaResponse,
  AddFeedMediaResponse,
  AddStoryMedia,
  AddThumbnailResponse,
  DeleteWidgetResponse,
  FilteredWidgetsResponse,
} from '../interfaces';
import { User } from '../../users/entities/user.entity';
import { UserRoleEnum } from '../../users/interfaces/user.enum';
import { UpdateCarouselDto } from '../interfaces/updateCarousel.dto';
import { StoryBlockTypeEnum, WidgetTypeEnum } from '../interfaces/widget.enum';
import { StoryBlock } from '../entities/storyBlock.entity';
import { FilterWidgetByTitleDto } from '../interfaces/filterWidgetByTitle.dto';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { UsersPromotion } from '../../users/entities/usersPromotions.entity';
import { GetWidgetFeedDto } from '../interfaces/getWidgetFeed.dto';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(Widget) private readonly widgetsRepository: Repository<Widget>,
    @InjectRepository(Promotion) private readonly promotionsRepository: Repository<Promotion>,
    @InjectRepository(Channel) private readonly channelsRepository: Repository<Channel>,
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(StoryBlock) private readonly storyRepository: Repository<StoryBlock>,
    @InjectRepository(UsersPromotion) private readonly usersPromotionRepository: Repository<UsersPromotion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileService: FileService,
    private readonly csvService: ExportCsvService,
    private readonly firebaseService: FirebaseService,
  ) {}

  MAX_FILTERED_OPTIONS = 10;
  DEFAULT_BACKGROUND_COLOR = '#636160';

  public groupWidgetScans(widgetChannels: Channel[] = []) {
    const channels = widgetChannels
      .map(channel => {
        if (channel.league && channel?.scans?.length) {
          return {
            league: channel.league,
            number: channel.scans.map(item => item.number).reduce((prev, next) => prev + next, 0),
          };
        }
      })
      .filter(e => !!e);

    const result = channels.reduce((acc, { league, number }) => {
      acc[league] ??= { league: league, number: 0 };
      acc[league].number = acc[league].number + number;

      return acc;
    }, {});

    return Object.values(result);
  }

  public serializeWidgetList(
    widgets: Partial<Widget>[],
    usersPromotion: UsersPromotion[],
  ): Partial<Widget & { isFavorite: boolean }>[] {
    return widgets
      .map(widget => {
        const { stories, childWidgets, channels } = widget;

        const scans = this.groupWidgetScans(channels);

        const isScanned = !!usersPromotion.find(up => up.promotion.widget.id === widget.id);

        if (widget.type === WidgetTypeEnum.CAROUSEL && widget?.childWidgets?.length === 1) {
          const childWidget = widget.childWidgets[0];

          return {
            ...childWidget,
            feedMediaLink: this.fileService.getImageUrl(childWidget.feedMediaUrl),
            detailsMediaLink: this.fileService.getImageUrl(childWidget.detailsMediaUrl),
            thumbnailLink: this.fileService.getImageUrl(childWidget.thumbnailUrl),
            storyAuthorAvatarLink: this.fileService.getImageUrl(childWidget.storyAuthorAvatarUrl),
            stories: childWidget?.stories?.length
              ? childWidget.stories
                  .sort((a, b) => a.priority - b.priority)
                  .map(story => ({
                    ...story,
                    assetLink: this.fileService.getImageUrl(story.assetUrl),
                    thumbnailLink: this.fileService.getImageUrl(story.thumbnailUrl),
                  }))
              : undefined,
            groupedScans: this.groupWidgetScans(childWidget.channels),
            isScanned,
          };
        }

        return {
          ...widget,
          users: undefined,
          isScanned,
          isFavorite: !!widget?.users?.length,
          feedMediaLink: this.fileService.getImageUrl(widget.feedMediaUrl),
          detailsMediaLink: this.fileService.getImageUrl(widget.detailsMediaUrl),
          thumbnailLink: this.fileService.getImageUrl(widget.thumbnailUrl),
          storyAuthorAvatarLink: this.fileService.getImageUrl(widget.storyAuthorAvatarUrl),
          stories: stories?.length
            ? stories
                .sort((a, b) => a.priority - b.priority)
                .map(story => ({
                  ...story,
                  assetLink: this.fileService.getImageUrl(story.assetUrl),
                  thumbnailLink: this.fileService.getImageUrl(story.thumbnailUrl),
                }))
            : undefined,
          childWidgets: childWidgets?.length
            ? childWidgets
                .sort((a, b) => a.carouselPriority - b.carouselPriority)
                .map(childWidget => ({
                  ...childWidget,
                  feedMediaLink: this.fileService.getImageUrl(childWidget.feedMediaUrl),
                  detailsMediaLink: this.fileService.getImageUrl(childWidget.detailsMediaUrl),
                  thumbnailLink: this.fileService.getImageUrl(childWidget.thumbnailUrl),
                  storyAuthorAvatarLink: this.fileService.getImageUrl(childWidget.storyAuthorAvatarUrl),
                  stories: childWidget?.stories?.length
                    ? childWidget.stories
                        .sort((a, b) => a.priority - b.priority)
                        .map(story => ({
                          ...story,
                          assetLink: this.fileService.getImageUrl(story.assetUrl),
                          thumbnailLink: this.fileService.getImageUrl(story.thumbnailUrl),
                        }))
                    : undefined,
                  groupedScans: this.groupWidgetScans(childWidget.channels),
                  isScanned: !!usersPromotion.find(up => up.promotion.widget.id === childWidget.id),
                }))
            : undefined,
          groupedScans: scans,
        };
      })
      .filter(widget => !!widget);
  }

  public async getWidgetById(id: string, userId: string) {
    const usersPromotion = await this.usersPromotionRepository.find({
      where: { user: userId, isConfirmed: true },
      relations: ['promotion', 'promotion.widget'],
    });

    const widget = await this.widgetsRepository.findOne({
      where: { id },
      relations: ['tags', 'stories', 'channels', 'channels.scans', 'promotion'],
    });

    if (!widget) {
      throw new NotFoundException('There is no widget with such id!');
    }

    const scans = this.groupWidgetScans(widget.channels);

    const isScanned = !!usersPromotion.find(up => up.promotion.widget.id === widget.id);

    return {
      ...widget,
      feedMediaLink: widget.feedMediaUrl ? this.fileService.getImageUrl(widget.feedMediaUrl) : undefined,
      promotionButtonColor: widget.promotion && widget.promotion.buttonColor,
      promotionButtonText: widget.promotion && widget.promotion.buttonText,
      promotionImageUrl: widget.promotion && widget.promotion.imageUrl,
      promotionMediaLink:
        widget.promotion && widget.promotion.imageUrl
          ? this.fileService.getImageUrl(widget.promotion.imageUrl)
          : undefined,
      promotionCollaborationImgUrl: widget.promotion && widget.promotion.collaborationImgUrl,
      promotionCollaborationImgLink:
        widget.promotion && widget.promotion.collaborationImgUrl
          ? this.fileService.getImageUrl(widget.promotion.collaborationImgUrl)
          : undefined,
      promotionModalImgUrl: widget.promotion && widget.promotion.modalImgUrl,
      promotionModalImgLink:
        widget.promotion && widget.promotion.modalImgUrl
          ? this.fileService.getImageUrl(widget.promotion.modalImgUrl)
          : undefined,
      promotionTitle: widget.promotion && widget.promotion.title,
      promotionDescription: widget.promotion && widget.promotion.description,
      promotionModalTitle: widget.promotion && widget.promotion.modalTitle,
      promotionBackgroundColor: widget.promotion && widget.promotion.backgroundColor,
      detailsMediaLink: widget.detailsMediaUrl ? this.fileService.getImageUrl(widget.detailsMediaUrl) : undefined,
      thumbnailLink: widget.thumbnailUrl ? this.fileService.getImageUrl(widget.thumbnailUrl) : undefined,
      storyAuthorAvatarLink: widget.storyAuthorAvatarUrl
        ? this.fileService.getImageUrl(widget.storyAuthorAvatarUrl)
        : undefined,
      stories: widget?.stories?.length
        ? widget.stories.map(story => ({
            ...story,
            assetLink: this.fileService.getImageUrl(story.assetUrl),
            thumbnailLink: this.fileService.getImageUrl(story.thumbnailUrl),
          }))
        : undefined,
      groupedScans: scans,
      isScanned,
    };
  }

  public async addFeedMedia({ buffer, filename }: Express.Multer.File): Promise<AddFeedMediaResponse> {
    const feedMedia = await this.fileService.uploadRawMedia(buffer, filename, 'widgets');

    return { feedMedia };
  }

  public async addDetailsMedia({ buffer, filename }: Express.Multer.File): Promise<AddDetailsMediaResponse> {
    const detailsMedia = await this.fileService.uploadRawMedia(buffer, filename, 'widgets');

    return { detailsMedia };
  }

  public async addThumbnail({ buffer, filename }: Express.Multer.File): Promise<AddThumbnailResponse> {
    const thumbnail = await this.fileService.uploadRawMedia(buffer, filename, 'widgets');

    return { thumbnail };
  }

  public async addStoryMedia({ buffer, filename, mimetype }: Partial<Express.Multer.File>): Promise<AddStoryMedia> {
    const type = this.fileService.checkFileType(mimetype);
    const storyAssetUrl = await this.fileService.uploadRawMedia(buffer, filename, 'stories', type);

    return { storyAssetUrl, type };
  }

  public async addAuthorAvatar({ buffer, filename }: Express.Multer.File): Promise<AddAuthorAvatarResponse> {
    const authorAvatarUrl = await this.fileService.uploadRawMedia(buffer, filename, 'stories');

    return { authorAvatarUrl };
  }

  public async createStoryBlocks(storiesToAdd?: AddStoryBlockToWidget[]): Promise<StoryBlock[]> {
    const stories = await Promise.all(
      storiesToAdd.map(async story => {
        const storyBlock: Partial<StoryBlock> = {
          assetUrl: story.assetUrl,
          swipeUrl: story.swipeUrl,
          type: story.type,
          priority: story.priority,
          updatedAt: new Date(),
        };

        if (story.type === StoryBlockTypeEnum.IMAGE) {
          let palette;

          try {
            palette = await Vibrant.from(this.fileService.getImageUrl(story.assetUrl)).getPalette();
          } catch (e) {
            console.log('ERROR: failed to define background color', e.message);
          }

          try {
            const file = await this.fileService.getFile(story.assetUrl);

            const resizedImage = await this.fileService.resizeImage(file.Body as Buffer);

            const resized = await this.addStoryMedia({
              buffer: resizedImage,
              filename: 'stories/thumbnails/' + story.assetUrl.split('/').pop(),
              mimetype: 'image',
            });

            storyBlock.thumbnailUrl = resized.storyAssetUrl;
          } catch (e) {
            console.log('ERROR: failed to resize', e.message);
          }

          storyBlock.backgroundColor = palette ? palette.DarkMuted.getHex() : this.DEFAULT_BACKGROUND_COLOR;
        }

        return this.storyRepository.create(storyBlock);
      }),
    );

    return stories;
  }

  public async createWidget({
    promotionButtonColor,
    promotionButtonText,
    channelIds,
    tagIds,
    title,
    description,
    backgroundColor,
    websiteUrl,
    type,
    isExclusive,
    canBeShared,
    hasExpiration,
    status,
    startDate,
    expirationDate,
    startTime,
    expirationTime,
    feedButtonText,
    feedButtonColor,
    detailsButtonText,
    detailsButtonColor,
    retailPrice,
    discount,
    discountedPrice,
    promotionMediaUrl,
    promotionBackgroundColor,
    promotionCollaborationMediaUrl,
    promotionDescription,
    promotionModalMediaUrl,
    promotionModalTitle,
    promotionTitle,
    feedMediaUrl,
    detailsMediaUrl,
    thumbnailUrl,
    storiesToAdd,
    canBeLiked,
    hasCountdown,
    storyAuthorName,
    storyAuthorAvatarUrl,
    storyDescription,
    terms,
  }: CreateWidgetDto): Promise<Widget> {
    if (type === WidgetTypeEnum.POST) {
      const promotion = this.promotionsRepository.create({
        buttonColor: promotionButtonColor,
        buttonText: promotionButtonText,
        imageUrl: promotionMediaUrl,
        backgroundColor: promotionBackgroundColor,
        description: promotionDescription,
        title: promotionTitle,
        collaborationImgUrl: promotionCollaborationMediaUrl,
        modalImgUrl: promotionModalMediaUrl,
        modalTitle: promotionModalTitle,
      });

      await this.promotionsRepository.save(promotion);

      const channels = await this.channelsRepository.find({ where: { id: In(channelIds) } });

      const widget = this.widgetsRepository.create({
        title,
        description,
        backgroundColor,
        webViewUrl: websiteUrl,
        type,
        isExclusive,
        canBeShared,
        hasExpiration,
        status,
        startDate,
        expirationDate,
        startTime,
        expirationTime,
        feedButtonText,
        feedButtonColor,
        detailsButtonText,
        detailsButtonColor,
        retailPrice,
        discount,
        discountedPrice,
        promotion,
        channels,
        feedMediaUrl,
        detailsMediaUrl,
        thumbnailUrl,
        canBeLiked,
        hasCountdown,
        terms,
      });

      if (tagIds) {
        const tags = await this.tagsRepository.find({ where: { id: In(tagIds) } });

        widget.tags = tags;
      }

      return this.widgetsRepository.save(widget);
    } else if (type === WidgetTypeEnum.STORY) {
      const channels = await this.channelsRepository.find({ where: { id: In(channelIds) } });

      const widget = this.widgetsRepository.create({
        title,
        type,
        backgroundColor,
        webViewUrl: websiteUrl,
        description,
        canBeShared,
        canBeLiked,
        hasCountdown,
        isExclusive,
        status,
        startDate,
        expirationDate,
        startTime,
        expirationTime,
        channels,
        feedButtonText,
        feedButtonColor,
        feedMediaUrl,
        thumbnailUrl,
        storyAuthorName,
        storyAuthorAvatarUrl,
        storyDescription,
      });

      const stories = await this.createStoryBlocks(storiesToAdd);

      await this.storyRepository.save(stories);

      if (tagIds) {
        const tags = await this.tagsRepository.find({ where: { id: In(tagIds) } });

        widget.tags = tags;
      }

      widget.stories = stories;

      const toReturn = await this.widgetsRepository.save(widget);

      this.firebaseService
        .notifyAll({
          notification: { title: 'Hey there', body: 'New widget is already live' },
          data: {
            id: toReturn.id,
            type: toReturn.type,
          },
        })
        .catch(console.error);

      return toReturn;
    }
  }

  public async getFilteredWidgets(filterWidgets: FilterWidgetsDto): Promise<FilteredWidgetsResponse> {
    const { limit: take, pageNumber: skip, fieldName: sortField, order: sortOrder, filteringType } = filterWidgets;
    const query = this.widgetsRepository
      .createQueryBuilder('widgets')
      .select([
        'widgets.id as id',
        'widgets.title as title',
        'widgets.type as type',
        'widgets.startDate as startDate',
        'widgets.expirationDate as expirationDate',
        'widgets.isExclusive as isExclusive',
      ])
      .leftJoin('widgets.channels', 'channel')
      .addSelect("array_to_string(array_agg(CONCAT_WS(' ', channel.leagueLabel, channel.type)), ', ')", 'channels')
      .limit(take)
      .offset((skip - 1) * take)
      .groupBy('widgets.id');

    if (sortField === 'title') {
      query.orderBy(`LOWER(${sortField})`, sortOrder === 'DESC' ? 'DESC' : 'ASC');
    } else {
      query.orderBy(sortField, sortOrder === 'DESC' ? 'DESC' : 'ASC');
    }

    if (filteringType) {
      query.where('widgets.type IN (:...types)', { types: filteringType });
    }

    const widgets = await query.getRawMany();

    const length = await query.getCount();

    return { widgets, length };
  }

  public async editWidgets(widgetId: string, body: EditWidgetDto): Promise<Widget> {
    const { channelIds, tagIds, storiesToAdd } = body;
    const widget = await this.widgetsRepository.findOne({
      where: { id: widgetId },
      relations: ['channels', 'tags', 'stories', 'promotion'],
    });

    if (channelIds) {
      const channels = await this.channelsRepository.find({ where: { id: In(channelIds) } });

      widget.channels = channels;
    }

    if (tagIds) {
      const tags = await this.tagsRepository.find({ where: { id: In(tagIds) } });

      widget.tags = tags;
    }

    if (body.promotionButtonColor) {
      widget.promotion.buttonColor = body.promotionButtonColor;
    }

    if (body.promotionButtonText) {
      widget.promotion.buttonText = body.promotionButtonText;
    }

    if (body.promotionMediaUrl) {
      widget.promotion.imageUrl = body.promotionMediaUrl;
    }

    if (body.promotionDescription) {
      widget.promotion.description = body.promotionDescription;
    }

    if (body.promotionTitle) {
      widget.promotion.title = body.promotionTitle;
    }

    if (body.promotionBackgroundColor) {
      widget.promotion.backgroundColor = body.promotionBackgroundColor;
    }

    if (body.promotionModalTitle) {
      widget.promotion.modalTitle = body.promotionModalTitle;
    }

    if (body.promotionCollaborationMediaUrl) {
      widget.promotion.collaborationImgUrl = body.promotionCollaborationMediaUrl;
    } else if (widget.promotion) {
      widget.promotion.collaborationImgUrl = null;
    }

    if (body.promotionModalMediaUrl) {
      widget.promotion.modalImgUrl = body.promotionModalMediaUrl;
    }

    if (widget.promotion) {
      await this.promotionsRepository.save(widget.promotion);
    }

    if (storiesToAdd?.length) {
      if (widget?.stories?.length) {
        await this.storyRepository.delete(widget.stories.map(story => story.id));
      }

      const stories = await this.createStoryBlocks(storiesToAdd);

      await this.storyRepository.save(stories);

      widget.stories = stories;
    }

    const widgetUpdated = {
      ...widget,
      ...body,
      channels: widget.channels,
      tags: widget.tags,
      stories: widget.stories,
    };

    this.firebaseService
      .notifyAll({
        notification: { title: 'Hey there', body: 'New widget is already live' },
        data: {
          id: widgetUpdated.id,
          type: widgetUpdated.type,
        },
      })
      .catch(console.error);

    return await this.widgetsRepository.save(widgetUpdated);
  }

  public async deleteWidgetById(id: string): Promise<DeleteWidgetResponse> {
    const widget = await this.widgetsRepository.findOne(id);

    await this.widgetsRepository.remove(widget);

    return { message: 'Widget was successfully deleted!' };
  }

  public async exportWidgetCsv(body: FilterWidgetsDto): Promise<string> {
    const widgets = await this.getFilteredWidgets(body);

    if (widgets?.widgets?.length) {
      const csv = await this.csvService.exportCsv(widgets.widgets, 'Widgets');

      return csv;
    }

    return 'There is no available data for such parameters';
  }

  public async filterWidgetByTitle({ filterValue }: FilterWidgetByTitleDto): Promise<Widget[]> {
    const query: FindManyOptions<Widget> = {
      select: ['id', 'title', 'type'],
      take: this.MAX_FILTERED_OPTIONS,
    };

    if (filterValue?.trim()?.length) {
      query.where = { type: Not(WidgetTypeEnum.CAROUSEL), title: ILike(`${filterValue.toLowerCase().trim()}%`) };
    } else {
      query.where = { type: Not(WidgetTypeEnum.CAROUSEL) };
    }

    return this.widgetsRepository.find(query);
  }

  public async generateWidgetFeed(
    userId: string,
    { tags, pageNumber, limit, sendLength }: GetWidgetFeedDto,
  ): Promise<Partial<Widget>[] | { widgets: Partial<Widget>[]; length: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const widgetList = this.widgetsRepository.createQueryBuilder('widget');

    if (!user.exclusiveSubscription && user.role === UserRoleEnum.USER) {
      widgetList.andWhere('widget.isExclusive = FALSE');
    }

    // if (tags?.length) {
    //   widgetList
    //     .leftJoinAndSelect('widget.tags', 'tags', 'tags.id IN (:...tagIds)', {
    //       tagIds: tags,
    //     })
    //     .andWhere('(widget.type = :carouselType OR tags IS NOT NULL)', {
    //       carouselType: WidgetTypeEnum.CAROUSEL,
    //     })
    //     .leftJoinAndSelect(
    //       'widget.childWidgets',
    //       'children',
    //       '(children.expiration_date IS NULL OR children.expiration_date > :startDate)',
    //       {
    //         startDate: new Date(),
    //       },
    //     )
    //     .leftJoinAndSelect('children.tags', 'child_tags', 'child_tags.id IN (:...tagIds)', { tagIds: tags })
    //     .andWhere('(widget.type != :carouselType OR child_tags IS NOT NULL)', {
    //       carouselType: WidgetTypeEnum.CAROUSEL,
    //     });
    // } else {
    //   widgetList
    //     .leftJoinAndSelect(
    //       'widget.childWidgets',
    //       'children',
    //       '(children.expiration_date IS NULL OR children.expiration_date > :startDate)',
    //       {
    //         startDate: new Date(),
    //       },
    //     )
    //     .leftJoinAndSelect('widget.tags', 'tags')
    //     .leftJoinAndSelect('children.tags', 'child_tags');
    // }

    widgetList.leftJoinAndSelect('widget.channels', 'channels');

    if (user?.scans?.length) {
      widgetList.andWhere('widget.isExclusive = false OR channels.id IN (:...userChannels)', {
        userChannels: user.scans.map(item => item.channel.id),
      });
    } else {
      widgetList.andWhere('widget.isExclusive = false');
    }

    widgetList
      .andWhere('widget.parent_id IS NULL')
      .andWhere('(widget.expiration_date IS NULL OR widget.expiration_date > :startDate)', { startDate: new Date() })
      .orderBy('widget.expiration_date')
      .addOrderBy('widget.updatedAt', 'DESC')
      .leftJoinAndSelect('widget.stories', 'stories');

    // widgetList
    //   .leftJoinAndSelect('children.stories', 'childStories')
    //   .leftJoinAndSelect('channels.scans', 'scans', 'scans.objectId = widget.id')
    //   .leftJoinAndSelect('children.channels', 'child_channels')
    //   .leftJoinAndSelect('child_channels.scans', 'child_scans', 'child_scans.objectId = children.id');

    widgetList.leftJoinAndSelect('widget.users', 'favorites', 'favorites.id = :userId', { userId });

    let widgets = await widgetList.getMany();
    const widgetsLength = widgets?.length;

    if (pageNumber && limit) {
      // making pagination with js array method because typeorm query builder methods
      // offset+limit/skip+take don't work with joins properly
      widgets = widgets.slice((pageNumber - 1) * limit, pageNumber * limit);
    }

    const usersPromotion = await this.usersPromotionRepository.find({
      where: { user, isConfirmed: true },
      relations: ['promotion', 'promotion.widget'],
    });

    return sendLength
      ? { widgets: this.serializeWidgetList(widgets, usersPromotion), length: widgetsLength }
      : this.serializeWidgetList(widgets, usersPromotion);
  }

  public async getCarousel(): Promise<Partial<Omit<Widget, 'childWidgets'> & { childWidgets: Partial<Widget>[] }>> {
    const carousel = await this.widgetsRepository.findOne({
      where: { type: WidgetTypeEnum.CAROUSEL },
      join: {
        alias: 'carousel',
        leftJoinAndSelect: {
          childWidgets: 'carousel.childWidgets',
        },
      },
    });

    return {
      id: carousel.id,
      type: carousel.type,
      title: carousel.title,
      status: carousel.status,
      childWidgets: carousel.childWidgets.map(item => ({
        id: item.id,
        title: item.title,
        carouselTitle: item.carouselTitle,
        carouselPriority: item.carouselPriority,
      })),
    };
  }

  public async updateCarousel({ title, isExclusive, status, widgetsToAdd }: UpdateCarouselDto): Promise<Widget> {
    const carousel = await this.widgetsRepository.findOne({ where: { type: WidgetTypeEnum.CAROUSEL } });

    if (title) {
      carousel.title = title;
    }

    if (status) {
      carousel.status = status;
    }

    // != used for checking if exclusive value is neither null nor undefined
    if (isExclusive != null) {
      carousel.isExclusive = isExclusive;
    }

    await this.widgetsRepository.update(
      { id: Not(IsNull()) },
      {
        parentWidget: null,
        carouselTitle: null,
        carouselPriority: null,
      },
    );

    if (widgetsToAdd?.length) {
      await Promise.all(
        widgetsToAdd.map(item =>
          this.widgetsRepository.update(item.id, {
            parentWidget: carousel,
            carouselTitle: item.carouselTitle,
            carouselPriority: item.carouselPriority,
          }),
        ),
      );
    }

    await this.widgetsRepository.save(carousel);

    return this.widgetsRepository.findOne({
      where: { type: WidgetTypeEnum.CAROUSEL },
      join: { alias: 'widget', leftJoinAndSelect: { widgets: 'widget.childWidgets' } },
    });
  }
}
