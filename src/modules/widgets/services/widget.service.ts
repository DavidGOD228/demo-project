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
  AddThumbnailResponse,
  FilteredWidgetsResponse,
} from '../interfaces';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(Widget) private readonly widgetsRepository: Repository<Widget>,
    @InjectRepository(Promotion) private readonly promotionsRepository: Repository<Promotion>,
    @InjectRepository(Channel) private readonly channelsRepository: Repository<Channel>,
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
    private readonly fileService: FileService,
    private readonly csvService: ExportCsvService,
  ) {}

  public async getWidgetById(id: string): Promise<Widget> {
    const widget = await this.widgetsRepository.findOne({ where: { id }, relations: ['scans'] });

    if (!widget) {
      throw new NotFoundException();
    }

    return widget;
  }

  public async addFeedMedia(file: Express.Multer.File): Promise<AddFeedMediaResponse> {
    const { buffer, filename } = file;

    const feedMedia = await this.fileService.uploadRawMedia(buffer, filename, 'widgets');

    return { feedMedia: feedMedia };
  }

  public async addDetailsMedia(file: Express.Multer.File): Promise<AddDetailsMediaResponse> {
    const { buffer, filename } = file;

    const detailsMedia = await this.fileService.uploadRawMedia(buffer, filename, 'widgets');

    return { detailsMedia: detailsMedia };
  }

  public async addThumbnail(file: Express.Multer.File): Promise<AddThumbnailResponse> {
    const { buffer, filename } = file;

    const thumbnail = await this.fileService.uploadRawMedia(buffer, filename, 'widgets');

    return { thumbnail: thumbnail };
  }

  public async createWidget(body: CreateWidgetDto): Promise<Widget> {
    const {
      promotionButtonColor,
      promotionButtonText,
      channelsIds,
      tagsIds,
      title,
      description,
      backgroundColor,
      websiteUrl,
      type,
      exclusive,
      canBeShared,
      hasExpiration,
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
    } = body;

    const promotion = this.promotionsRepository.create({
      buttonColor: promotionButtonColor,
      buttonText: promotionButtonText,
      imageUrl: promotionMediaUrl,
    });

    await this.promotionsRepository.save(promotion);

    const channels = await this.channelsRepository.find({ where: { id: In(channelsIds) } });

    const widget = this.widgetsRepository.create({
      title: title,
      description: description,
      backgroundColor: backgroundColor,
      webViewUrl: websiteUrl,
      type: type,
      exclusive: exclusive,
      canBeShared: canBeShared,
      hasExpiration: hasExpiration,
      startDate: startDate,
      expirationDate: expirationDate,
      startTime: startTime,
      expirationTime: expirationTime,
      feedButtonText: feedButtonText,
      feedButtonColor: feedButtonColor,
      detailsButtonText: detailsButtonText,
      detailsButtonColor: detailsButtonColor,
      retailPrice: retailPrice,
      discount: discount,
      discountedPrice: discountedPrice,
      promotion: promotion,
      channels: channels,
      feedMediaUrl: feedMediaUrl,
      detailsMediaUrl: detailsMediaUrl,
      thumbnailUrl: thumbnailUrl,
    });

    if (tagsIds) {
      const tags = await this.tagsRepository.find({ where: { id: In(tagsIds) } });

      widget.tags = tags;
    }

    return await this.widgetsRepository.save(widget);
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
        'widgets.exclusive as exclusive',
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
    const { channelsIds, tagsIds } = body;

    const widget = await this.widgetsRepository.findOne({ where: { id: widgetId }, relations: ['channels', 'tags'] });

    if (channelsIds) {
      const channels = await this.channelsRepository.find({ where: { id: In(channelsIds) } });

      widget.channels = channels;
    }

    if (tagsIds) {
      const tags = await this.tagsRepository.find({ where: { id: In(tagsIds) } });

      widget.tags = tags;
    }

    const widgetUpdated = {
      ...widget,
      ...body,
      channels: widget.channels,
      tags: widget.tags,
    };

    return await this.widgetsRepository.save(widgetUpdated);
  }

  public async exportWidgetCsv(body: FilterWidgetsDto): Promise<string> {
    const widgets = await this.getFilteredWidgets(body);

    const csv = await this.csvService.exportCsv(widgets, 'Widgets');

    return csv;
  }
}
