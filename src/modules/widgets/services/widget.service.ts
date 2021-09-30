import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Widget } from '../entities/widget.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoleEnum } from '../../users/interfaces/user.enum';
import { GetWidgetFeedDto } from '../interfaces/getWidgetFeed.dto';
import { UpdateCarouselDto } from '../interfaces/updateCarousel.dto';
import { WidgetTypeEnum } from '../interfaces/widget.enum';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Widget)
    private readonly widgetsRepository: Repository<Widget>,
  ) {}

  public serializeWidgetList(widgets: Partial<Widget>[]): Partial<Widget>[] {
    return widgets
      .map(widget => {
        const { storyBlocks, childWidgets } = widget;

        if (widget.type === WidgetTypeEnum.CAROUSEL && widget.childWidgets.length === 1) {
          return widget.childWidgets[0];
        }

        return {
          ...widget,
          storyBlocks: storyBlocks?.length ? storyBlocks.sort((a, b) => a.priority - b.priority) : undefined,
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

  public async generateWidgetFeed(
    userId: string,
    { tags, pageNumber, perPage }: GetWidgetFeedDto,
  ): Promise<Partial<Widget>[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const widgetList = this.widgetsRepository
      .createQueryBuilder('widget')
      .where('widget.parent_id IS NULL')
      .andWhere('(widget.expire_at IS NULL OR widget.expire_at > :startDate)', { startDate: new Date() });

    if (!user.exclusiveSubscription && user.role === UserRoleEnum.USER) {
      widgetList.andWhere('widget.exclusive = FALSE');
    }

    if (tags?.length) {
      widgetList
        .leftJoin('widget.tags', 'tags', 'tags.id IN (:...tagIds)', {
          tagIds: tags,
        })
        .andWhere('(widget.type = :carouselType OR tags IS NOT NULL)', {
          carouselType: WidgetTypeEnum.CAROUSEL,
        });
    }

    widgetList
      .orderBy('widget.expireAt')
      .addOrderBy('widget.updatedAt', 'DESC')
      .leftJoinAndSelect('widget.storyBlocks', 'stories');

    if (tags?.length) {
      widgetList
        .leftJoin(
          'widget.childWidgets',
          'childWidgets',
          '(childWidgets.expire_at IS NULL OR childWidgets.expire_at > :startDate)',
          {
            startDate: new Date(),
          },
        )
        .leftJoin('childWidgets.tags', 'child_tags', 'child_tags.id IN (:...tagIds)', { tagIds: tags })
        .andWhere('(widget.type != :carouselType OR child_tags IS NOT NULL)', {
          carouselType: WidgetTypeEnum.CAROUSEL,
        });
    }

    widgetList.leftJoinAndSelect(
      'widget.childWidgets',
      'children',
      '(children.expire_at IS NULL OR children.expire_at > :startDate)',
      {
        startDate: new Date(),
      },
    );

    if (perPage && pageNumber) {
      widgetList.skip((pageNumber - 1) * perPage).take(perPage);
    }

    widgetList.leftJoinAndSelect('children.storyBlocks', 'childStoryBlocks');

    const widgets = await widgetList.getMany();

    return this.serializeWidgetList(widgets);
  }

  public async updateCarousel({
    title,
    exclusive,
    addToCarousel,
    removeFromCarousel,
  }: UpdateCarouselDto): Promise<Widget> {
    const carousel = await this.widgetsRepository.findOne({ where: { type: WidgetTypeEnum.CAROUSEL } });

    if (title) {
      carousel.title = title;
    }

    // != used for checking if exclusive value is neither null nor undefined
    if (exclusive != null) {
      carousel.exclusive = exclusive;
    }

    if (addToCarousel?.length) {
      await Promise.all(
        addToCarousel.map(item =>
          this.widgetsRepository.update(item.id, {
            parent: carousel,
            carouselTitle: item.carouselTitle,
            carouselPriority: item.carouselPriority,
          }),
        ),
      );
    }

    if (removeFromCarousel?.length) {
      await this.widgetsRepository.update(removeFromCarousel, {
        parent: null,
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
