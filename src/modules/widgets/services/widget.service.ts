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

  public async getWidgetById(id: string): Promise<Widget> {
    const widget = await this.widgetsRepository.findOne({ where: { id }, relations: ['scans'] });
    if (!widget) {
      throw new NotFoundException();
    }
    return widget;
  }

  public async generateWidgetFeed(userId: string, { tags, pageNumber, perPage }: GetWidgetFeedDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const widgetList = this.widgetsRepository
      .createQueryBuilder('widget')
      .where('widget.parent_id IS NULL')
      .andWhere('(widget.expire_at IS NULL OR widget.expire_at > :startDate)', { startDate: new Date() });

    if (!user.exclusiveSubscription && user.role === UserRoleEnum.USER) {
      widgetList.andWhere('widget.exclusive = FALSE');
    }

    if (tags?.length) {
      widgetList.innerJoin('widget.tags', 'tag', 'tag.id IN (:...tagIds)', { tagIds: tags });
    }

    if (perPage && pageNumber) {
      widgetList.skip((pageNumber - 1) * perPage).take(perPage);
    }

    return widgetList
      .orderBy('widget.expireAt')
      .addOrderBy('widget.updatedAt', 'DESC')
      .leftJoinAndSelect('widget.storyBlocks', 'stories')
      .leftJoinAndSelect('widget.childWidgets', 'children')
      .leftJoinAndSelect('children.storyBlocks', 'childStoryBlocks')
      .getMany();
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
