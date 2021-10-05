import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/modules/aws/services/file.service';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { ExportCsvService } from 'src/modules/config/services/csvExport.service';
import { Promotion } from 'src/modules/promotions/entities/promotion.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { In, Repository } from 'typeorm';
import { Widget } from '../entities/widget.entity';
import { CreateWidgetDto, EditWidgetDto, FilterWidgetsDto } from '../interfaces/widget.dto';
import {
  AddDetailsMediaResponse,
  AddFeedMediaResponse,
  AddStoryMedia,
  AddThumbnailResponse,
  DeleteWidgetResponse,
  FilteredWidgetsResponse,
} from '../interfaces';
import { User } from '../../users/entities/user.entity';
import { UserRoleEnum } from '../../users/interfaces/user.enum';
import { GetWidgetFeedDto } from '../interfaces/getWidgetFeed.dto';
import { UpdateCarouselDto } from '../interfaces/updateCarousel.dto';
import { WidgetTypeEnum } from '../interfaces/widget.enum';
import { StoryBlock } from '../entities/storyBlock.entity';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(Widget) private readonly widgetsRepository: Repository<Widget>,
    @InjectRepository(Promotion) private readonly promotionsRepository: Repository<Promotion>,
    @InjectRepository(Channel) private readonly channelsRepository: Repository<Channel>,
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(StoryBlock) private readonly storyRepository: Repository<StoryBlock>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileService: FileService,
    private readonly csvService: ExportCsvService,
  ) {}

  public serializeWidgetList(widgets: Partial<Widget>[]): Partial<Widget>[] {
    return widgets
      .map(widget => {
        const { stories, childWidgets } = widget;

        if (widget.type === WidgetTypeEnum.CAROUSEL && widget.childWidgets.length === 1) {
          return widget.childWidgets[0];
        }

        return {
          ...widget,
          stories: stories?.length ? stories.sort((a, b) => a.priority - b.priority) : undefined,
          childWidgets: childWidgets.length
            ? childWidgets.sort((a, b) => a.carouselPriority - b.carouselPriority)
            : undefined,
        };
      })
      .filter(widget => !!widget);
  }

  public async getWidgetById(id: string): Promise<Widget> {
    const widget = await this.widgetsRepository.findOne({ where: { id }, relations: ['scans'] });

    if (!widget) {
      throw new NotFoundException();
    }

    return widget;
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

  public async addStoryMedia({ buffer, filename }: Express.Multer.File): Promise<AddStoryMedia> {
    const storyAssetUrl = await this.fileService.uploadRawMedia(buffer, filename, 'stories');

    return { storyAssetUrl };
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
    feedMediaUrl,
    detailsMediaUrl,
    thumbnailUrl,
    storiesToAdd,
  }: CreateWidgetDto): Promise<Widget> {
    if (type === WidgetTypeEnum.POST) {
      const promotion = this.promotionsRepository.create({
        buttonColor: promotionButtonColor,
        buttonText: promotionButtonText,
        imageUrl: promotionMediaUrl,
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
      });

      if (tagIds?.length) {
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
      });

      const stories = storiesToAdd.map(story =>
        this.storyRepository.create({
          assetUrl: story.assetUrl,
          swipeUrl: story.swipeUrl,
          type: story.type,
          priority: story.priority,
        }),
      );

      await this.storyRepository.save(stories);

      if (tagIds) {
        const tags = await this.tagsRepository.find({ where: { id: In(tagIds) } });

        widget.tags = tags;
      }

      widget.stories = stories;

      return this.widgetsRepository.save(widget);
    }
  }

  public async getFilteredWidgets(filterWidgets: FilterWidgetsDto): Promise<FilteredWidgetsResponse[]> {
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
      .addSelect("array_to_string(array_agg(CONCAT_WS(' ', channel.league, channel.type)), ', ')", 'channels')
      .limit(take)
      .offset((skip - 1) * take)
      .orderBy(sortField, sortOrder === 'DESC' ? 'DESC' : 'ASC')
      .groupBy('widgets.id');

    if (filteringType) {
      query.where('widgets.type IN (:...types)', { types: filteringType });
    }

    const widgets = await query.getRawMany();

    return widgets;
  }

  public async editWidgets(widgetId: string, body: EditWidgetDto): Promise<Widget> {
    const { channelIds, tagIds, storiesToAdd } = body;
    const widget = await this.widgetsRepository.findOne({
      where: { id: widgetId },
      relations: ['channels', 'tags', 'stories'],
    });

    if (channelIds) {
      const channels = await this.channelsRepository.find({ where: { id: In(channelIds) } });

      widget.channels = channels;
    }

    if (tagIds) {
      const tags = await this.tagsRepository.find({ where: { id: In(tagIds) } });

      widget.tags = tags;
    }

    if (storiesToAdd?.length) {
      await this.storyRepository
        .createQueryBuilder('stories')
        .leftJoin('stories.widget', 'widget')
        .delete()
        .where('widget.id = :widgetId', { widgetId: widget.id })
        .execute();

      const stories = storiesToAdd.map(story =>
        this.storyRepository.create({
          assetUrl: story.assetUrl,
          swipeUrl: story.swipeUrl,
          type: story.type,
          priority: story.priority,
          widget,
        }),
      );

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

    return await this.widgetsRepository.save(widgetUpdated);
  }

  public async deleteWidgetById(id: string): Promise<DeleteWidgetResponse> {
    const widget = await this.widgetsRepository.findOne(id);

    await this.widgetsRepository.remove(widget);

    return { message: 'Widget was successfully deleted!' };
  }

  public async exportWidgetCsv(body: FilterWidgetsDto): Promise<string> {
    const widgets = await this.getFilteredWidgets(body);

    const csv = await this.csvService.exportCsv(widgets, 'Widgets');

    return csv;
  }

  public async generateWidgetFeed(
    userId: string,
    { tags, pageNumber, limit }: GetWidgetFeedDto,
  ): Promise<Partial<Widget>[]> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['scans', 'scans.channel'] });

    console.log(user.scans.map(item => item.channel.id));

    const widgetList = this.widgetsRepository
      .createQueryBuilder('widget')
      .where('widget.parent_id IS NULL')
      .andWhere('(widget.expires_at IS NULL OR widget.expires_at > :startDate)', { startDate: new Date() });

    if (!user.exclusiveSubscription && user.role === UserRoleEnum.USER) {
      widgetList.andWhere('widget.isExclusive = FALSE');
    }

    if (user.scans?.length) {
      widgetList
        .leftJoin('widget.channels', 'channels')
        .andWhere('widget.isExclusive = false OR channels.id IN (:...userChannels)', {
          userChannels: user.scans.map(item => item.channel.id),
        });
    } else {
      widgetList.andWhere('widget.isExclusive = false');
    }

    if (tags?.length) {
      widgetList
        .leftJoin('widget.tags', 'tags', 'tags.id IN (:...tagIds)', {
          tagIds: tags,
        })
        .andWhere('(widget.type = :carouselType OR tags IS NOT NULL)', {
          carouselType: WidgetTypeEnum.CAROUSEL,
        })
        .leftJoin(
          'widget.childWidgets',
          'childWidgets',
          '(childWidgets.expires_at IS NULL OR childWidgets.expires_at > :startDate)',
          {
            startDate: new Date(),
          },
        )
        .leftJoin('childWidgets.tags', 'child_tags', 'child_tags.id IN (:...tagIds)', { tagIds: tags })
        .andWhere('(widget.type != :carouselType OR child_tags IS NOT NULL)', {
          carouselType: WidgetTypeEnum.CAROUSEL,
        });
    }

    widgetList
      .orderBy('widget.expiresAt')
      .addOrderBy('widget.updatedAt', 'DESC')
      .leftJoinAndSelect('widget.stories', 'stories')
      .leftJoinAndSelect(
        'widget.childWidgets',
        'children',
        '(children.expires_at IS NULL OR children.expires_at > :startDate)',
        {
          startDate: new Date(),
        },
      );

    if (limit && pageNumber) {
      widgetList.skip((pageNumber - 1) * limit).take(limit);
    }

    widgetList.leftJoinAndSelect('children.stories', 'childStories').leftJoinAndSelect('widget.scans', 'scans');

    const widgets = await widgetList.getMany();

    return this.serializeWidgetList(widgets);
  }

  public async updateCarousel({
    title,
    isExclusive,
    widgetsToAdd,
    widgetsToRemove,
  }: UpdateCarouselDto): Promise<Widget> {
    const carousel = await this.widgetsRepository.findOne({ where: { type: WidgetTypeEnum.CAROUSEL } });

    if (title) {
      carousel.title = title;
    }

    // != used for checking if exclusive value is neither null nor undefined
    if (isExclusive != null) {
      carousel.isExclusive = isExclusive;
    }

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

    if (widgetsToRemove?.length) {
      await this.widgetsRepository.update(widgetsToRemove, {
        parentWidget: null,
        carouselTitle: null,
        carouselPriority: null,
      });
    }

    await this.widgetsRepository.save(carousel);

    return this.widgetsRepository.findOne({
      where: { type: WidgetTypeEnum.CAROUSEL },
      join: { alias: 'widget', leftJoinAndSelect: { widgets: 'widget.childWidgets' } },
    });
  }
}
